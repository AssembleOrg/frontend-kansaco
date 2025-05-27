// app/(shop)/productos/[slug]/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { Product } from '@/types/product';
import { getProductBySlug } from '@/lib/api';
import { AddToCartButton } from '@/features/cart/components/client/AddToCartButton';
import { useCart } from '@/features/cart/hooks/useCart';
import { Loader2 } from 'lucide-react';

function ProductDetailView({ product }: { product: Product }) {
  const { formatPrice, getProductPrice } = useCart();
  const imageUrl = product.imageUrl || '/sauberatras.jpg';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex items-center justify-center p-6">
            <div className="relative h-[300px] w-full md:h-[400px]">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
          <div className="flex flex-col p-6">
            <h1 className="mb-2 text-2xl font-bold text-gray-800 md:text-3xl">
              {product.name}
            </h1>
            {product.category && product.category.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {product.category.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
            {product.sku && (
              <p className="mb-2 text-sm text-gray-500">SKU: {product.sku}</p>
            )}
            <p className="mb-4 text-2xl font-bold text-green-600 md:text-3xl">
              {formatPrice(getProductPrice(product))}
            </p>
            {product.description && (
              <div className="mb-4">
                <h2 className="mb-2 text-lg font-semibold text-gray-700">
                  Descripción
                </h2>
                <p className="prose prose-sm text-gray-600">
                  {product.description}
                </p>
              </div>
            )}
            {product.aplication && (
              <div className="mb-4">
                <h2 className="mb-2 text-lg font-semibold text-gray-700">
                  Aplicación
                </h2>
                <p className="prose prose-sm text-gray-600">
                  {product.aplication}
                </p>
              </div>
            )}
            {product.presentation && (
              <div className="mb-4">
                <h2 className="mb-2 text-lg font-semibold text-gray-700">
                  Presentación
                </h2>
                <p className="prose prose-sm text-gray-600">
                  {product.presentation}
                </p>
              </div>
            )}
            <div className="mb-6">
              <p
                className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {product.stock > 0
                  ? `En stock (${product.stock} unidades)`
                  : 'Agotado'}
              </p>
            </div>
            <AddToCartButton
              product={product}
              variant="default"
              size="lg"
              showQuantity={true}
              className="mt-auto w-full"
            />
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
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-green-500" />
        <p className="text-xl">Cargando detalles del producto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <h2 className="mb-3 text-xl font-semibold">Error</h2>
          <p className="mb-4">{error}</p>
          <Link href="/productos" className="text-blue-600 hover:underline">
            Volver a la lista de productos
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
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="mr-2 h-8 w-8 animate-spin text-green-500" />
          <p className="text-xl">Cargando...</p>
        </div>
      }
    >
      <ProductDetailPageContent />
    </Suspense>
  );
}
