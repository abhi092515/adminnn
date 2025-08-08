import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { type Book } from "@/hooks/use-books";

// This interface should include all your form fields
interface BookFormValues {
  title: string;
  author: string;
  newPrice: number;
  shortDescription?: string;
  image1?: FileList; // react-hook-form handles file inputs as FileList
}

interface BookModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  book?: Book | null;
  isLoading?: boolean;
}

export function BookModal({ open, onClose, onSubmit, book, isLoading }: BookModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BookFormValues>();

  useEffect(() => {
    if (open) {
      if (book) {
        // Populate form with existing book data for editing
        reset({
          title: book.title,
          author: book.author,
          newPrice: book.newPrice,
          shortDescription: book.shortDescription,
        });
      } else {
        // Reset to default values for a new book
        reset({ title: '', author: '', newPrice: 0, shortDescription: '' });
      }
    }
  }, [book, open, reset]);

  const handleFormSubmit = (data: BookFormValues) => {
    const formData = new FormData();
    
    // Append all text/number fields to formData
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'image1' && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // Handle the file upload
    if (data.image1 && data.image1.length > 0) {
      formData.append('image1', data.image1[0]);
    }
    
    onSubmit(formData);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{book ? "Edit Book" : "Add New Book"}</DialogTitle>
          <DialogDescription>
            {book ? "Make changes to the book details here." : "Fill out the form to add a new book."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} id="book-form" className="space-y-4 pt-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title", { required: "Title is required" })} disabled={isLoading} />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="author">Author</Label>
              <Input id="author" {...register("author", { required: "Author is required" })} disabled={isLoading} />
              {errors.author && <p className="text-sm text-red-500 mt-1">{errors.author.message}</p>}
            </div>
            <div>
              <Label htmlFor="newPrice">Price (₹)</Label>
              <Input id="newPrice" type="number" {...register("newPrice", { required: "Price is required", valueAsNumber: true })} disabled={isLoading} />
              {errors.newPrice && <p className="text-sm text-red-500 mt-1">{errors.newPrice.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="shortDescription">Short Description</Label>
            <Textarea id="shortDescription" {...register("shortDescription")} disabled={isLoading} />
          </div>

          <div>
             <Label htmlFor="image1">Book Cover Image</Label>
             {book?.image1 && <img src={book.image1} alt="Current cover" className="w-20 h-24 object-cover my-2 rounded-md" />}
             <Input id="image1" type="file" {...register("image1")} disabled={isLoading} />
             <p className="text-xs text-gray-500 mt-1">Upload a new image to replace the current one.</p>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading} form="book-form">
              {isLoading ? "Saving..." : "Save Book"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}