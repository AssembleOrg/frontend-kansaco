'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { Product } from '@/types/product';
import { getProductBySlug } from '@/lib/api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AddToCartButton } from '@/features/cart/components/client/AddToCartButton';
import { useCart } from '@/features/cart/hooks/useCart';

// Componente de presentación para la página de detalle de producto
function ProductDetailView({ product }: { product: Product }) {
  // Usar el hook useCart para acceder a las funciones de formateo de precios
  const { formatPrice, getProductPrice } = useCart();

  // Asegurarnos de que sea una imagen válida o usar fallback
  const imageUrl = product.imageUrl || '/sauberatras.jpg';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Imagen del producto */}
          <div className="flex items-center justify-center p-6">
            <div className="relative h-[300px] w-full">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Información del producto */}
          <div className="flex flex-col p-6">
            <h1 className="mb-2 text-2xl font-bold text-gray-800">
              {product.name}
            </h1>

            {/* Categorías */}
            {product.category && product.category.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {product.category.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {/* SKU */}
            {product.sku && (
              <p className="mb-2 text-sm text-gray-500">SKU: {product.sku}</p>
            )}

            {/* Precio */}
            <p className="mb-4 text-2xl font-bold text-green-600">
              {formatPrice(getProductPrice(product))}
            </p>

            {/* Descripción */}
            {product.description && (
              <div className="mb-4">
                <h2 className="mb-2 text-lg font-semibold">Descripción</h2>
                <p className="text-gray-600">{product.description}</p>
              </div>
            )}

            {/* Aplicación */}
            {product.aplication && (
              <div className="mb-4">
                <h2 className="mb-2 text-lg font-semibold">Aplicación</h2>
                <p className="text-gray-600">{product.aplication}</p>
              </div>
            )}

            {/* Presentación */}
            {product.presentation && (
              <div className="mb-4">
                <h2 className="mb-2 text-lg font-semibold">Presentación</h2>
                <p className="text-gray-600">{product.presentation}</p>
              </div>
            )}

            {/* Stock */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500">
                {product.stock > 0 ? 'En stock' : 'Agotado'}
              </p>
            </div>

            {/* Botón de agregar al carrito */}
            <AddToCartButton
              product={product}
              variant="default"
              size="lg"
              showQuantity={true}
              className="mt-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Página principal del producto
export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Acceder al token de autenticación
  const { token } = useAuth();

  // Obtener el slug de los parámetros de la URL
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        setError('No se especificó un producto');
        setIsLoading(false);
        return;
      }

      try {
        const productData = await getProductBySlug(slug, token);
        if (productData) {
          setProduct(productData);
        } else {
          setError('Producto no encontrado');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al cargar el producto'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug, token]);

  // Manejar estados de carga y error
  if (isLoading) {
    return (
      <div className="container mx-auto p-8 text-center">
        Cargando detalles del producto...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <h2 className="mb-2 text-lg font-semibold">Error</h2>
          <p>{error}</p>
          {error === 'No se especificó un producto' && (
            <p className="mt-4">
              <Link href="/productos" className="text-blue-600 hover:underline">
                Volver a la lista de productos
              </Link>
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  return <ProductDetailView product={product} />;
}
