// features/cart/store/cartStore.ts
import { create } from 'zustand';
import {
  persist,
  createJSONStorage,
  devtools,
  StateStorage,
} from 'zustand/middleware';
import { Cart, Product, CartItem as CartItemType } from '@/types';
import {
  getUserCart,
  createCart,
  addProductToCart,
  removeProductFromCart,
  emptyCart,
} from '@/lib/api';
import { useAuthStore } from '@/features/auth/store/authStore';

let localCartItemCounter = 0;
const generateLocalCartItemId = (): number => {
  localCartItemCounter += 1;
  return Date.now() + localCartItemCounter;
};

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
  mergeLocalCartToServer: () => Promise<void>;

  toggleCart: () => void;
  closeCart: () => void;
  openCart: () => void;
}

const isLocalStorageAvailable = (): StateStorage | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    const testKey = 'zustand-test-cart';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return localStorage;
  } catch (e) {
    console.warn('localStorage no disponible o restringido en cart store:', e);
    return undefined;
  }
};

const initialCartState: Cart = {
  id: 0, // 0 indica carrito local/no sincronizado con servidor
  createdAt: new Date().toISOString(),
  updateAt: new Date().toISOString(),
  userId: '',
  items: [],
};

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        cart: { ...initialCartState },
        isLoading: false,
        error: null,
        isCartOpen: false,

        // Sincroniza/Obtiene el carrito del servidor si el usuario está logueado
        syncWithServer: async () => {
          const authState = useAuthStore.getState();
          if (!authState.token || !authState.user?.id) {
            console.log(
              'syncWithServer: No autenticado, no se puede sincronizar/obtener carrito del servidor.'
            );
            set({
              isLoading: false,
              error: null,
              cart: { ...get().cart, id: 0, userId: '' },
            });
            return;
          }

          set({ isLoading: true, error: null });
          try {
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
              console.log(
                'syncWithServer: Carrito obtenido del servidor.',
                userCartResponse.data
              );
            } else {
              console.log(
                'syncWithServer: No hay carrito existente en servidor para el usuario, creando uno nuevo (vacío)...'
              );
              const newCartResponse = await createCart(authState.token);
              if (newCartResponse?.data?.id) {
                set({
                  cart: newCartResponse.data,
                  isLoading: false,
                  error: null,
                });
                console.log(
                  'syncWithServer: Nuevo carrito creado en servidor.',
                  newCartResponse.data
                );
              } else {
                set({
                  isLoading: false,
                  error: 'No se pudo crear un nuevo carrito en el servidor.',
                  cart: { ...initialCartState },
                });
                console.error(
                  'syncWithServer: Fallo al crear carrito en servidor.'
                );
              }
            }
          } catch (error: unknown) {
            console.error('syncWithServer: Error:', error);
            set({
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Error al sincronizar el carrito.',
              cart: { ...initialCartState },
            });
          }
        },

        mergeLocalCartToServer: async () => {
          const authState = useAuthStore.getState();
          const localCartItems = get().cart.items;

          if (!authState.token || !authState.user?.id) {
            console.log(
              'mergeLocalCartToServer: No autenticado, no se puede fusionar.'
            );
            return;
          }
          if (localCartItems.length === 0) {
            console.log(
              'mergeLocalCartToServer: Carrito local vacío, no hay nada que fusionar. Sincronizando para asegurar carrito de servidor...'
            );
            await get().syncWithServer();
            return;
          }

          console.log(
            'mergeLocalCartToServer: Iniciando fusión de carrito local al servidor...'
          );
          set({ isLoading: true, error: null });

          try {
            let serverCart = get().cart;
            if (
              serverCart.id === 0 ||
              serverCart.userId !== authState.user.id
            ) {
              const userCartResponse = await getUserCart(
                authState.user.id,
                authState.token
              );
              if (userCartResponse?.data?.id) {
                serverCart = userCartResponse.data;
              } else {
                const newCartResponse = await createCart(authState.token);
                if (newCartResponse?.data?.id) {
                  serverCart = newCartResponse.data;
                } else {
                  throw new Error(
                    'No se pudo crear/obtener carrito de servidor para fusionar.'
                  );
                }
              }
              set({ cart: serverCart });
            }

            console.log(
              `mergeLocalCartToServer: Fusionando ${localCartItems.length} items al carrito de servidor ID: ${serverCart.id}`
            );
            let currentServerCartState = serverCart;

            for (const localItem of localCartItems) {
              console.log(
                `mergeLocalCartToServer: Fusionando item ${localItem.product.name}, cantidad: ${localItem.quantity}`
              );

              const response = await addProductToCart(
                currentServerCartState.id,
                localItem.product.id,
                localItem.quantity,
                authState.token
              );
              if (response?.data?.id) {
                currentServerCartState = response.data;
              } else {
                console.warn(
                  `mergeLocalCartToServer: Fallo al fusionar item ${localItem.product.name}. Respuesta:`,
                  response
                );
                // opcional reintenrar aca ? notificar...
              }
            }
            set({
              cart: currentServerCartState,
              isLoading: false,
              error: null,
            });
            console.log(
              'mergeLocalCartToServer: Carrito local fusionado con éxito al servidor.',
              currentServerCartState
            );
          } catch (error: unknown) {
            console.error('mergeLocalCartToServer: Error:', error);
            set({
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Error al fusionar carrito.',
            });

            await get().syncWithServer();
          }
        },

        addToCart: async (product: Product, quantityToAdd: number) => {
          set({ isLoading: true, error: null });
          const localCartBeforeOp = get().cart ?? { ...initialCartState };

          const existingItem = localCartBeforeOp.items.find(
            (item) => item.product.id === product.id
          );
          let newQuantity = quantityToAdd;
          if (existingItem) {
            newQuantity = existingItem.quantity + quantityToAdd;
          }

          let updatedItems: CartItemType[];
          if (existingItem) {
            updatedItems = localCartBeforeOp.items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: newQuantity }
                : item
            );
          } else {
            updatedItems = [
              ...localCartBeforeOp.items,
              { id: generateLocalCartItemId(), quantity: newQuantity, product },
            ];
          }

          const updatedLocalCart: Cart = {
            ...localCartBeforeOp,
            updateAt: new Date().toISOString(),
            items: updatedItems,
          };
          set({ cart: updatedLocalCart });
          console.log(
            'addToCart: Actualizado localmente:',
            product.name,
            'Nueva cantidad total:',
            newQuantity,
            updatedLocalCart
          );

          // --- Lógica de Sincronización con el Servidor ---
          const authStateForSync = useAuthStore.getState();
          const cartStateForSync = get().cart; // Re-leer el estado del carrito por si fue actualizado

          if (
            authStateForSync.token &&
            authStateForSync.user?.id &&
            cartStateForSync.id !== 0
          ) {
            console.log(
              `addToCart: Intentando sincronizar. Cart ID: ${cartStateForSync.id}, Prod ID: ${product.id}, Cantidad Total a Enviar: ${newQuantity}`
            );
            try {
              const response = await addProductToCart(
                cartStateForSync.id,
                product.id,
                newQuantity,
                authStateForSync.token
              );
              if (response?.data?.id) {
                set({ cart: response.data, isLoading: false, error: null });
                console.log(
                  'addToCart: Sincronizado con servidor.',
                  response.data
                );
              } else {
                set({
                  isLoading: false,
                  error:
                    'Respuesta inesperada del servidor al añadir producto.',
                });
                console.warn(
                  'addToCart: Fallo al sincronizar (respuesta inesperada).',
                  response
                );
              }
            } catch (err: unknown) {
              console.error(
                'addToCart: Error sincronizando con servidor:',
                err
              );
              set({
                isLoading: false,
                error:
                  err instanceof Error ? err.message : 'Fallo al sincronizar.',
              });
            }
          } else {
            set({ isLoading: false });
            console.log(
              `addToCart: No se sincronizará. Token: ${!!authStateForSync.token}, User: ${!!authStateForSync.user?.id}, Cart ID Servidor: ${cartStateForSync.id !== 0}`
            );
          }
        },

        removeFromCart: async (cartItemIdToRemove: number) => {
          set({ isLoading: true, error: null });
          const localCartBeforeOp = get().cart ?? { ...initialCartState };
          const itemToRemove = localCartBeforeOp.items.find(
            (item) => item.id === cartItemIdToRemove
          );

          if (!itemToRemove) {
            set({
              isLoading: false,
              error: 'Item no encontrado en carrito local.',
            });
            return;
          }

          const updatedItemsLocal = localCartBeforeOp.items.filter(
            (item) => item.id !== cartItemIdToRemove
          );
          const updatedLocalCart: Cart = {
            ...localCartBeforeOp,
            updateAt: new Date().toISOString(),
            items: updatedItemsLocal,
          };
          set({ cart: updatedLocalCart });
          console.log(
            'removeFromCart: Eliminado localmente. Item ID:',
            cartItemIdToRemove,
            updatedLocalCart
          );

          // --- Sincronización ---
          const authStateForSync = useAuthStore.getState();
          const cartStateForSync = get().cart; // Re-leer

          if (
            authStateForSync.token &&
            authStateForSync.user?.id &&
            cartStateForSync.id !== 0
          ) {
            console.log(
              `removeFromCart: Intentando sincronizar. Cart ID: ${cartStateForSync.id}, Prod ID: ${itemToRemove.product.id}`
            );
            try {
              const response = await removeProductFromCart(
                cartStateForSync.id,
                itemToRemove.product.id,
                authStateForSync.token
              );
              if (response?.data?.id) {
                set({ cart: response.data, isLoading: false, error: null });
                console.log(
                  'removeFromCart: Sincronizado con servidor.',
                  response.data
                );
              } else {
                set({
                  isLoading: false,
                  error:
                    'Respuesta inesperada del servidor al eliminar producto.',
                });
                console.warn(
                  'removeFromCart: Fallo al sincronizar (respuesta inesperada).',
                  response
                );
              }
            } catch (err: unknown) {
              console.error(
                'removeFromCart: Error sincronizando con servidor:',
                err
              );
              set({
                isLoading: false,
                error:
                  err instanceof Error ? err.message : 'Fallo al sincronizar.',
              });
            }
          } else {
            set({ isLoading: false });
            console.log(
              `removeFromCart: No se sincronizará. Token: ${!!authStateForSync.token}, User: ${!!authStateForSync.user?.id}, Cart ID Servidor: ${cartStateForSync.id !== 0}`
            );
          }
        },

        updateQuantity: async (
          cartItemIdToUpdate: number,
          newTotalQuantity: number
        ) => {
          if (newTotalQuantity <= 0) {
            await get().removeFromCart(cartItemIdToUpdate);
            return;
          }

          set({ isLoading: true, error: null });
          const localCartBeforeOp = get().cart ?? { ...initialCartState };
          const itemToUpdate = localCartBeforeOp.items.find(
            (item) => item.id === cartItemIdToUpdate
          );

          if (!itemToUpdate) {
            set({
              isLoading: false,
              error: 'Item no encontrado para actualizar.',
            });
            return;
          }

          const updatedItemsLocal = localCartBeforeOp.items.map((item) =>
            item.id === cartItemIdToUpdate
              ? { ...item, quantity: newTotalQuantity }
              : item
          );
          const updatedLocalCart: Cart = {
            ...localCartBeforeOp,
            updateAt: new Date().toISOString(),
            items: updatedItemsLocal,
          };
          set({ cart: updatedLocalCart });
          console.log(
            'updateQuantity: Actualizado localmente. Item ID:',
            cartItemIdToUpdate,
            'Nueva Cantidad:',
            newTotalQuantity,
            updatedLocalCart
          );

          // --- Sincronización ---
          const authStateForSync = useAuthStore.getState();
          const cartStateForSync = get().cart; // Re-leer

          if (
            authStateForSync.token &&
            authStateForSync.user?.id &&
            cartStateForSync.id !== 0
          ) {
            console.log(
              `updateQuantity: Intentando sincronizar (vía addProductToCart). Cart ID: ${cartStateForSync.id}, Prod ID: ${itemToUpdate.product.id}, Nueva Cantidad Total: ${newTotalQuantity}`
            );
            try {
              const response = await addProductToCart(
                cartStateForSync.id,
                itemToUpdate.product.id,
                newTotalQuantity,
                authStateForSync.token
              );
              if (response?.data?.id) {
                set({ cart: response.data, isLoading: false, error: null });
                console.log(
                  'updateQuantity: Sincronizado con servidor.',
                  response.data
                );
              } else {
                set({
                  isLoading: false,
                  error:
                    'Respuesta inesperada del servidor al actualizar cantidad.',
                });
                console.warn(
                  'updateQuantity: Fallo al sincronizar (respuesta inesperada).',
                  response
                );
              }
            } catch (err: unknown) {
              console.error(
                'updateQuantity: Error sincronizando con servidor:',
                err
              );
              set({
                isLoading: false,
                error:
                  err instanceof Error ? err.message : 'Fallo al sincronizar.',
              });
            }
          } else {
            set({ isLoading: false });
            console.log(
              `updateQuantity: No se sincronizará. Token: ${!!authStateForSync.token}, User: ${!!authStateForSync.user?.id}, Cart ID Servidor: ${cartStateForSync.id !== 0}`
            );
          }
        },

        clearCart: async () => {
          set({ isLoading: true, error: null });
          const localCartBeforeOp = get().cart ?? { ...initialCartState };
          const clearedLocalCart: Cart = {
            ...initialCartState,
            id: localCartBeforeOp.id,
            userId: localCartBeforeOp.userId,
          };
          if (localCartBeforeOp.id === 0) {
            clearedLocalCart.id = 0;
            clearedLocalCart.userId = '';
          }

          set({ cart: clearedLocalCart });
          console.log('clearCart: Vaciado localmente.', clearedLocalCart);

          // --- Sincronización ---
          const authStateForSync = useAuthStore.getState();

          const serverCartIdToEmpty = localCartBeforeOp.id;

          if (
            authStateForSync.token &&
            authStateForSync.user?.id &&
            serverCartIdToEmpty !== 0
          ) {
            console.log(
              `clearCart: Intentando sincronizar (vaciar) con servidor. Cart ID: ${serverCartIdToEmpty}`
            );
            try {
              const response = await emptyCart(
                serverCartIdToEmpty,
                authStateForSync.token
              );
              if (response?.data?.id) {
                // El backend devuelve el carrito vacío
                set({ cart: response.data, isLoading: false, error: null });
                console.log(
                  'clearCart: Sincronizado (vaciado) con servidor.',
                  response.data
                );
              } else {
                set({
                  isLoading: false,
                  error: 'Respuesta inesperada del servidor al vaciar carrito.',
                });
                console.warn(
                  'clearCart: Fallo al sincronizar vaciado (respuesta inesperada).',
                  response
                );
              }
            } catch (err: unknown) {
              console.error(
                'clearCart: Error sincronizando (vaciado) con servidor:',
                err
              );
              set({
                isLoading: false,
                error:
                  err instanceof Error
                    ? err.message
                    : 'Fallo al sincronizar vaciado.',
              });
            }
          } else {
            if (get().cart.id !== 0 || get().cart.userId !== '') {
              set({ cart: { ...initialCartState } });
            }
            set({ isLoading: false });
            console.log(
              `clearCart: No se sincronizará con servidor. Token: ${!!authStateForSync.token}, User: ${!!authStateForSync.user?.id}, Cart ID Servidor era: ${serverCartIdToEmpty !== 0}`
            );
          }
        },

        // Funciones para UI del carrito (drawer)
        toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
        closeCart: () => set({ isCartOpen: false }),
        openCart: () => set({ isCartOpen: true }),
      }),
      {
        name: 'cart-storage',
        storage: createJSONStorage(
          () =>
            isLocalStorageAvailable() ?? {
              getItem: () => null,
              setItem: () => null,
              removeItem: () => null,
            }
        ),
        partialize: (state) => ({ cart: state.cart }), // Solo persistir el carrito
        onRehydrateStorage: () => () => {
          useCartStore.setState((state) => ({}));
          console.log('Cart Store: Rehidratación completa.');
        },
        // onRehydrateError no es una propiedad válida en las opciones de persist
        // onRehydrateError: (err: unknown) => {
        //   console.error('Cart Store: Error de rehidratación:', err);
        //   useCartStore.setState({
        //     cart: { ...initialCartState },
        //     error: 'Error al cargar carrito guardado.',
        //     isLoading: false,
        //   });
        // },
      }
    )
  )
);
