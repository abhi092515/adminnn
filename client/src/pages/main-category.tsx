import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MainCategoryModal } from "@/components/ui/main-category-modal";
import { useMainCategories } from "@/hooks/use-mainCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { type MainCategory, type InsertMainCategory } from "@shared/schema";
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function MainCategoryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MainCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<MainCategory | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    mainCategories,
    isLoading,
    error,
    createMainCategory,
    updateMainCategory,
    deleteMainCategory,
    toggleMainCategoryStatus,
    isCreating,
    isUpdating,
    isDeleting,
  } = useMainCategories();

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: MainCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (category: MainCategory) => {
    setDeletingCategory(category);
  };

  const confirmDelete = () => {
    if (deletingCategory) {
      deleteMainCategory.mutate(deletingCategory.id);
      setDeletingCategory(null);
    }
  };

  const handleModalSubmit = (data: InsertMainCategory) => {
    if (editingCategory) {
      updateMainCategory.mutate({ id: editingCategory.id, data });
    } else {
      createMainCategory.mutate(data);
    }
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleToggleStatus = async (category: MainCategory) => {
    setUpdatingStatusId(category.id);
    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    
    await sleep(1500);

    toggleMainCategoryStatus.mutate(
      { id: category.id, status: newStatus },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["main-categories"] });
          toast({
            title: "Status Updated!",
            description: `Category "${category.mainCategoryName}" is now ${newStatus}.`,
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
    // Skeleton loading state remains the same
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between"><Skeleton className="h-8 w-48" /><Skeleton className="h-10 w-40" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (<Skeleton key={i} className="h-40" />))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-red-600"><h3 className="text-lg font-medium mb-2">Failed to load categories</h3><p>{error.message}</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All Main Categories</h1>
        <Button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Main Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mainCategories?.map((category) => (
          // --- CSS UPDATE: Card styling is simplified for this layout ---
          <Card key={category.id} className="border shadow-sm transition-all hover:shadow-md">
            {/* --- CSS UPDATE: The CardContent now uses flexbox for the new layout --- */}
            <CardContent className="p-4 flex items-start gap-4">
              
              {/* --- Image Container (Left side) --- */}
              {category.mainCategoryImage ? (
                <img
                  src={category.mainCategoryImage}
                  alt={category.mainCategoryName}
                  className="w-full h-36 object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-secondary flex items-center justify-center rounded-md flex-shrink-0">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
              )}

              {/* --- Content Container (Right side) --- */}
              <div className="flex flex-col flex-grow h-full">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-sm mb-1">{category.mainCategoryName}</h3>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteCategory(category)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-2 flex-grow">{category.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
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
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 p-1 h-auto" onClick={() => handleEditCategory(category)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mainCategories && mainCategories.length === 0 && !isLoading && (
        <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No main categories yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first main category.</p>
            <Button onClick={handleAddCategory}><Plus className="h-4 w-4 mr-2" />Add New Main Category</Button>
        </div>
      )}

      <MainCategoryModal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCategory(null); }}
        onSubmit={handleModalSubmit}
        category={editingCategory}
        isLoading={isCreating || isUpdating}
      />

      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Main Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCategory?.mainCategoryName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}