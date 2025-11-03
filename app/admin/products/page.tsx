'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAdminProducts } from '@/features/admin/hooks/useAdminProducts';
import ProductsTable from '@/features/admin/components/ProductsTable';
import ProductFormModal from '@/features/admin/components/ProductFormModal';
import BulkUpdateModal from '@/features/admin/components/BulkUpdateModal';
import { Product } from '@/types/product';
import { Percent } from 'lucide-react';

export default function ProductsPage() {
  const { token } = useAuth();
  const {
    products,
    isLoading,
    error,
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const handleCreateProduct = async (data: Omit<Product, 'id'>) => {
    setIsSubmitting(true);
    try {
      await createNewProduct(data);
      setIsModalOpen(false);
      showToast('Producto creado correctamente', 'success');
    } catch {
      showToast('Error al crear el producto', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (data: Omit<Product, 'id'>) => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      await editProduct(selectedProduct.id, data);
      setIsModalOpen(false);
      setSelectedProduct(null);
      showToast('Producto actualizado correctamente', 'success');
    } catch {
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
        onCategoryChange={setSelectedCategory}
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
