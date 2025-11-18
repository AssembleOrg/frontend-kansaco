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

  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, newQuantity: number) => Promise<void>;
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

// Mutex-like lock to prevent race conditions in cart operations
let cartLock = false;
const cartLockTimeout = 5000; // 5 seconds max lock time

const acquireCartLock = async (): Promise<boolean> => {
  if (cartLock) {
    return false;
  }
  cartLock = true;
  // Auto-release lock after timeout to prevent deadlocks
  setTimeout(() => {
    cartLock = false;
  }, cartLockTimeout);
  return true;
};

const releaseCartLock = () => {
  cartLock = false;
};

// Function to generate unique ID for local cart items
const generateLocalItemId = () => Date.now() + Math.random();

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: { ...initialCartState },
      isLoading: false,
      error: null,
      isCartOpen: false,
      syncWithServer: async () => {
        if (!acquireCartLock()) {
          logger.warn('syncWithServer: Operation already in progress, skipping');
          return;
        }

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
      addToCart: async (product: Product, quantityToAdd: number) => {
        if (!acquireCartLock()) {
          logger.warn('addToCart: Operation already in progress, skipping');
          return;
        }

        try {
          const authState = useAuthStore.getState();
          if (!authState.token || !authState.user?.id) {
            logger.debug('addToCart: User not authenticated.');
            return;
          }

          set({ isLoading: true, error: null });
          const currentCart = get().cart;

        // ESTRATEGIA HÍBRIDA: Intentar servidor primero, si falla usar local
        if (currentCart.id > 0) {
          // Tenemos carrito del servidor, intentar agregar ahí
          try {
            const existingItem = currentCart.items.find(
              (item) => item.product.id === product.id
            );
            const newQuantity = existingItem ? existingItem.quantity + quantityToAdd : quantityToAdd;

            logger.debug(`addToCart: Attempting to add to server (cart ID ${currentCart.id})`);
            const response = await addProductToCart(
              currentCart.id,
              product.id,
              newQuantity,
              authState.token
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
        
        const existingItemIndex = currentCart.items.findIndex(
          (item) => item.product.id === product.id
        );

        let updatedItems = [...currentCart.items];
        
        if (existingItemIndex >= 0) {
          // Update quantity of existing item
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantityToAdd
          };
        } else {
          // Add new item
          const newItem: CartItemType = {
            id: generateLocalItemId(),
            quantity: quantityToAdd,
            product: product
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

      removeFromCart: async (cartItemIdToRemove: number) => {
        if (!acquireCartLock()) {
          logger.warn('removeFromCart: Operation already in progress, skipping');
          return;
        }

        try {
          const authState = useAuthStore.getState();
          if (!authState.token || !authState.user?.id) {
            logger.debug('removeFromCart: User not authenticated.');
            return;
          }

          set({ isLoading: true, error: null });
          const currentCart = get().cart;
        
        const itemToRemove = currentCart.items.find(
          (item) => item.id === cartItemIdToRemove
        );

        if (!itemToRemove) {
          set({
            isLoading: false,
            error: 'Item not found in cart.',
          });
          return;
        }

        // HYBRID STRATEGY: Try server first, if fails use local
        if (currentCart.id > 0) {
          try {
            logger.debug(`removeFromCart: Attempting to remove from server (cart ID ${currentCart.id})`);
            const response = await removeProductFromCart(
              currentCart.id,
              itemToRemove.product.id,
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
        
        const updatedItems = currentCart.items.filter(
          (item) => item.id !== cartItemIdToRemove
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

      updateQuantity: async (cartItemIdToUpdate: number, newTotalQuantity: number) => {
        if (newTotalQuantity <= 0) {
          await get().removeFromCart(cartItemIdToUpdate);
          return;
        }

        if (!acquireCartLock()) {
          logger.warn('updateQuantity: Operation already in progress, skipping');
          return;
        }

        try {
          const authState = useAuthStore.getState();
          if (!authState.token || !authState.user?.id) {
            logger.debug('updateQuantity: User not authenticated.');
            return;
          }

          set({ isLoading: true, error: null });
          const currentCart = get().cart;
        
        const itemToUpdate = currentCart.items.find(
          (item) => item.id === cartItemIdToUpdate
        );

        if (!itemToUpdate) {
          set({
            isLoading: false,
            error: 'Item not found for update.',
          });
          return;
        }

        // HYBRID STRATEGY: Try server first, if fails use local
        if (currentCart.id > 0) {
          try {
            logger.debug(`updateQuantity: Attempting to update on server (cart ID ${currentCart.id})`);
            const response = await addProductToCart(
              currentCart.id,
              itemToUpdate.product.id,
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
        
        const updatedItems = currentCart.items.map(item =>
          item.id === cartItemIdToUpdate
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
        if (!acquireCartLock()) {
          logger.warn('clearCart: Operation already in progress, skipping');
          return;
        }

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
