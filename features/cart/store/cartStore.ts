// features/cart/store/cartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Cart, Product, CartItem as CartItemType } from '@/types';
import {
  getUserCart,
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
  removeFromCart: (productId: number, presentation?: string) => Promise<void>;
  updateQuantity: (productId: number, newQuantity: number, presentation?: string) => Promise<void>;
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

const generateLocalItemId = () => Math.floor(Date.now() + Math.random() * 1000);

const sanitizeCart = (cart: Cart | undefined | null): Cart => {
  if (!cart) return { ...initialCartState };
  const items = (cart.items || []).filter(
    (i) => i && i.product && typeof i.quantity === 'number' && i.quantity > 0
  );
  return { ...cart, items };
};

const itemKey = (productId: number, presentation?: string) =>
  `${productId}|${presentation ?? ''}`;

const inFlight = new Map<string, AbortController>();

const cancelInFlight = (key: string) => {
  const ctrl = inFlight.get(key);
  if (ctrl) {
    ctrl.abort();
    inFlight.delete(key);
  }
};

// Dedup global del sync: si ya hay un syncWithServer corriendo,
// los siguientes callers comparten la misma Promise.
let syncInFlight: Promise<void> | null = null;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: { ...initialCartState },
      isLoading: false,
      error: null,
      isCartOpen: false,

      syncWithServer: async () => {
        if (syncInFlight) {
          return syncInFlight;
        }

        const authState = useAuthStore.getState();
        if (!authState.token || !authState.user?.id) {
          logger.debug('syncWithServer: Not authenticated, using local cart.');
          set({
            isLoading: false,
            error: null,
            cart: sanitizeCart(get().cart),
          });
          return;
        }

        const run = async () => {
          try {
            set({ isLoading: true, error: null });

            const userCartResponse = await getUserCart(
              authState.user!.id,
              authState.token!
            );

            if (userCartResponse?.data?.id) {
              set({
                cart: sanitizeCart(userCartResponse.data),
                isLoading: false,
                error: null,
              });
              logger.debug('syncWithServer: Cart synchronized with server.');
            } else {
              logger.info('syncWithServer: Server unavailable, keeping local cart.');
              set({
                isLoading: false,
                error: null,
                cart: sanitizeCart({
                  ...get().cart,
                  userId: authState.user!.id,
                }),
              });
            }
          } catch (error) {
            logger.info('syncWithServer: Server unavailable, keeping local cart.', error);
            set({
              isLoading: false,
              error: null,
              cart: sanitizeCart({
                ...get().cart,
                userId: authState.user?.id || '',
              }),
            });
          }
        };

        syncInFlight = run().finally(() => {
          syncInFlight = null;
        });
        return syncInFlight;
      },

      // Optimistic + delta semantics. Backend treats ?quantity=N as INCREMENT,
      // so we send `quantity` as the DELTA (not the cumulative total).
      addToCart: async (product, quantityToAdd, presentation) => {
        const authState = useAuthStore.getState();
        if (!authState.token || !authState.user?.id) {
          logger.debug('addToCart: User not authenticated.');
          return;
        }
        if (!quantityToAdd || quantityToAdd <= 0) return;

        const key = itemKey(product.id, presentation);
        cancelInFlight(key);

        const currentCart = get().cart;
        const existingIndex = currentCart.items.findIndex(
          (item) => item.product.id === product.id && item.presentation === presentation
        );

        const optimisticItems =
          existingIndex >= 0
            ? currentCart.items.map((it, i) =>
                i === existingIndex ? { ...it, quantity: it.quantity + quantityToAdd } : it
              )
            : [
                ...currentCart.items,
                {
                  id: generateLocalItemId(),
                  quantity: quantityToAdd,
                  product,
                  presentation,
                } as CartItemType,
              ];

        const optimisticCart: Cart = {
          ...currentCart,
          items: optimisticItems,
          updateAt: new Date().toISOString(),
          userId: authState.user.id,
          id: currentCart.id || -1,
        };

        set({ cart: sanitizeCart(optimisticCart), isLoading: true, error: null });

        if (currentCart.id > 0) {
          const ctrl = new AbortController();
          inFlight.set(key, ctrl);
          try {
            const response = await addProductToCart(
              currentCart.id,
              product.id,
              quantityToAdd, // ← DELTA, not cumulative
              authState.token,
              presentation
            );
            if (ctrl.signal.aborted) return;

            if (response?.data?.id) {
              set({ cart: sanitizeCart(response.data), isLoading: false, error: null });
              return;
            }
          } catch (error) {
            if (ctrl.signal.aborted) return;
            logger.info('addToCart: Server failed, keeping optimistic local cart.', error);
          } finally {
            if (inFlight.get(key) === ctrl) inFlight.delete(key);
          }
        }

        set({ isLoading: false, error: null });
      },

      // Set absolute quantity. Computes delta against current and uses
      // either addProductToCart (delta>0) or removeProductFromCart (delta<0).
      updateQuantity: async (productId, newQuantity, presentation) => {
        if (newQuantity <= 0) {
          await get().removeFromCart(productId, presentation);
          return;
        }

        const authState = useAuthStore.getState();
        if (!authState.token || !authState.user?.id) return;

        const key = itemKey(productId, presentation);
        cancelInFlight(key);

        const currentCart = get().cart;
        const existing = currentCart.items.find(
          (i) => i.product.id === productId && i.presentation === presentation
        );
        if (!existing) return;

        const delta = newQuantity - existing.quantity;
        if (delta === 0) return;

        const optimisticItems = currentCart.items.map((i) =>
          i.product.id === productId && i.presentation === presentation
            ? { ...i, quantity: newQuantity }
            : i
        );
        set({
          cart: sanitizeCart({ ...currentCart, items: optimisticItems, updateAt: new Date().toISOString() }),
          isLoading: true,
          error: null,
        });

        if (currentCart.id > 0) {
          const ctrl = new AbortController();
          inFlight.set(key, ctrl);
          try {
            const response =
              delta > 0
                ? await addProductToCart(
                    currentCart.id,
                    productId,
                    delta,
                    authState.token,
                    presentation
                  )
                : await removeProductFromCart(
                    currentCart.id,
                    productId,
                    authState.token,
                    Math.abs(delta)
                  );

            if (ctrl.signal.aborted) return;

            if (response?.data?.id) {
              set({ cart: sanitizeCart(response.data), isLoading: false, error: null });
              return;
            }
          } catch (error) {
            if (ctrl.signal.aborted) return;
            logger.info('updateQuantity: Server failed, keeping optimistic.', error);
          } finally {
            if (inFlight.get(key) === ctrl) inFlight.delete(key);
          }
        }

        set({ isLoading: false, error: null });
      },

      removeFromCart: async (productId, presentation) => {
        const authState = useAuthStore.getState();
        if (!authState.token || !authState.user?.id) return;

        const key = itemKey(productId, presentation);
        cancelInFlight(key);

        const currentCart = get().cart;
        const existing = currentCart.items.find(
          (i) =>
            i.product.id === productId &&
            (presentation === undefined || i.presentation === presentation)
        );
        if (!existing) {
          set({ error: 'Item not found in cart.' });
          return;
        }

        const optimisticItems = currentCart.items.filter(
          (i) =>
            !(
              i.product.id === productId &&
              (presentation === undefined || i.presentation === presentation)
            )
        );
        set({
          cart: sanitizeCart({ ...currentCart, items: optimisticItems, updateAt: new Date().toISOString() }),
          isLoading: true,
          error: null,
        });

        if (currentCart.id > 0) {
          const ctrl = new AbortController();
          inFlight.set(key, ctrl);
          try {
            const response = await removeProductFromCart(
              currentCart.id,
              productId,
              authState.token,
              existing.quantity // remove ALL units of this item
            );
            if (ctrl.signal.aborted) return;

            if (response?.data?.id) {
              set({ cart: sanitizeCart(response.data), isLoading: false, error: null });
              return;
            }
          } catch (error) {
            if (ctrl.signal.aborted) return;
            logger.info('removeFromCart: Server failed, keeping optimistic.', error);
          } finally {
            if (inFlight.get(key) === ctrl) inFlight.delete(key);
          }
        }

        set({ isLoading: false, error: null });
      },

      clearCart: async () => {
        const authState = useAuthStore.getState();
        const currentCart = get().cart;

        // Cancel any pending request for any item.
        for (const [, ctrl] of inFlight) ctrl.abort();
        inFlight.clear();

        if (!authState.token || !authState.user?.id) {
          set({ cart: { ...initialCartState }, isLoading: false, error: null });
          return;
        }

        // Optimistic empty
        set({
          cart: { ...initialCartState, userId: authState.user.id, id: currentCart.id || -1 },
          isLoading: true,
          error: null,
        });

        if (currentCart.id > 0) {
          try {
            const response = await emptyCart(currentCart.id, authState.token);
            if (response?.data?.id) {
              set({ cart: sanitizeCart(response.data), isLoading: false, error: null });
              return;
            }
          } catch (error) {
            logger.info('clearCart: Server failed, keeping local empty.', error);
          }
        }

        set({ isLoading: false, error: null });
      },

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      closeCart: () => set({ isCartOpen: false }),
      openCart: () => set({ isCartOpen: true }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cart: state.cart }),
      version: 1,
      migrate: (persisted: unknown, _version) => {
        const p = persisted as { cart?: Cart } | null | undefined;
        if (!p?.cart) return { cart: { ...initialCartState } };
        return { cart: sanitizeCart(p.cart) };
      },
      onRehydrateStorage: () => (state) => {
        if (state?.cart) state.cart = sanitizeCart(state.cart);
      },
    }
  )
);
