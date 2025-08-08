import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// FIX: Import the specific schemas and types for MainCategory
import { insertMainCategorySchema, type MainCategory, type InsertMainCategory } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Upload, X } from "lucide-react";

// FIX: Props are now specific to MainCategory
interface MainCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: InsertMainCategory) => void; 
  category?: MainCategory | null;
  isLoading?: boolean; 
}

// FIX: Renamed component for clarity
export function MainCategoryModal({ open, onClose, onSubmit, category, isLoading }: MainCategoryModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // FIX: Form now uses the specific type and schema for MainCategory
  const form = useForm<InsertMainCategory>({
    resolver: zodResolver(insertMainCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      assignedToHeader: false,
      image: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      if (category) {
        // FIX: Pre-fill the form with correct property names
        form.reset({
          name: category.mainCategoryName,
          description: category.description || "",
          status: category.status as "active" | "inactive",
          assignedToHeader: category.assignedToHeader || false,
          image: undefined,
        });
        setImagePreview(category.mainCategoryImage || null);
      } else {
        // Reset the form for creating a new category
        form.reset({
          name: "",
          description: "",
          status: "active",
          assignedToHeader: false,
          image: undefined,
        });
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
    const fileInput = document.getElementById('category-image') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // FIX: The `data` type is now correctly `InsertMainCategory`
  const handleSubmit = (data: InsertMainCategory) => {
    onSubmit(data);
  };

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Main Category" : "Add New Main Category"}</DialogTitle>
           <DialogDescription>
            {category ? "Make changes to your main category here." : "Add a new main category to your list."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} id="main-category-form" className="space-y-4 pt-4">
            <FormItem>
              <Label>Main Category Image</Label>
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
                    type="file" className="hidden" id="category-image"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <Button
                  type="button" variant="outline" className="mt-2 text-sm"
                  onClick={() => document.getElementById('category-image')?.click()}
                  disabled={isLoading}
                >
                  Browse Files
                </Button>
              </div>
              <FormMessage />
            </FormItem>

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <Label htmlFor="name">Main Category Name</Label>
                <FormControl><Input id="name" placeholder="Enter category name" {...field} disabled={isLoading} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <Label htmlFor="description">Description</Label>
                <FormControl><Textarea id="description" placeholder="Enter category description" rows={3} {...field} disabled={isLoading} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>

            <FormField control={form.control} name="assignedToHeader" render={({ field }) => (
              <FormItem>
                <Label>Assigned to header</Label>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === "yes")}
                    value={field.value ? "yes" : "no"}
                    className="flex space-x-4 mt-2"
                    disabled={isLoading}
                  >
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><Label>Yes</Label></FormItem>
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><Label>No</Label></FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}/>

            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <Label>Status</Label>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}/>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading} form="main-category-form">
                {isLoading ? "Saving..." : "Save Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}