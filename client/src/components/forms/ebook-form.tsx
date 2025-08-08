import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useEbooks } from "@/hooks/use-ebooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UploadCloud, File as FileIcon, X } from "lucide-react";

// A new, more stylish file input component
const FileUpload = ({ label, name, isEditMode, existingFileUrl, file, setFile }: any) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {isEditMode && existingFileUrl && !file && (
        <div className="text-sm text-muted-foreground">
          <a href={existingFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            View current file
          </a>
        </div>
      )}
      <div className="relative flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-background/50 text-center hover:bg-muted/50">
        <Input
          id={name}
          name={name}
          type="file"
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        />
        {file ? (
          <div className="flex items-center space-x-2 text-left">
            <FileIcon className="h-6 w-6" />
            <span className="max-w-[150px] truncate text-sm font-medium">{file.name}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.preventDefault(); setFile(null); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 text-muted-foreground">
            <UploadCloud className="h-8 w-8" />
            <p className="text-sm">Click or drag file to upload</p>
          </div>
        )}
      </div>
    </div>
  );
};


interface EbookFormProps {
  ebookId?: string;
}

export function EbookForm({ ebookId }: EbookFormProps) {
  const [_, setLocation] = useLocation();
  const { getEbookByIdQuery, createEbook, updateEbook } = useEbooks();

  const isEditMode = !!ebookId;
  const { data: ebookData, isLoading: isLoadingEbook } = getEbookByIdQuery(ebookId);
  
  // State for controlled components
  const [mainCategory, setMainCategory] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [image3, setImage3] = useState<File | null>(null);
  const [image4, setImage4] = useState<File | null>(null);
  const [samplePdf, setSamplePdf] = useState<File | null>(null);
  const [bookPdf, setBookPdf] = useState<File | null>(null);

  useEffect(() => {
    if (ebookData) {
      setMainCategory(ebookData.mainCategory?.id);
      setCategory(ebookData.category?.id);
    }
  }, [ebookData]);

  const isPending = createEbook.isPending || updateEbook.isPending;

  // Mock categories (replace with API call)
  // const mainCategories = [{ id: '66a938c5b162547d70468925', name: 'Academic' }];
  // const categories = [{ id: '66a93910b162547d7046892f', name: 'Computer Science' }];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Append controlled state values
    if (mainCategory) formData.set('mainCategory', mainCategory);
    if (category) formData.set('category', category);
    if (image1) formData.set('image1', image1);
    if (image2) formData.set('image2', image2);
    if (image3) formData.set('image3', image3);
    if (image4) formData.set('image4', image4);
    if (samplePdf) formData.set('samplePdf', samplePdf);
    if (bookPdf) formData.set('bookPdf', bookPdf);
    
    if (isEditMode) {
      updateEbook.mutate({ id: ebookId, formData }, {
        onSuccess: () => setLocation('/ebooks')
      });
    } else {
      createEbook.mutate(formData, {
        onSuccess: () => setLocation('/ebooks')
      });
    }
  };

  if (isEditMode && isLoadingEbook) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit E-book" : "Add New E-book"}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {isEditMode ? "Update the details for this e-book." : "Fill out the form to add a new e-book to the catalog."}
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Section 1: Core Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Core Information</h3>
            <hr />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" name="title" defaultValue={ebookData?.title} required /></div>
              <div className="space-y-2"><Label htmlFor="author">Author</Label><Input id="author" name="author" defaultValue={ebookData?.author} required /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="shortDescription">Short Description</Label><Textarea id="shortDescription" name="shortDescription" defaultValue={ebookData?.shortDescription} /></div>
            <div className="space-y-2"><Label htmlFor="fullDescription">Full Description</Label><Textarea id="fullDescription" name="fullDescription" rows={5} defaultValue={ebookData?.fullDescription} /></div>
          </div>

          {/* Section 2: Publication & Categorization */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Details & Categorization</h3>
            <hr />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              <div className="space-y-2"><Label htmlFor="publisher">Publisher</Label><Input id="publisher" name="publisher" defaultValue={ebookData?.publisher} /></div>
              <div className="space-y-2"><Label htmlFor="publicationDate">Publication Date</Label><Input id="publicationDate" name="publicationDate" type="date" defaultValue={ebookData?.publicationDate?.split('T')[0]} /></div>
              <div className="space-y-2"><Label htmlFor="pages">Pages</Label><Input id="pages" name="pages" type="number" defaultValue={ebookData?.pages} /></div>
              <div className="space-y-2"><Label htmlFor="mainCategory">Main Category</Label><Select name="mainCategory" value={mainCategory} onValueChange={setMainCategory}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{mainCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="category">Sub-Category</Label><Select name="category" value={category} onValueChange={setCategory}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
          </div>
          
          {/* Section 3: Pricing & Media */}
           <div className="space-y-4">
            <h3 className="text-lg font-medium">Pricing & Media</h3>
            <hr />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              <div className="space-y-2"><Label htmlFor="newPrice">New Price (₹)</Label><Input id="newPrice" name="newPrice" type="number" step="0.01" defaultValue={ebookData?.newPrice} required /></div>
              <div className="space-y-2"><Label htmlFor="oldPrice">Old Price (₹) (Optional)</Label><Input id="oldPrice" name="oldPrice" type="number" step="0.01" defaultValue={ebookData?.oldPrice} /></div>
              <div className="space-y-2"><Label htmlFor="videoLink">Video Link (Optional)</Label><Input id="videoLink" name="videoLink" type="url" placeholder="https://..." defaultValue={ebookData?.videoLink} /></div>
            </div>
           </div>
          
          {/* Section 4: File Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Assets</h3>
            <hr />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                <FileUpload label="Image 1 (Cover)" name="image1" isEditMode={isEditMode} existingFileUrl={ebookData?.image1} file={image1} setFile={setImage1} />
                <FileUpload label="Image 2" name="image2" isEditMode={isEditMode} existingFileUrl={ebookData?.image2} file={image2} setFile={setImage2} />
                <FileUpload label="Image 3" name="image3" isEditMode={isEditMode} existingFileUrl={ebookData?.image3} file={image3} setFile={setImage3} />
                <FileUpload label="Image 4" name="image4" isEditMode={isEditMode} existingFileUrl={ebookData?.image4} file={image4} setFile={setImage4} />
                <FileUpload label="Sample PDF" name="samplePdf" isEditMode={isEditMode} existingFileUrl={ebookData?.samplePdf} file={samplePdf} setFile={setSamplePdf} />
                <FileUpload label="Full Book PDF" name="bookPdf" isEditMode={isEditMode} existingFileUrl={ebookData?.bookPdf} file={bookPdf} setFile={setBookPdf} />
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => setLocation('/ebooks')}>Cancel</Button>
            <Button type="submit" disabled={isPending} size="lg">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Save Changes" : "Create E-book"}
            </Button>
        </CardFooter>
      </Card>
    </form>
  );
}