// features/cart/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, Product, CartItem as CartItemType } from '@/types';
import {
  getUserCart,
  createCart,
  addProductToCart,
  removeProductFromCart,
  emptyCart,
} from '@/lib/api';
import { useAuthStore } from '@/features/auth/store/authStore';
import { logger } from '@/lib/logger';

interface CartState {
  cart: Cart;
  isLoading: boolean;
  error: string | null;
  isCartOpen: boolean;

  addToCart: (product: Product, quantity: number, presentation?: string) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, newQuantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithServer: () => Promise<void>;

  toggleCart: () => void;
  closeCart: () => void;
  openCart: () => void;
}

const initialCartState: Cart = {
  id: 0,
  createdAt: new Date().toISOString(),
  updateAt: new Date().toISOString(),
  userId: '',
  items: [],
};

// Queue-based lock to handle concurrent cart operations properly
let cartLock = false;
const lockQueue: Array<() => void> = [];

const acquireCartLock = async (): Promise<boolean> => {
  if (!cartLock) {
    cartLock = true;
    return true;
  }

  // Wait in queue for lock to be released
  return new Promise((resolve) => {
    lockQueue.push(() => {
      cartLock = true;
      resolve(true);
    });
  });
};

const releaseCartLock = () => {
  if (lockQueue.length > 0) {
    // Give lock to next in queue
    const next = lockQueue.shift();
    if (next) next();
  } else {
    cartLock = false;
  }
};

// Function to generate unique ID for local cart items
const generateLocalItemId = () => Math.floor(Date.now() + Math.random() * 1000);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: { ...initialCartState },
      isLoading: false,
      error: null,
      isCartOpen: false,
      syncWithServer: async () => {
        await acquireCartLock();

        try {
          const authState = useAuthStore.getState();
          if (!authState.token || !authState.user?.id) {
            logger.debug('syncWithServer: Not authenticated, using local cart.');
            set({
              isLoading: false,
              error: null,
              cart: { ...initialCartState },
            });
            return;
          }

          set({ isLoading: true, error: null });
          
          // Try to get cart from server
          const userCartResponse = await getUserCart(
            authState.user.id,
            authState.token
          );
          
          if (userCartResponse?.data?.id) {
            set({
              cart: userCartResponse.data,
              isLoading: false,
              error: null,
            });
            logger.debug('syncWithServer: Cart synchronized with server.', userCartResponse.data);
          } else {
            logger.info('syncWithServer: Server unavailable, continuing with local cart.');
            set({
              isLoading: false,
              error: null,
              cart: { 
                ...get().cart, // Keep existing local cart
                userId: authState.user.id,
              },
            });
          }
        } catch (error: unknown) {
          // If server fails, continue with local cart
          logger.info('syncWithServer: Server unavailable, continuing with local cart.');
          const authState = useAuthStore.getState();
          set({
            isLoading: false,
            error: null,
            cart: { 
              ...get().cart, // Keep existing local cart
              userId: authState.user?.id || '',
            },
          });
        } finally {
          releaseCartLock();
        }
      },

      // ROBUST LOCAL CART: Always works, with or without server
      addToCart: async (product: Product, quantityToAdd: number, presentation?: string) => {
        await acquireCartLock();

        try {
          const authState = useAuthStore.getState();
          if (!authState.token || !authState.user?.id) {
            logger.debug('addToCart: User not authenticated.');
            releaseCartLock();
            return;
          }

          set({ isLoading: true, error: null });
          const currentCart = get().cart;

        // ESTRATEGIA HÍBRIDA: Intentar servidor primero, si falla usar local
        if (currentCart.id > 0) {
          // Tenemos carrito del servidor, intentar agregar ahí
          try {
            // Buscar item existente con el mismo producto Y la misma presentación
            const existingItem = currentCart.items.find(
              (item) => 
                item.product.id === product.id && 
                item.presentation === presentation
            );
            const newQuantity = existingItem ? existingItem.quantity + quantityToAdd : quantityToAdd;

            logger.debug(`addToCart: Attempting to add to server (cart ID ${currentCart.id})`);
            const response = await addProductToCart(
              currentCart.id,
              product.id,
              newQuantity,
              authState.token,
              presentation
            );
            
            if (response?.data?.id) {
              set({ cart: response.data, isLoading: false, error: null });
              logger.debug('addToCart: Product added to server successfully.');
              return;
            }
          } catch (error) {
            logger.info('addToCart: Server failed, using local cart:', error);
          }
        }

        // LOCAL CART: Always works
        logger.debug(`addToCart: Adding ${quantityToAdd} of ${product.name} to local cart`);
        
        // Buscar item existente con el mismo producto Y la misma presentación
        const existingItemIndex = currentCart.items.findIndex(
          (item) => 
            item.product.id === product.id && 
            item.presentation === presentation
        );

        let updatedItems = [...currentCart.items];
        
        if (existingItemIndex >= 0) {
          // Update quantity of existing item with same presentation
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantityToAdd
          };
        } else {
          // Add new item (different presentation or new product)
          const newItem: CartItemType = {
            id: generateLocalItemId(),
            quantity: quantityToAdd,
            product: product,
            presentation: presentation
          };
          updatedItems.push(newItem);
        }

        const updatedCart: Cart = {
          ...currentCart,
          items: updatedItems,
          updateAt: new Date().toISOString(),
          userId: authState.user.id,
          id: currentCart.id || -1 // -1 indicates local cart
        };

        set({ cart: updatedCart, isLoading: false, error: null });
        logger.debug('addToCart: Product added to local cart successfully.');
        } finally {
          releaseCartLock();
        }
      },

      removeFromCart: async (productIdToRemove: number) => {
        await acquireCartLock();

        try {
          const authState = useAuthStore.getState();
          if (!authState.token || !authState.user?.id) {
            logger.debug('removeFromCart: User not authenticated.');
            releaseCartLock();
            return;
          }

          set({ isLoading: true, error: null });
          const currentCart = get().cart;

        // Find item by product.id instead of item.id
        const itemToRemove = currentCart.items.find(
          (item) => item.product.id === productIdToRemove
        );

        if (!itemToRemove) {
          set({
            isLoading: false,
            error: 'Item not found in cart.',
          });
          releaseCartLock();
          return;
        }

        // HYBRID STRATEGY: Try server first, if fails use local
        if (currentCart.id > 0) {
          try {
            logger.debug(`removeFromCart: Attempting to remove from server (cart ID ${currentCart.id})`);
            const response = await removeProductFromCart(
              currentCart.id,
              productIdToRemove,
              authState.token
            );

            if (response?.data?.id) {
              set({ cart: response.data, isLoading: false, error: null });
              logger.debug('removeFromCart: Product removed from server successfully.');
              return;
            }
          } catch (error) {
            logger.info('removeFromCart: Server failed, using local cart:', error);
          }
        }

        // LOCAL CART: Always works
        logger.debug(`removeFromCart: Removing ${itemToRemove.product.name} from local cart`);

        // Filter by product.id instead of item.id
        const updatedItems = currentCart.items.filter(
          (item) => item.product.id !== productIdToRemove
        );

        const updatedCart: Cart = {
          ...currentCart,
          items: updatedItems,
          updateAt: new Date().toISOString()
        };

        set({ cart: updatedCart, isLoading: false, error: null });
        logger.debug('removeFromCart: Product removed from local cart successfully.');
        } finally {
          releaseCartLock();
        }
      },

      updateQuantity: async (productIdToUpdate: number, newTotalQuantity: number) => {
        if (newTotalQuantity <= 0) {
          await get().removeFromCart(productIdToUpdate);
          return;
        }

        await acquireCartLock();

        try {
          const authState = useAuthStore.getState();
          if (!authState.token || !authState.user?.id) {
            logger.debug('updateQuantity: User not authenticated.');
            releaseCartLock();
            return;
          }

          set({ isLoading: true, error: null });
          const currentCart = get().cart;

        // Find item by product.id instead of item.id
        const itemToUpdate = currentCart.items.find(
          (item) => item.product.id === productIdToUpdate
        );

        if (!itemToUpdate) {
          set({
            isLoading: false,
            error: 'Item not found for update.',
          });
          releaseCartLock();
          return;
        }

        // HYBRID STRATEGY: Try server first, if fails use local
        if (currentCart.id > 0) {
          try {
            logger.debug(`updateQuantity: Attempting to update on server (cart ID ${currentCart.id})`);
            const response = await addProductToCart(
              currentCart.id,
              productIdToUpdate,
              newTotalQuantity,
              authState.token
            );

            if (response?.data?.id) {
              set({ cart: response.data, isLoading: false, error: null });
              logger.debug('updateQuantity: Quantity updated on server successfully.');
              return;
            }
          } catch (error) {
            logger.info('updateQuantity: Server failed, using local cart:', error);
          }
        }

        // LOCAL CART: Always works
        logger.debug(`updateQuantity: Updating ${itemToUpdate.product.name} to quantity ${newTotalQuantity} in local cart`);

        // Update by product.id instead of item.id
        const updatedItems = currentCart.items.map(item =>
          item.product.id === productIdToUpdate
            ? { ...item, quantity: newTotalQuantity }
            : item
        );

        const updatedCart: Cart = {
          ...currentCart,
          items: updatedItems,
          updateAt: new Date().toISOString()
        };

        set({ cart: updatedCart, isLoading: false, error: null });
        logger.debug('updateQuantity: Quantity updated in local cart successfully.');
        } finally {
          releaseCartLock();
        }
      },

      clearCart: async () => {
        await acquireCartLock();

        try {
          const authState = useAuthStore.getState();
          const currentCart = get().cart;

          if (!authState.token || !authState.user?.id) {
            // If not authenticated, only clear local
            set({ cart: { ...initialCartState }, isLoading: false, error: null });
            logger.debug('clearCart: Local cart cleared.');
            return;
          }

          set({ isLoading: true, error: null });

          // HYBRID STRATEGY: Try server first, if fails use local
          if (currentCart.id > 0) {
            try {
              logger.debug(`clearCart: Attempting to empty server cart ID: ${currentCart.id}`);
              const response = await emptyCart(currentCart.id, authState.token);
              
              if (response?.data?.id) {
                set({ cart: response.data, isLoading: false, error: null });
                logger.debug('clearCart: Server cart emptied successfully.');
                return;
              }
            } catch (error) {
              logger.info('clearCart: Server failed, emptying local cart:', error);
            }
          }

          // LOCAL CART: Always works
          const clearedCart: Cart = {
            ...initialCartState,
            userId: authState.user.id,
            id: -1 // Local cart
          };

          set({ cart: clearedCart, isLoading: false, error: null });
          logger.debug('clearCart: Local cart emptied successfully.');
        } finally {
          releaseCartLock();
        }
      },

      // Funciones para UI del carrito (drawer)
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      closeCart: () => set({ isCartOpen: false }),
      openCart: () => set({ isCartOpen: true }),
    }),
    {
      name: 'cart-storage',
      // Solo persistir el carrito, no el estado de loading/error
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
