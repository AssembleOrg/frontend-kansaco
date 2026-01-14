// app/(shop)]/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { Product } from '@/types/product';
import { getProductBySlug, getProductImages, ProductImage } from '@/lib/api';
import { AddToCartButton } from '@/features/cart/components/client/AddToCartButton';
import { useCart } from '@/features/cart/hooks/useCart';
import { Loader2, ArrowLeft, Info, Droplet, Box, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

function ProductDetailView({ product, backUrl }: { product: Product; backUrl: string }) {
  const { getProductPrice } = useCart();
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoadingImages, setIsLoadingImages] = useState(true);

  getProductPrice(product); // Price calculation for future use

  // Cargar imágenes del producto
  useEffect(() => {
    const loadImages = async () => {
      if (product.id) {
        setIsLoadingImages(true);
        try {
          const images = await getProductImages(null, product.id);
          // Ordenar por order y luego por id
          const sorted = images.sort((a, b) => {
            if (a.order !== b.order) {
              return a.order - b.order;
            }
            return a.id - b.id;
          });
          setProductImages(sorted);
        } catch (err) {
          console.error('Error loading product images:', err);
        } finally {
          setIsLoadingImages(false);
        }
      }
    };
    loadImages();
  }, [product.id]);

  // Usar todas las imágenes del producto
  const filteredImages = productImages;

  // Determinar la imagen a mostrar con validación robusta
  const displayImage = (() => {
    // Si hay imágenes filtradas, usar índice seguro
    if (filteredImages.length > 0) {
      // Asegurar que el índice está dentro del rango
      const safeIndex = Math.min(currentImageIndex, filteredImages.length - 1);
      const imageUrl = filteredImages[safeIndex]?.imageUrl;
      if (imageUrl && imageUrl !== '') {
        return imageUrl;
      }
    }

    // Fallback: imagen del producto o placeholder
    return product.imageUrl || '/sauberatras.jpg';
  })();

  const handlePreviousImage = () => {
    if (filteredImages.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? filteredImages.length - 1 : prev - 1));
    }
  };

  const handleNextImage = () => {
    if (filteredImages.length > 0) {
      setCurrentImageIndex((prev) => (prev === filteredImages.length - 1 ? 0 : prev + 1));
    }
  };

  // Validar que el índice esté dentro del rango de imágenes filtradas
  useEffect(() => {
    if (filteredImages.length > 0 && currentImageIndex >= filteredImages.length) {
      setCurrentImageIndex(0);
    }
  }, [filteredImages.length, currentImageIndex]);

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Breadcrumb y Botón Volver */}
      <div className="mb-8 flex items-center justify-between">
        <Link href={backUrl}>
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
          {/* Imagen del Producto con Carrusel */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
              {isLoadingImages ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    className="object-contain p-4 transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  
                  {/* Controles del carrusel (solo si hay más de una imagen) */}
                  {filteredImages.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-white/90 shadow-lg hover:bg-white"
                        onClick={handlePreviousImage}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-white/90 shadow-lg hover:bg-white"
                        onClick={handleNextImage}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>

                      {/* Indicador de imagen actual */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                        {currentImageIndex + 1} / {filteredImages.length}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            
            {/* Miniaturas (solo si hay más de una imagen) */}
            {filteredImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {filteredImages.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-green-600 ring-2 ring-green-200'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <Image
                      src={img.imageUrl}
                      alt={`${product.name} - Imagen ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del Producto */}
          <div className="flex flex-col space-y-6">
            <div>
              <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
                {product.name}
              </h1>
              {(() => {
                // Preferir usar categories si está disponible, sino usar category
                const categoryNames = product.categories && product.categories.length > 0
                  ? product.categories.map((cat) => cat.name)
                  : product.category || [];
                // Filtrar categorías duplicadas
                const uniqueCategories = [...new Set(categoryNames)];
                return uniqueCategories.length > 0 ? (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {uniqueCategories.map((cat) => (
                      <Badge
                        key={cat}
                        variant="secondary"
                        className="bg-green-50 text-green-700 hover:bg-green-100"
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>

            <div className="space-y-4">

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

              {product.presentation && (() => {
                const presentations = product.presentation
                  .split(',')
                  .map((pres) => pres.trim())
                  .filter((pres) => pres.length > 0);
                
                return presentations.length > 0 ? (
                  <div>
                    <div className="mb-2 flex items-center space-x-2">
                      <Box className="h-5 w-5 text-gray-500" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        Presentación
                      </h2>
                    </div>
                    <div className="max-w-md">
                      <select
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 hover:border-gray-400"
                        defaultValue={presentations[0]}
                      >
                        {presentations.map((option, optIndex) => (
                          <option key={optIndex} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : null;
              })()}
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
  const searchParams = useSearchParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  // Construir la URL de retorno con los parámetros de la página anterior
  const getBackUrl = () => {
    const page = searchParams.get('page');
    const category = searchParams.get('category');
    const params = new URLSearchParams();
    if (page) params.set('page', page);
    if (category) params.set('category', category);
    const queryString = params.toString();
    return queryString ? `/productos?${queryString}` : '/productos';
  };

  const backUrl = getBackUrl();

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
          <Link href={backUrl}>
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

  return <ProductDetailView product={product} backUrl={backUrl} />;
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
