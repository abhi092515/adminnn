"use client"

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocation } from "wouter";
import { useBooks } from '@/hooks/use-books';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = "http://localhost:5099/api";

const bookFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  edition: z.string().optional(),
  publisher: z.string().optional(),
  publicationDate: z.string().optional(),
  language: z.string().min(1, "Language is required"),
  dimensions: z.string().optional(),
  pages: z.coerce.number().int().positive().optional(),
  mainCategory: z.string().min(1, "Main Category is required"),
  category: z.string().min(1, "Category is required"),
  videoLink: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  oldPrice: z.coerce.number().positive().optional(),
  newPrice: z.coerce.number().positive("Price is required"),
  status: z.enum(["active", "inactive", "out-of-stock"]).default("active"),
  image1: z.any().optional(),
  image2: z.any().optional(),
  image3: z.any().optional(),
  image4: z.any().optional(),
  samplePdf: z.any().optional(),
});

type BookFormData = z.infer<typeof bookFormSchema>;
interface CategoryOption { id: string; categoryName: string; }
interface MainCategoryOption { id: string; mainCategoryName: string; }

interface BookFormProps {
  bookId?: string;
}

export function BookForm({ bookId }: BookFormProps) {
  const [_, setLocation] = useLocation();
  const { getBookByIdQuery, createBook, updateBook } = useBooks();
  const isEditMode = !!bookId;
  const { data: initialData, isLoading: isLoadingData } = getBookByIdQuery(bookId);

  const [mainCategories, setMainCategories] = useState<MainCategoryOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: { status: 'active' },
  });

  const selectedMainCategory = form.watch("mainCategory");

  useEffect(() => {
    fetch(`${API_BASE_URL}/main-categories`).then(res => res.json()).then(data => setMainCategories(data.data || []));
  }, []);

  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset({
        ...initialData,
        publicationDate: initialData.publicationDate ? new Date(initialData.publicationDate).toISOString().split('T')[0] : '',
        mainCategory: initialData.mainCategory?.id || "",
        category: initialData.category?.id || "",
      });
    }
  }, [initialData, isEditMode, form]);

  useEffect(() => {
    const mainCategoryId = selectedMainCategory || initialData?.mainCategory?.id;
    if (mainCategoryId) {
      fetch(`${API_BASE_URL}/categories?mainCategoryId=${mainCategoryId}`).then(res => res.json()).then(data => setCategories(data.data || []));
      if (selectedMainCategory !== initialData?.mainCategory?.id) form.setValue('category', '');
    } else {
      setCategories([]);
    }
  }, [selectedMainCategory, initialData, form]);

  const onSubmit = (data: BookFormData) => {
    const formData = new FormData();
    const fileFieldKeys = ['image1', 'image2', 'image3', 'image4', 'samplePdf'];
    
    Object.entries(data).forEach(([key, value]) => {
      if (fileFieldKeys.includes(key)) {
        if (value instanceof File) formData.append(key, value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    if (isEditMode) {
      updateBook.mutate({ id: bookId, formData }, { onSuccess: () => setLocation('/books') });
    } else {
      createBook.mutate(formData, { onSuccess: () => setLocation('/books') });
    }
  };
  
  const onValidationErrors = (errors: any) => {
    console.error("Form Validation Errors:", errors);
    toast.error("Please fix the validation errors before submitting.");
  };

  const isSubmitting = createBook.isPending || updateBook.isPending;

  if (isLoadingData) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onValidationErrors)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader><CardTitle>Core Information</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="author" render={({ field }) => (<FormItem><FormLabel>Author</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="shortDescription" render={({ field }) => (<FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="fullDescription" render={({ field }) => (<FormItem><FormLabel>Full Description</FormLabel><FormControl><Textarea rows={6} {...field} /></FormControl><FormMessage /></FormItem>)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>File Uploads</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* ✅ UPDATED Image 1 Field */}
                <FormField control={form.control} name="image1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image 1 (Cover)</FormLabel>
                    {isEditMode && initialData?.image1 && <img src={initialData.image1} alt="Current Cover" className="w-24 h-32 object-cover rounded-md my-2 border" />}
                    <FormControl><Input type="file" accept="image/*" onChange={e => field.onChange(e.target.files?.[0])} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {/* ✅ UPDATED Image 2 Field */}
                <FormField control={form.control} name="image2" render={({ field }) => (
                   <FormItem>
                    <FormLabel>Image 2</FormLabel>
                    {isEditMode && initialData?.image2 && <img src={initialData.image2} alt="Current Image 2" className="w-24 h-32 object-cover rounded-md my-2 border" />}
                    <FormControl><Input type="file" accept="image/*" onChange={e => field.onChange(e.target.files?.[0])} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {/* ✅ UPDATED Image 3 Field */}
                <FormField control={form.control} name="image3" render={({ field }) => (
                   <FormItem>
                    <FormLabel>Image 3</FormLabel>
                    {isEditMode && initialData?.image3 && <img src={initialData.image3} alt="Current Image 3" className="w-24 h-32 object-cover rounded-md my-2 border" />}
                    <FormControl><Input type="file" accept="image/*" onChange={e => field.onChange(e.target.files?.[0])} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 {/* ✅ UPDATED Image 4 Field */}
                <FormField control={form.control} name="image4" render={({ field }) => (
                   <FormItem>
                    <FormLabel>Image 4</FormLabel>
                    {isEditMode && initialData?.image4 && <img src={initialData.image4} alt="Current Image 4" className="w-24 h-32 object-cover rounded-md my-2 border" />}
                    <FormControl><Input type="file" accept="image/*" onChange={e => field.onChange(e.target.files?.[0])} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 {/* ✅ UPDATED PDF Field */}
                <FormField control={form.control} name="samplePdf" render={({ field }) => (
                   <FormItem>
                    <FormLabel>Sample PDF</FormLabel>
                    {isEditMode && initialData?.samplePdf && <a href={initialData.samplePdf} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block my-2">View Current PDF</a>}
                    <FormControl><Input type="file" accept=".pdf" onChange={e => field.onChange(e.target.files?.[0])} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <Card>
              <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="out-of-stock">Out of Stock</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="mainCategory" render={({ field }) => (<FormItem><FormLabel>Main Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent>{mainCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.mainCategoryName}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedMainCategory}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.categoryName}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Details</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <FormField control={form.control} name="newPrice" render={({ field }) => (<FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="oldPrice" render={({ field }) => (<FormItem><FormLabel>Old Price (Optional)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="publisher" render={({ field }) => (<FormItem><FormLabel>Publisher</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="publicationDate" render={({ field }) => (<FormItem><FormLabel>Publication Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="edition" render={({ field }) => (<FormItem><FormLabel>Edition</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="pages" render={({ field }) => (<FormItem><FormLabel>Pages</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="language" render={({ field }) => (<FormItem><FormLabel>Language</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="dimensions" render={({ field }) => (<FormItem><FormLabel>Dimensions</FormLabel><FormControl><Input placeholder="e.g., 6 x 9 inches" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="videoLink" render={({ field }) => (<FormItem><FormLabel>Video Link (Optional)</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>)} />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Update Book' : 'Create Book'}
          </Button>
        </div>
      </form>
    </Form>
  );
}