'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAdminProducts } from '@/features/admin/hooks/useAdminProducts';
import ProductsTable from '@/features/admin/components/ProductsTable';
import ProductFormModal from '@/features/admin/components/ProductFormModal';
import BulkUpdateModal from '@/features/admin/components/BulkUpdateModal';
import { Product } from '@/types/product';
import { Percent } from 'lucide-react';
import { ImageListItem, associateProductImage, getProductImages, deleteProductImage, reorderProductImages } from '@/lib/api';

export default function ProductsPage() {
  const { token } = useAuth();
  const {
    products,
    isLoading,
    error,
    pagination,
    searchQuery,
    selectedCategory,
    search,
    filterByCategory,
    goToPage,
    createNewProduct,
    editProduct,
    removeProduct,
    bulkUpdatePrices,
  } = useAdminProducts(token ?? null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const handleCreateProduct = async (data: Omit<Product, 'id' | 'slug'>, selectedImages?: ImageListItem[]) => {
    setIsSubmitting(true);
    try {
      const newProduct = await createNewProduct(data);
      
      // Subir imágenes si hay seleccionadas
      if (selectedImages && selectedImages.length > 0 && token) {
        try {
          console.log('🖼️ Iniciando gestión de imágenes para nuevo producto:', newProduct.id);
          console.log('🖼️ Imágenes seleccionadas:', selectedImages.length);
          
          // Asociar nuevas imágenes en el orden seleccionado (no re-subirlas)
          const uploadedImages = [];
          for (let i = 0; i < selectedImages.length; i++) {
            const img = selectedImages[i];
            try {
              console.log(`🔗 Asociando imagen ${i + 1}/${selectedImages.length}:`, img.key);
              
              const isPrimary = i === 0;
              
              // Intentar asociar la imagen existente por key
              try {
                const associated = await associateProductImage(token, newProduct.id, img.key, isPrimary);
                console.log('✅ Imagen asociada exitosamente:', associated.id);
                uploadedImages.push(associated);
              } catch (associateError) {
                // Si el endpoint de asociar no existe, el backend debería implementarlo
                console.error(`❌ Error associating image ${img.key}:`, associateError);
                throw associateError;
              }
            } catch (err) {
              console.error(`❌ Error processing image ${img.key}:`, err);
              // Continuar con las siguientes imágenes aunque una falle
            }
          }
          
          console.log('🖼️ Total de imágenes subidas:', uploadedImages.length);
          
          // Reordenar imágenes según el orden seleccionado
          if (uploadedImages.length > 0) {
            const imageIds = uploadedImages.map((img) => img.id);
            console.log('🔄 Reordenando imágenes con IDs:', imageIds);
            await reorderProductImages(token, newProduct.id, imageIds);
            console.log('✅ Imágenes reordenadas exitosamente');
          }
        } catch (imgError) {
          console.error('❌ Error managing product images:', imgError);
          showToast('Producto creado, pero hubo un error con las imágenes', 'error');
          // No fallar la creación del producto si hay error con imágenes
        }
      }
      
      setIsModalOpen(false);
      showToast('Producto creado correctamente', 'success');
    } catch {
      showToast('Error al crear el producto', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (data: Omit<Product, 'id' | 'slug'>, selectedImages?: ImageListItem[]) => {
    if (!selectedProduct || !token) return;
    setIsSubmitting(true);
    try {
      await editProduct(selectedProduct.id, data);
      
      // Manejar imágenes si hay seleccionadas
      if (selectedImages !== undefined) {
        try {
          console.log('🖼️ Iniciando gestión de imágenes para producto:', selectedProduct.id);
          console.log('🖼️ Imágenes seleccionadas:', selectedImages.length);
          
          const existingImages = await getProductImages(token, selectedProduct.id);
          console.log('🖼️ Imágenes existentes:', existingImages.length);
          
          // Crear un mapa de imageKey -> ProductImage para buscar imágenes existentes
          const existingImagesByKey = new Map(
            existingImages.map((img) => [img.imageKey, img])
          );
          
          // Determinar qué imágenes mantener y desasociar
          const selectedKeys = new Set(selectedImages.map((img) => img.key));
          
          // IMPORTANTE: Solo desasociar las imágenes que ya NO están seleccionadas
          // NO tocar las que siguen seleccionadas para evitar borrarlas del bucket
          // NOTA: Si el backend elimina del bucket al desasociar, hay que corregirlo en el backend
          for (const existingImg of existingImages) {
            if (!selectedKeys.has(existingImg.imageKey)) {
              try {
                console.log('🔗 Desasociando imagen del producto (NO debería eliminar del bucket):', existingImg.id, existingImg.imageKey);
                // ADVERTENCIA: Este endpoint NO debería eliminar del bucket, solo desasociar
                await deleteProductImage(token, selectedProduct.id, existingImg.id);
              } catch (err) {
                console.error('❌ Error desasociando imagen:', err);
              }
            } else {
              console.log('✅ Manteniendo imagen asociada (no se toca):', existingImg.id, existingImg.imageKey);
            }
          }
          
          // Asociar solo las imágenes nuevas (las que no existían antes)
          if (selectedImages.length > 0) {
            const newlyAssociatedImages: Array<{ id: number }> = [];
            
            // Asociar solo las imágenes que no existían antes
            for (let i = 0; i < selectedImages.length; i++) {
              const img = selectedImages[i];
              const existingImg = existingImagesByKey.get(img.key);
              
              if (!existingImg) {
                // Es una imagen nueva, asociarla
                try {
                  console.log(`🔗 Asociando nueva imagen ${i + 1}/${selectedImages.length}:`, img.key);
                  
                  // Determinar si debe ser principal (solo si es la primera y no hay otras imágenes)
                  const hasOtherImages = existingImages.length > 0;
                  const isPrimary = i === 0 && !hasOtherImages;
                  
                  // Intentar asociar la imagen existente por key
                  try {
                    const { associateProductImage } = await import('@/lib/api');
                    const associated = await associateProductImage(token, selectedProduct.id, img.key, isPrimary);
                    console.log('✅ Imagen asociada exitosamente:', associated.id);
                    newlyAssociatedImages.push(associated);
                  } catch (associateError) {
                    // Si el endpoint de asociar no existe, el backend debería implementarlo
                    console.error(`❌ Error associating image ${img.key}:`, associateError);
                    throw associateError;
                  }
                } catch (err) {
                  console.error(`❌ Error processing image ${img.key}:`, err);
                  // Continuar con las siguientes imágenes aunque una falle
                }
              }
            }
            
            console.log('🖼️ Total de nuevas imágenes asociadas:', newlyAssociatedImages.length);
            
            // Reordenar imágenes según el orden seleccionado
            // Obtener todas las imágenes actualizadas para tener los IDs correctos
            const allCurrentImages = await getProductImages(token, selectedProduct.id);
            const finalImageIds: number[] = [];
            
            // Crear el orden final basado en selectedImages
            for (const selectedImg of selectedImages) {
              const currentImg = allCurrentImages.find((img) => img.imageKey === selectedImg.key);
              if (currentImg) {
                finalImageIds.push(currentImg.id);
              }
            }
            
            if (finalImageIds.length > 0) {
              console.log('🔄 Reordenando imágenes con IDs:', finalImageIds);
              await reorderProductImages(token, selectedProduct.id, finalImageIds);
              console.log('✅ Imágenes reordenadas exitosamente');
            }
          } else {
            console.log('ℹ️ No hay imágenes seleccionadas, se desasociaron todas (NO se eliminaron del bucket)');
          }
        } catch (imgError) {
          console.error('❌ Error managing product images:', imgError);
          showToast('Producto actualizado, pero hubo un error con las imágenes', 'error');
          // No fallar la edición del producto si hay error con imágenes
        }
      }
      
      setIsModalOpen(false);
      setSelectedProduct(null);
      showToast('Producto actualizado correctamente', 'success');
    } catch (err) {
      console.error('❌ Error al actualizar el producto:', err);
      showToast('Error al actualizar el producto', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await removeProduct(productId);
      showToast('Producto eliminado correctamente', 'success');
    } catch {
      showToast('Error al eliminar el producto', 'error');
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSubmit = selectedProduct
    ? handleEditProduct
    : handleCreateProduct;

  const handleSelectionChange = (selectedIds: number[]) => {
    setSelectedProductIds(selectedIds);
  };

  const handleOpenBulkModal = () => {
    if (selectedProductIds.length === 0) {
      showToast('Selecciona al menos un producto', 'error');
      return;
    }
    setIsBulkModalOpen(true);
  };

  const handleApplyBulkUpdate = async (
    updateType: 'percentage' | 'fixed',
    operator: 'increase' | 'decrease',
    value: number
  ) => {
    setIsApplyingBulk(true);
    try {
      await bulkUpdatePrices(selectedProductIds, updateType, operator, value);
      setIsBulkModalOpen(false);
      setSelectedProductIds([]);
      showToast('Precios actualizados correctamente', 'success');
    } catch {
      showToast('Error al actualizar los precios', 'error');
    } finally {
      setIsApplyingBulk(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getSelectionText = (count: number) => {
    const productText = count === 1 ? 'producto seleccionado' : 'productos seleccionados';
    const categoryText = selectedCategory !== 'all' ? ` de ${selectedCategory}` : '';
    return `${count} ${productText}${categoryText}`;
  };

  // Obtener productos seleccionados para el modal
  const selectedProducts = products.filter((p) =>
    selectedProductIds.includes(p.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Gestionar Productos
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
            Crea, edita y elimina productos de tu catálogo.
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Bulk Update Toolbar - Desktop Only - Above Table */}
      {selectedProductIds.length > 0 && (
        <div className="hidden xl:flex xl:flex-row xl:items-center xl:justify-between rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">
              {getSelectionText(selectedProductIds.length)}
            </span>
          </div>
          <button
            onClick={handleOpenBulkModal}
            className="whitespace-nowrap rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700"
          >
            Actualizar Precios
          </button>
        </div>
      )}

      {/* Products Table */}
      <ProductsTable
        products={products}
        isLoading={isLoading}
        onEdit={(product) => handleOpenModal(product)}
        onDelete={handleDeleteProduct}
        onCreate={() => handleOpenModal()}
        onSelectionChange={handleSelectionChange}
        onBulkUpdateClick={handleOpenBulkModal}
        onCategoryChange={filterByCategory}
        onSearch={search}
        onPageChange={goToPage}
        pagination={pagination}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
      />

      {/* Modal - Crear/Editar Producto */}
      {isModalOpen && (
        <ProductFormModal
          product={selectedProduct || undefined}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          isLoading={isSubmitting}
        />
      )}

      {/* Modal - Bulk Update */}
      <BulkUpdateModal
        open={isBulkModalOpen}
        onOpenChange={setIsBulkModalOpen}
        selectedProducts={selectedProducts}
        onApply={handleApplyBulkUpdate}
        isLoading={isApplyingBulk}
      />

      {/* Toast Notification Reemplazar por react-toast ?? */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-lg p-4 text-sm font-medium text-white ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
