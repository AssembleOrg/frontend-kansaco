'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/api';
import { Category } from '@/types/category';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
} from '@/components/ui/responsive-dialog';
import { Loader2, Plus, RefreshCw, ArrowLeft } from 'lucide-react';
import { formatDateForDisplay } from '@/lib/dateUtils';
import { toast } from 'sonner';
import { PageHeader } from '@/features/crm/components/mobile/PageHeader';
import { RowActions } from '@/features/crm/components/mobile/RowActions';
import { CategoryCardMobile } from '@/features/categories/components/mobile/CategoryCardMobile';

export default function CategoriesPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const loadCategories = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getCategories(token);
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
      toast.error('Error al cargar categorías', {
        description: err instanceof Error ? err.message : 'No se pudieron cargar las categorías.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedCategory(null);
    setCategoryName('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setCategoryName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !categoryName.trim()) return;

    setIsSubmitting(true);
    try {
      if (selectedCategory) {
        await updateCategory(token, selectedCategory.id, { name: categoryName.trim() });
        toast.success('Categoría actualizada correctamente');
      } else {
        await createCategory(token, { name: categoryName.trim() });
        toast.success('Categoría creada correctamente');
      }
      handleCloseModal();
      await loadCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar la categoría';
      toast.error('Error al guardar categoría', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token || !categoryToDelete) return;

    try {
      await deleteCategory(token, categoryToDelete.id);
      toast.success('Categoría eliminada correctamente');
      await loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la categoría';

      if (errorMessage.includes('being used') || errorMessage.includes('en uso')) {
        toast.error('No se puede eliminar la categoría', {
          description: 'Esta categoría está siendo usada por uno o más productos.',
        });
      } else {
        toast.error('Error al eliminar categoría', {
          description: errorMessage,
        });
      }
    } finally {
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  useEffect(() => {
    if (!token || (user?.rol !== 'ADMIN' && user?.rol !== 'ASISTENTE')) {
      router.replace('/login?redirect=/admin/categories');
      return;
    }
    loadCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.rol, router]);

  if (isLoading && categories.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center mt-20">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <p className="text-xl text-gray-600">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="container mx-auto p-8 mt-20">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="mb-4 text-2xl font-semibold text-red-800">Error</h2>
          <p className="mb-6 text-red-600">{error}</p>
          <Button onClick={() => router.push('/admin/dashboard')} variant="outline" className="text-red-600 hover:bg-red-50">
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <Button
        variant="ghost"
        onClick={() => router.push('/admin/dashboard')}
        className="-ml-2 h-8 px-2 text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Dashboard
      </Button>

      <PageHeader
        title="Categorías"
        description="Crea, edita y elimina categorías de productos."
        actions={
          <>
            <Button
              onClick={loadCategories}
              variant="outline"
              size="sm"
              aria-label="Actualizar"
              className="hidden sm:inline-flex"
            >
              <RefreshCw className="mr-1 h-4 w-4" /> Actualizar
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={loadCategories}
              aria-label="Actualizar"
              className="sm:hidden"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleOpenCreateModal}
              size="sm"
              className="hidden bg-green-600 hover:bg-green-700 sm:inline-flex"
            >
              <Plus className="mr-1 h-4 w-4" /> Crear categoría
            </Button>
          </>
        }
      />

      {categories.length === 0 ? (
        <div className="rounded-xl border border-neutral-200/70 bg-white p-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <h3 className="mb-2 text-lg font-semibold text-neutral-900">
            No hay categorías
          </h3>
          <p className="mb-6 text-sm text-neutral-500">
            Crea tu primera categoría para comenzar.
          </p>
          <Button onClick={handleOpenCreateModal} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Crear categoría
          </Button>
        </div>
      ) : (
        <>
          {/* Mobile: lista de cards */}
          <div className="overflow-hidden rounded-xl border border-neutral-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:hidden">
            {categories.map((category) => (
              <CategoryCardMobile
                key={category.id}
                category={category}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden overflow-hidden rounded-xl border border-neutral-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-neutral-200/70 bg-neutral-50/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                      Creada
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                      Actualizada
                    </th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60 bg-white">
                  {categories.map((category) => (
                    <tr key={category.id} className="transition-colors hover:bg-neutral-50/60">
                      <td className="whitespace-nowrap px-6 py-3 text-sm tabular-nums text-neutral-500">
                        {category.id}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-neutral-900">
                        {category.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm tabular-nums text-neutral-600">
                        {formatDateForDisplay(category.createdAt, 'datetime')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm tabular-nums text-neutral-600">
                        {formatDateForDisplay(category.updatedAt, 'datetime')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <RowActions
                            onEdit={() => handleOpenEditModal(category)}
                            onDelete={() => handleDeleteClick(category)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAB nuevo (mobile) */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            aria-label="Crear categoría"
            className="fab-bottom fixed right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg shadow-green-600/30 transition-transform active:scale-95 sm:hidden"
          >
            <Plus className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Create/Edit Modal */}
      <ResponsiveDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ResponsiveDialogContent className="sm:max-w-[425px]">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              {selectedCategory ? 'Editar categoría' : 'Crear nueva categoría'}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {selectedCategory
                ? 'Modifica el nombre de la categoría.'
                : 'Ingresa el nombre de la nueva categoría.'}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre de la categoría *</Label>
                <Input
                  id="name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ej: Vehículos, Industrial, etc."
                  disabled={isSubmitting}
                  maxLength={120}
                  required
                />
                <p className="text-xs text-neutral-500">
                  Máximo 120 caracteres
                </p>
              </div>
            </div>
            <ResponsiveDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !categoryName.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : selectedCategory ? (
                  'Actualizar'
                ) : (
                  'Crear'
                )}
              </Button>
            </ResponsiveDialogFooter>
          </form>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      {/* Delete Confirmation Dialog */}
      <ResponsiveDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <ResponsiveDialogContent className="sm:max-w-[425px]">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>¿Eliminar categoría?</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Estás a punto de eliminar la categoría &quot;{categoryToDelete?.name}&quot;.
              {categoryToDelete && (
                <>
                  <br />
                  <br />
                  <strong>Nota:</strong> No podrás eliminar esta categoría si está siendo usada por uno o más productos.
                </>
              )}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div>
  );
}
