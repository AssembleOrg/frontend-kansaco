// app/(shop)]/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { Product } from '@/types/product';
import { getProductBySlug } from '@/lib/api';
import { AddToCartButton } from '@/features/cart/components/client/AddToCartButton';
import { useCart } from '@/features/cart/hooks/useCart';
import { Loader2, ArrowLeft, Info, Droplet, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

function ProductDetailView({ product }: { product: Product }) {
  const { formatPrice, getProductPrice } = useCart();
  const imageUrl = product.imageUrl || '/sauberatras.jpg';
  const price = getProductPrice(product);
  const isPriceAvailable = price && price > 0;

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Breadcrumb y Botón Volver */}
      <div className="mb-8 flex items-center justify-between">
        <Link href="/productos">
          <Button variant="ghost" className="group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Volver a Productos
          </Button>
        </Link>
        {product.sku && (
          <Badge variant="outline" className="text-sm">
            SKU: {product.sku}
          </Badge>
        )}
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
          {/* Imagen del Producto */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-contain p-4 transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Información del Producto */}
          <div className="flex flex-col space-y-6">
            <div>
              <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
                {product.name}
              </h1>
              {product.category && product.category.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {product.category.map((cat) => (
                    <Badge
                      key={cat}
                      variant="secondary"
                      className="bg-green-50 text-green-700 hover:bg-green-100"
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-gray-700 font-medium">
                  Consultar precio
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Contacta con nosotros para conocer el precio y disponibilidad
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                  variant={product.stock > 0 ? "default" : "destructive"}
                  className="text-sm"
                >
                  {product.stock > 0
                    ? `En stock (${product.stock} unidades)`
                    : 'Agotado'}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Detalles del Producto */}
            <div className="space-y-6">
              {product.description && (
                <div>
                  <div className="mb-2 flex items-center space-x-2">
                    <Info className="h-5 w-5 text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Descripción
                    </h2>
                  </div>
                  <p className="text-gray-600">{product.description}</p>
                </div>
              )}

              {product.aplication && (
                <div>
                  <div className="mb-2 flex items-center space-x-2">
                    <Droplet className="h-5 w-5 text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Aplicación
                    </h2>
                  </div>
                  <p className="text-gray-600">{product.aplication}</p>
                </div>
              )}

              {product.presentation && (
                <div>
                  <div className="mb-2 flex items-center space-x-2">
                    <Box className="h-5 w-5 text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Presentación
                    </h2>
                  </div>
                  <p className="text-gray-600">{product.presentation}</p>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6">
              <AddToCartButton
                product={product}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetailPageContent() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        setError('No se especificó un producto');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const productData = await getProductBySlug(slug);
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
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center mt-20">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <p className="text-xl text-gray-600">Cargando detalles del producto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 mt-20">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="mb-4 text-2xl font-semibold text-red-800">Error</h2>
          <p className="mb-6 text-red-600">{error}</p>
          <Link href="/productos">
            <Button variant="outline" className="text-red-600 hover:bg-red-50">
              Volver a la lista de productos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  return <ProductDetailView product={product} />;
}

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center mt-20">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            <p className="text-xl text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <ProductDetailPageContent />
    </Suspense>
  );
}
