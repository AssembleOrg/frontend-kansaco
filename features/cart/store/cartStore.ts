import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Cart, Product } from '@/types';
import {
  getUserCart,
  createCart,
  addProductToCart,
  removeProductFromCart,
  emptyCart,
} from '@/lib/api';
import { useAuthStore } from '@/features/auth/store/authStore';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;

  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithServer: () => Promise<void>;

  isCartOpen: boolean;
  toggleCart: () => void;
  closeCart: () => void;
  openCart: () => void;
}

const isLocalStorageAvailable = () => {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem('zustand-test', 'test');
    window.localStorage.removeItem('zustand-test');
    return true;
  } catch {
    return false;
  }
};

const generateCartItemId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: {
        id: 1,
        createdAt: new Date().toISOString(),
        updateAt: new Date().toISOString(),
        userId: '',
        items: [],
      },
      isLoading: false,
      error: null,
      isCartOpen: false,

      syncWithServer: async () => {
        const { token, user } = useAuthStore.getState();
        if (!token || !user) return;

        set({ isLoading: true, error: null });
        try {
          const userCartResponse = await getUserCart(user.id, token);

          if (userCartResponse && userCartResponse.data) {
            set({
              cart: userCartResponse.data,
              isLoading: false,
              error: null,
            });
          } else {
            const newCartResponse = await createCart(token);
            if (newCartResponse && newCartResponse.data) {
              set({
                cart: newCartResponse.data,
                isLoading: false,
                error: null,
              });
            }
          }
        } catch (error) {
          console.error('Error syncing cart with server:', error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Error al sincronizar el carrito',
          });
        }
      },

      addToCart: async (product: Product, quantity: number) => {
        set({ isLoading: true, error: null });

        const { token, user } = useAuthStore.getState();
        const { cart } = get();

        try {
          if (token && user && cart && cart.id) {
            const response = await addProductToCart(
              cart.id,
              product.id,
              quantity,
              token
            );

            if (response && response.data) {
              set({
                cart: response.data,
                isLoading: false,
                error: null,
              });
              return;
            }
          }

          if (!cart) {
            set({
              cart: {
                id: 1,
                createdAt: new Date().toISOString(),
                updateAt: new Date().toISOString(),
                userId: user?.id || '',
                items: [
                  {
                    id: generateCartItemId(),
                    quantity,
                    product,
                  },
                ],
              },
              isLoading: false,
              error: null,
            });
            return;
          }

          const existingItemIndex = cart.items.findIndex(
            (item) => item.product.id === product.id
          );

          if (existingItemIndex !== -1) {
            const updatedItems = [...cart.items];
            updatedItems[existingItemIndex].quantity += quantity;

            set({
              cart: {
                ...cart,
                updateAt: new Date().toISOString(),
                items: updatedItems,
              },
              isLoading: false,
              error: null,
            });
          } else {
            set({
              cart: {
                ...cart,
                updateAt: new Date().toISOString(),
                items: [
                  ...cart.items,
                  {
                    id: generateCartItemId(),
                    quantity,
                    product,
                  },
                ],
              },
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Error adding to cart:', error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Error al añadir al carrito',
          });
        }
      },

      removeFromCart: async (itemId: number) => {
        set({ isLoading: true, error: null });

        const { token, user } = useAuthStore.getState();
        const { cart } = get();

        if (!cart) {
          set({ isLoading: false });
          return;
        }

        try {
          const item = cart.items.find((item) => item.id === itemId);
          if (!item) {
            set({ isLoading: false });
            return;
          }

          if (token && user && cart.id) {
            const response = await removeProductFromCart(
              cart.id,
              item.product.id,
              token
            );

            if (response && response.data) {
              set({
                cart: response.data,
                isLoading: false,
                error: null,
              });
              return;
            }
          }

          set({
            cart: {
              ...cart,
              updateAt: new Date().toISOString(),
              items: cart.items.filter((item) => item.id !== itemId),
            },
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Error removing from cart:', error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Error al eliminar del carrito',
          });
        }
      },

      updateQuantity: async (itemId: number, quantity: number) => {
        const { cart } = get();
        if (!cart) return;

        if (quantity <= 0) {
          get().removeFromCart(itemId);
          return;
        }

        set({ isLoading: true, error: null });

        const { token, user } = useAuthStore.getState();

        try {
          const item = cart.items.find((item) => item.id === itemId);
          if (!item) {
            set({ isLoading: false });
            return;
          }

          if (token && user && cart.id) {
            await removeProductFromCart(cart.id, item.product.id, token);
            const response = await addProductToCart(
              cart.id,
              item.product.id,
              quantity,
              token
            );

            if (response && response.data) {
              set({
                cart: response.data,
                isLoading: false,
                error: null,
              });
              return;
            }
          }

          set({
            cart: {
              ...cart,
              updateAt: new Date().toISOString(),
              items: cart.items.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
              ),
            },
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Error updating quantity:', error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Error al actualizar cantidad',
          });
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });

        const { token, user } = useAuthStore.getState();
        const { cart } = get();

        if (!cart) {
          set({ isLoading: false });
          return;
        }

        try {
          if (token && user && cart.id) {
            const response = await emptyCart(cart.id, token);

            if (response && response.data) {
              set({
                cart: response.data,
                isLoading: false,
                error: null,
              });
              return;
            }
          }

          set({
            cart: {
              ...cart,
              updateAt: new Date().toISOString(),
              items: [],
            },
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Error clearing cart:', error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Error al vaciar el carrito',
          });
        }
      },

      toggleCart: () => {
        set((state) => ({ isCartOpen: !state.isCartOpen }));
      },

      closeCart: () => {
        set({ isCartOpen: false });
      },

      openCart: () => {
        set({ isCartOpen: true });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => {
        return isLocalStorageAvailable()
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => null,
              removeItem: () => null,
            };
      }),
      partialize: (state) => ({
        cart: state.cart,
      }),
    }
  )
);
