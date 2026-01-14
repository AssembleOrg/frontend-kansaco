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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
// Using Dialog for delete confirmation instead of AlertDialog if not available
import { Loader2, Plus, Edit, Trash2, RefreshCw, ArrowLeft } from 'lucide-react';
import { formatDateForDisplay } from '@/lib/dateUtils';
import { toast } from 'sonner';

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
        // Editar categoría
        await updateCategory(token, selectedCategory.id, { name: categoryName.trim() });
        toast.success('Categoría actualizada correctamente');
      } else {
        // Crear categoría
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
      
      // Verificar si es el error de categoría en uso
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
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestionar Categorías</h1>
            <p className="mt-2 text-gray-600">
              Crea, edita y elimina categorías de productos.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadCategories} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={handleOpenCreateModal} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Crear Categoría
            </Button>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      {categories.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            No hay categorías
          </h3>
          <p className="mb-6 text-gray-600">
            Crea tu primera categoría para comenzar.
          </p>
          <Button onClick={handleOpenCreateModal} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Crear Categoría
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Creada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Actualizada
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {category.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {formatDateForDisplay(category.createdAt, 'datetime')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {formatDateForDisplay(category.updatedAt, 'datetime')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditModal(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(category)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? 'Modifica el nombre de la categoría.'
                : 'Ingresa el nombre de la nueva categoría.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre de la Categoría *</Label>
                <Input
                  id="name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ej: Vehículos, Industrial, etc."
                  disabled={isSubmitting}
                  maxLength={120}
                  required
                />
                <p className="text-xs text-gray-500">
                  Máximo 120 caracteres
                </p>
              </div>
            </div>
            <DialogFooter>
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>¿Eliminar categoría?</DialogTitle>
            <DialogDescription>
              Estás a punto de eliminar la categoría &quot;{categoryToDelete?.name}&quot;.
              {categoryToDelete && (
                <>
                  <br />
                  <br />
                  <strong>Nota:</strong> No podrás eliminar esta categoría si está siendo usada por uno o más productos.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
