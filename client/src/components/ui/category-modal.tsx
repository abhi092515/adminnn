import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCategorySchema, type Category, type InsertCategory } from "@shared/schema"; 
import { useMainCategories } from "@/hooks/use-mainCategories";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload, X } from "lucide-react";

interface CategorySectionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: InsertCategory) => void; 
  category?: Category | null;
  isLoading?: boolean;
}

export function CategorySectionModal({ open, onClose, onSubmit, category, isLoading }: CategorySectionModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // FIX 1: Correctly destructure the properties returned by the hook.
  const { 
    mainCategories, 
    isLoading: isLoadingMainCategories,
    error: mainCategoriesError 
  } = useMainCategories();

  // Add this console.log to see the hook data
  console.log("Dropdown Data Hook:", {
    mainCategories,
    isLoadingMainCategories,
    mainCategoriesError,
  });

  const form = useForm<InsertCategory>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: { name: "", description: "", status: "active", image: undefined, mainCategory: "" },
  });

  useEffect(() => {
    if (open) {
      if (category) {
        form.reset({
          name: category.categoryName,
          // FIX 2: Use the correct property 'categoryDescription'
          description: category.categoryDescription || "",
          status: category.status as "active" | "inactive",
          mainCategory: category.mainCategory?.id || "",
          image: undefined,
        });
        setImagePreview(category.categoryImage || null);
      } else {
        form.reset({ name: "", description: "", status: "active", image: undefined, mainCategory: "" });
        setImagePreview(null);
      }
    }
  }, [category, open, form.reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      form.setValue("image", file, { shouldValidate: true });
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    form.setValue("image", null, { shouldValidate: true });
    const fileInput = document.getElementById('category-section-image') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };
  
  const handleSubmit = (data: InsertCategory) => { onSubmit(data); };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Add New Category"}</DialogTitle>
          <DialogDescription>Fill in the details for the category. All fields are required.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} id="category-section-form" className="space-y-4 pt-4">
            
            <FormField control={form.control} name="mainCategory" render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Main Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || isLoadingMainCategories}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a main category" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {/* This .map will now work correctly */}
                    {mainCategories?.map(mc => (
                      <SelectItem key={mc.id} value={mc.id}>{mc.mainCategoryName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}/>

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl><Input placeholder="e.g., SSC CGL Maths" {...field} disabled={isLoading} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            
            <FormItem>
              <Label>Category Image</Label>
              <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto rounded"/>
                    <Button
                      type="button" variant="destructive" size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={handleRemoveImage}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Choose file or drag and drop</p>
                  </div>
                )}
                <FormControl>
                  <Input
                    type="file" className="hidden" id="category-section-image"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <Button
                  type="button" variant="outline" className="mt-2 text-sm"
                  onClick={() => document.getElementById('category-section-image')?.click()}
                  disabled={isLoading}
                >
                  Browse Files
                </Button>
              </div>
              <FormMessage />
            </FormItem>
            
            <FormField control={form.control} name="description" render={({ field }) => (
               <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="A brief description..." {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>
            )}/>

            <FormField control={form.control} name="status" render={({ field }) => (
               <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )}/>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading} form="category-section-form">Save Category</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}