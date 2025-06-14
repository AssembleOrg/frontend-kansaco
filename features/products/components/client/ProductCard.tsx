'use client';

import { Product } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/features/cart/hooks/useCart';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, formatPrice, getProductPrice } = useCart();
  const { token } = useAuth();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!token) {
      router.push('/login?redirect=/productos&message=Para comenzar a armar tu carrito, necesitas iniciar sesión');
      return;
    }
    setIsAddingToCart(true);
    try {
      await addToCart(product, 1);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const productPrice = getProductPrice(product);
  const isPriceAvailable = productPrice && productPrice > 0;

  return (
    <Card 
      className="group relative flex h-full flex-col overflow-hidden transition-all hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="relative aspect-square overflow-hidden p-0">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <p className="text-sm text-gray-500">Imagen no disponible</p>
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {product.category.map((cat) => (
            <Badge key={cat} variant="secondary" className="text-xs">
              {cat}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold">
          {product.name}
        </h3>
        <p className="mb-2 text-sm text-gray-500">{product.sku}</p>
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-gray-600">
          {product.description}
        </p>
        {isPriceAvailable ? (
          <p className="text-lg font-bold text-green-600">
            {formatPrice(productPrice)}
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 italic">
              Precio pendiente de carga
            </p>
            <p className="text-xs text-gray-400">
              Consultar disponibilidad
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={!isPriceAvailable || isAddingToCart}
          className="w-full"
          variant={isPriceAvailable ? "default" : "outline"}
        >
          {isPriceAvailable ? (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Agregar al Carrito
            </>
          ) : (
            "Consultar"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 