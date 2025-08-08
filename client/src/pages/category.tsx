import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategorySectionModal } from "@/components/ui/category-modal";
import { useCategorySection } from "@/hooks/use-category"; 
import { Skeleton } from "@/components/ui/skeleton";
import { type Category as CategoryType, type InsertCategory } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// Helper function for artificial delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function CategorySection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryType | null>(null);
  
  // State for the loading spinner on the specific item being updated
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  
  // Hooks for showing toasts and invalidating queries
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus, // Get the new mutation from the hook
    isCreating,
    isUpdating,
    isDeleting,
  } = useCategorySection();

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: CategoryType) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (category: CategoryType) => {
    setDeletingCategory(category);
  };

  const confirmDelete = () => {
    if (deletingCategory) {
      deleteCategory.mutate(deletingCategory.id);
      setDeletingCategory(null);
    }
  };

  const handleModalSubmit = (data: InsertCategory) => {
    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, data });
    } else {
      createCategory.mutate(data);
    }
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  // Handler function for toggling the status
  const handleToggleStatus = async (category: CategoryType) => {
    setUpdatingStatusId(category.id);
    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    
    await sleep(1500); // Artificial delay for better UX

    toggleCategoryStatus.mutate(
      { id: category.id, status: newStatus },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["category-section"] });
          toast({
            title: "Status Updated!",
            description: `Category "${category.categoryName}" is now ${newStatus}.`,
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to update status: ${error.message}`,
            variant: "destructive",
          });
        },
        onSettled: () => {
          setUpdatingStatusId(null);
        },
      }
    );
  };

  if (isLoading) {
    // ... (Skeleton loading state)
    return (
        <div className="space-y-6">
          <div className="flex items-center justify-between"><Skeleton className="h-8 w-48" /><Skeleton className="h-10 w-40" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (<Skeleton key={i} className="h-64" />))}
          </div>
        </div>
      );
  }

  if (error) {
    // ... (Error state)
     return (
        <div className="text-center py-12 text-red-600">
          <h3 className="text-lg font-medium mb-2">Failed to load categories</h3>
          <p>{error.message}</p>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All Categories</h1>
        <Button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories?.map((category) => (
          <Card key={category.id} className="border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            {category.categoryImage && (
              <img src={category.categoryImage} alt={category.categoryName} className="w-full h-32 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            )}
            <CardContent className="p-4 flex flex-col flex-grow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-sm">{category.categoryName}</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteCategory(category)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              
              {category.mainCategory?.mainCategoryName && (
                <Badge variant="outline" className="mb-2 w-fit">
                  {category.mainCategory.mainCategoryName}
                </Badge>
              )}

              <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">{category.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-2">
                {/* --- UPDATED STATUS BADGE --- */}
                {updatingStatusId === category.id ? (
                  <Badge variant="secondary" className="flex items-center justify-center w-24">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                  </Badge>
                ) : (
                  <Badge
                    onClick={() => handleToggleStatus(category)}
                    className={`cursor-pointer w-20 justify-center transition-all hover:opacity-80 ${
                      category.status === "active"
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    {category.status}
                  </Badge>
                )}
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 h-auto" onClick={() => handleEditCategory(category)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories && categories.length === 0 && !isLoading }
       
      
      <CategorySectionModal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCategory(null); }}
        onSubmit={handleModalSubmit}
        category={editingCategory}
        isLoading={isCreating || isUpdating}
      />

      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        {/* ... (Alert dialog remains the same) */}
      </AlertDialog>
    </div>
  );
}