import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { type Ebook } from "@/hooks/use-ebooks";

interface EbookFormValues {
  title: string;
  author: string;
  newPrice: number;
  shortDescription?: string;
  image1?: FileList;
  samplePdf?: FileList;
  bookPdf?: FileList; // ✨ Added new field for the full PDF
}

interface EbookModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  ebook?: Ebook | null;
  isLoading?: boolean;
}

export function EbookModal({ open, onClose, onSubmit, ebook, isLoading }: EbookModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EbookFormValues>();

  useEffect(() => {
    if (open) {
      if (ebook) {
        reset({
          title: ebook.title,
          author: ebook.author,
          newPrice: ebook.newPrice,
          shortDescription: ebook.shortDescription,
        });
      } else {
        reset({ title: '', author: '', newPrice: 0, shortDescription: '' });
      }
    }
  }, [ebook, open, reset]);

  const handleFormSubmit = (data: EbookFormValues) => {
    const formData = new FormData();
    
    // Append all fields except files
    Object.entries(data).forEach(([key, value]) => {
      if (!['image1', 'samplePdf', 'bookPdf'].includes(key) && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // Handle file uploads
    if (data.image1?.[0]) formData.append('image1', data.image1[0]);
    if (data.samplePdf?.[0]) formData.append('samplePdf', data.samplePdf[0]);
    if (data.bookPdf?.[0]) formData.append('bookPdf', data.bookPdf[0]);
    
    onSubmit(formData);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{ebook ? "Edit E-book" : "Add New E-book"}</DialogTitle>
          <DialogDescription>
            Fill out the form to add a new e-book to the catalog.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} id="ebook-form" className="space-y-4 pt-4">
          {/* ... Other fields like title, author, price ... */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title", { required: "Title is required" })} disabled={isLoading} />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
             <Label htmlFor="image1">Cover Image</Label>
             {ebook?.image1 && <img src={ebook.image1} alt="Current cover" className="w-20 h-24 object-cover my-2 rounded-md" />}
             <Input id="image1" type="file" accept="image/*" {...register("image1")} disabled={isLoading} />
          </div>

          <div>
             <Label htmlFor="samplePdf">Sample PDF</Label>
             <Input id="samplePdf" type="file" accept=".pdf" {...register("samplePdf")} disabled={isLoading} />
             {ebook && <p className="text-xs text-gray-500 mt-1">Upload a new file to replace the current one.</p>}
          </div>
          
          {/* ✨ New Field for the full E-book PDF */}
          <div>
             <Label htmlFor="bookPdf">Full E-book PDF</Label>
             <Input id="bookPdf" type="file" accept=".pdf" {...register("bookPdf")} disabled={isLoading} />
             {ebook && <p className="text-xs text-gray-500 mt-1">Upload a new file to replace the current one.</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading} form="ebook-form">
              {isLoading ? "Saving..." : "Save E-book"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}