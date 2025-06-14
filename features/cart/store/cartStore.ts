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

// Función para generar ID único para items del carrito local
const generateLocalItemId = () => Date.now() + Math.random();

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: { ...initialCartState },
      isLoading: false,
      error: null,
      isCartOpen: false,
      //syncWithServer test manejar con Zustand ?
      syncWithServer: async () => {
        const authState = useAuthStore.getState();
        if (!authState.token || !authState.user?.id) {
          console.log('syncWithServer: No autenticado, usando carrito local.');
          set({
            isLoading: false,
            error: null,
            cart: { ...initialCartState },
          });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          // Intentar obtener carrito del servidor
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
            console.log('syncWithServer: Carrito sincronizado con servidor.', userCartResponse.data);
          } else {
            console.log('syncWithServer: Servidor no disponible, continuando con carrito local.');
            set({
              isLoading: false,
              error: null,
              cart: { 
                ...get().cart, // Mantener carrito local existente
                userId: authState.user.id,
              },
            });
          }
        } catch (error: unknown) {
          // Si falla el servidor, continuar con carrito local
          logger.info('syncWithServer: Servidor no disponible, continuando con carrito local.');
          set({
            isLoading: false,
            error: null,
            cart: { 
              ...get().cart, // Mantener carrito local existente
              userId: authState.user.id,
            },
          });
        }
      },

      // CARRITO LOCAL ROBUSTO: Funciona siempre, con o sin servidor
      addToCart: async (product: Product, quantityToAdd: number) => {
        const authState = useAuthStore.getState();
        if (!authState.token || !authState.user?.id) {
          console.log('addToCart: Usuario no autenticado.');
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

            console.log(`addToCart: Intentando agregar al servidor (carrito ID ${currentCart.id})`);
            const response = await addProductToCart(
              currentCart.id,
              product.id,
              newQuantity,
              authState.token
            );
            
            if (response?.data?.id) {
              set({ cart: response.data, isLoading: false, error: null });
              console.log('addToCart: Producto agregado al servidor exitosamente.');
              return;
            }
          } catch (error) {
            console.log('addToCart: Servidor falló, usando carrito local:', error);
          }
        }

        // CARRITO LOCAL: Siempre funciona
        console.log(`addToCart: Agregando ${quantityToAdd} de ${product.name} al carrito local`);
        
        const existingItemIndex = currentCart.items.findIndex(
          (item) => item.product.id === product.id
        );

        let updatedItems = [...currentCart.items];
        
        if (existingItemIndex >= 0) {
          // Actualizar cantidad del item existente
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantityToAdd
          };
        } else {
          // Agregar nuevo item
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
          id: currentCart.id || -1 // -1 indica carrito local
        };

        set({ cart: updatedCart, isLoading: false, error: null });
        console.log('addToCart: Producto agregado al carrito local exitosamente.');
      },

      removeFromCart: async (cartItemIdToRemove: number) => {
        const authState = useAuthStore.getState();
        if (!authState.token || !authState.user?.id) {
          console.log('removeFromCart: Usuario no autenticado.');
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
            error: 'Item no encontrado en carrito.',
          });
          return;
        }

        // ESTRATEGIA HÍBRIDA: Intentar servidor primero, si falla usar local
        if (currentCart.id > 0) {
          try {
            console.log(`removeFromCart: Intentando eliminar del servidor (carrito ID ${currentCart.id})`);
            const response = await removeProductFromCart(
              currentCart.id,
              itemToRemove.product.id,
              authState.token
            );
            
            if (response?.data?.id) {
              set({ cart: response.data, isLoading: false, error: null });
              console.log('removeFromCart: Producto eliminado del servidor exitosamente.');
              return;
            }
          } catch (error) {
            console.log('removeFromCart: Servidor falló, usando carrito local:', error);
          }
        }

        // CARRITO LOCAL: Siempre funciona
        console.log(`removeFromCart: Eliminando ${itemToRemove.product.name} del carrito local`);
        
        const updatedItems = currentCart.items.filter(
          (item) => item.id !== cartItemIdToRemove
        );

        const updatedCart: Cart = {
          ...currentCart,
          items: updatedItems,
          updateAt: new Date().toISOString()
        };

        set({ cart: updatedCart, isLoading: false, error: null });
        console.log('removeFromCart: Producto eliminado del carrito local exitosamente.');
      },

      updateQuantity: async (cartItemIdToUpdate: number, newTotalQuantity: number) => {
        if (newTotalQuantity <= 0) {
          await get().removeFromCart(cartItemIdToUpdate);
          return;
        }

        const authState = useAuthStore.getState();
        if (!authState.token || !authState.user?.id) {
          console.log('updateQuantity: Usuario no autenticado.');
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
            error: 'Item no encontrado para actualizar.',
          });
          return;
        }

        // ESTRATEGIA HÍBRIDA: Intentar servidor primero, si falla usar local
        if (currentCart.id > 0) {
          try {
            console.log(`updateQuantity: Intentando actualizar en servidor (carrito ID ${currentCart.id})`);
            const response = await addProductToCart(
              currentCart.id,
              itemToUpdate.product.id,
              newTotalQuantity,
              authState.token
            );
            
            if (response?.data?.id) {
              set({ cart: response.data, isLoading: false, error: null });
              console.log('updateQuantity: Cantidad actualizada en servidor exitosamente.');
              return;
            }
          } catch (error) {
            console.log('updateQuantity: Servidor falló, usando carrito local:', error);
          }
        }

        // CARRITO LOCAL: Siempre funciona
        console.log(`updateQuantity: Actualizando ${itemToUpdate.product.name} a cantidad ${newTotalQuantity} en carrito local`);
        
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
        console.log('updateQuantity: Cantidad actualizada en carrito local exitosamente.');
      },

      clearCart: async () => {
        const authState = useAuthStore.getState();
        const currentCart = get().cart;

        if (!authState.token || !authState.user?.id) {
          // Si no está autenticado, solo limpiar local
          set({ cart: { ...initialCartState }, isLoading: false, error: null });
          console.log('clearCart: Carrito local limpiado.');
          return;
        }

        set({ isLoading: true, error: null });

        // ESTRATEGIA HÍBRIDA: Intentar servidor primero, si falla usar local
        if (currentCart.id > 0) {
          try {
            console.log(`clearCart: Intentando vaciar carrito del servidor ID: ${currentCart.id}`);
            const response = await emptyCart(currentCart.id, authState.token);
            
            if (response?.data?.id) {
              set({ cart: response.data, isLoading: false, error: null });
              console.log('clearCart: Carrito del servidor vaciado exitosamente.');
              return;
            }
          } catch (error) {
            console.log('clearCart: Servidor falló, vaciando carrito local:', error);
          }
        }

        // CARRITO LOCAL: Siempre funciona
        const clearedCart: Cart = {
          ...initialCartState,
          userId: authState.user.id,
          id: -1 // Carrito local
        };

        set({ cart: clearedCart, isLoading: false, error: null });
        console.log('clearCart: Carrito local vaciado exitosamente.');
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
