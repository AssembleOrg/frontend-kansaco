// features/cart/components/client/AddToCartButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/cart/store/cartStore';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types/product';

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  className?: string;
}

export const AddToCartButton = ({ 
  product, 
  quantity = 1, 
  className 
}: AddToCartButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const { addToCart, openCart, error: cartError } = useCartStore();

  const isAuthenticated = !!(token && user?.id);

  // No renderizar si no hay producto
  if (!product) {
    return (
      <Button disabled className={className} size="lg">
        <ShoppingCart className="w-4 h-4 mr-2" />
        Producto no disponible
      </Button>
    );
  }

  const handleClick = async () => {
    if (!isAuthenticated) {
      console.log('AddToCartButton: Usuario no autenticado, redirigiendo a login');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      console.log(`AddToCartButton: Agregando producto ${product.id} al carrito`);
      
      await addToCart(product, quantity);
      
      // Solo mostrar éxito si no hay error en el store
      const currentError = useCartStore.getState().error;
      if (!currentError) {
        console.log('AddToCartButton: Producto agregado exitosamente, abriendo carrito');
        // Abrir el carrito para mostrar el producto agregado
        openCart();
      } else {
        console.warn('AddToCartButton: Error del servidor:', currentError);
        // No mostrar error al usuario, pero tampoco decir que fue exitoso
      }
    } catch (error) {
      console.warn('AddToCartButton: Error agregando producto:', error);
      // No mostrar error al usuario, el backend tiene problemas temporales
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className={className}
      size="lg"
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      {isLoading 
        ? 'Agregando...' 
        : isAuthenticated 
          ? 'Agregar al carrito' 
          : 'Iniciar sesión para comprar'
      }
    </Button>
  );
};
