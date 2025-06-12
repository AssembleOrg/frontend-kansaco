import { CartProvider } from '@/features/cart/providers/CartProvider';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
