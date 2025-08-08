// "use client"

// import React, { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Switch } from '@/components/ui/switch';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Loader2, FileText } from 'lucide-react';
// import { PdfData } from '@/types/pdf';

// const BACKEND_API_URL = "http://localhost:5099/api";

// interface SelectOption { id: string; name: string; }

// const pdfFormSchema = z.object({
//     title: z.string().min(1, "Title is required"),
//     description: z.string().min(1, "Description is required"),
//     link: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
//     teacherName: z.string().min(1, "Teacher name is required"),
//     priority: z.coerce.number().min(0, "Priority must be 0 or greater"),
//     status: z.enum(["active", "inactive", "draft"]),
//     isChat: z.boolean().default(false),
//     isFree: z.boolean().default(false),
//     isLive: z.boolean().default(false),
//     mainCategory: z.string().min(1, "A main category is required"),
//     category: z.string().min(1, "A category is required"),
//     section: z.string().min(1, "A section is required"),
//     topic: z.string().min(1, "A topic is required"),
//     image: z.any().optional(),
//     uploadPdf: z.any().optional(),
//     courseBanner: z.string().url().optional().or(z.literal('')),
// });

// type PdfFormData = z.infer<typeof pdfFormSchema>;

// interface PdfFormProps {
//     onSubmit: (data: PdfFormData) => Promise<void>;
//     initialData?: PdfData;
//     isLoading?: boolean;
//     mode?: 'create' | 'edit';
// }

// export function PdfForm({ onSubmit, initialData, isLoading = false, mode = 'create' }: PdfFormProps) {
//     const [imagePreview, setImagePreview] = useState<string | null>(null);
//     const [pdfPreview, setPdfPreview] = useState<string | null>(null);
    
//     const [mainCategories, setMainCategories] = useState<SelectOption[]>([]);
//     const [categories, setCategories] = useState<SelectOption[]>([]);
//     const [sections, setSections] = useState<SelectOption[]>([]);
//     const [topics, setTopics] = useState<SelectOption[]>([]);

//     const form = useForm<PdfFormData>({
//         resolver: zodResolver(pdfFormSchema),
//         defaultValues: initialData || { status: 'draft', isChat: false, isFree: false, isLive: false, priority: 0 },
//     });
    
//     useEffect(() => {
//       if (mode === 'edit' && initialData) {
//           const values = {
//               ...initialData,
//               mainCategory: initialData.mainCategory?.id || "",
//               category: initialData.category?.id || "",
//               section: initialData.section?.id || "",
//               topic: initialData.topic?.id || "",
//           };
//           form.reset(values);
//           setImagePreview(initialData.image || null);
//           setPdfPreview(initialData.uploadPdf || null);
//       }
//   }, [initialData, mode, form]);

//   const selectedMainCategory = form.watch("mainCategory");
//   const selectedCategory = form.watch("category");
//   const selectedSection = form.watch("section");

//   const fetchOptions = async (url: string, nameField: string): Promise<SelectOption[]> => {
//       try {
//           const response = await fetch(url);
//           if (!response.ok) return [];
//           const result = await response.json();
//           const dataArray = result.data || result || [];
//           return dataArray.map((item: any) => ({ id: item.id, name: item[nameField] }));
//       } catch (error) {
//           console.error(`Failed to fetch from ${url}`, error);
//           return [];
//       }
//   }
    
//   useEffect(() => {
//     fetchOptions(`${BACKEND_API_URL}/main-categories`, 'mainCategoryName').then(setMainCategories);

//     if (mode === 'edit' && initialData) {
//         if (initialData.mainCategory?.id) fetchOptions(`${BACKEND_API_URL}/categories?mainCategoryId=${initialData.mainCategory.id}`, 'categoryName').then(setCategories);
//         if (initialData.category?.id) fetchOptions(`${BACKEND_API_URL}/sections?categoryId=${initialData.category.id}`, 'sectionName').then(setSections);
//         if (initialData.section?.id) fetchOptions(`${BACKEND_API_URL}/topics?sectionId=${initialData.section.id}`, 'topicName').then(setTopics);
//     }
// }, [initialData, mode]);

// useEffect(() => {
//   if (selectedMainCategory && selectedMainCategory !== initialData?.mainCategory?.id) {
//       fetchOptions(`${BACKEND_API_URL}/categories?mainCategoryId=${selectedMainCategory}`, 'categoryName').then(setCategories);
//       form.setValue('category', ''); setSections([]); setTopics([]);
//   }
// }, [selectedMainCategory, initialData, form]);

// useEffect(() => {
//   if (selectedCategory && selectedCategory !== initialData?.category?.id) {
//       fetchOptions(`${BACKEND_API_URL}/sections?categoryId=${selectedCategory}`, 'sectionName').then(setSections);
//       form.setValue('section', ''); setTopics([]);
//   }
// }, [selectedCategory, initialData, form]);
    
// useEffect(() => {
//   if (selectedSection && selectedSection !== initialData?.section?.id) {
//       fetchOptions(`${BACKEND_API_URL}/topics?sectionId=${selectedSection}`, 'topicName').then(setTopics);
//       form.setValue('topic', '');
//   }
// }, [selectedSection, initialData, form]);

// const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "image" | "uploadPdf") => {
//   const file = e.target.files?.[0];
//   if (file) {
//       form.setValue(fieldName, file);
//       if (fieldName === "image") setImagePreview(URL.createObjectURL(file));
//       else setPdfPreview(file.name);
//   }
// };

//     return (
//         <Card className="w-full max-w-6xl mx-auto">
//             <CardHeader>
//             <CardTitle className="text-2xl font-bold">{mode === 'create' ? 'Add New PDF' : 'Edit PDF'}</CardTitle>

//             </CardHeader>
//             <CardContent>
//                 <Form {...form}>
//                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                             <div className="space-y-6">
//                                 <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Enter PDF title" {...field} /></FormControl><FormMessage /></FormItem>)} />
//                                 <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Enter PDF description" {...field} /></FormControl><FormMessage /></FormItem>)} />
//                                 <FormField control={form.control} name="teacherName" render={({ field }) => (<FormItem><FormLabel>Teacher Name</FormLabel><FormControl><Input placeholder="Enter teacher name" {...field} /></FormControl><FormMessage /></FormItem>)} />
//                                 <FormField control={form.control} name="link" render={({ field }) => (<FormItem><FormLabel>External Link (Optional)</FormLabel><FormControl><Input placeholder="https://example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
//                                 <FormField control={form.control} name="courseBanner" render={({ field }) => (<FormItem><FormLabel>Course Banner URL (Optional)</FormLabel><FormControl><Input placeholder="https://example.com/banner.jpg" {...field} /></FormControl><FormMessage /></FormItem>)} />
//                             </div>
//                             <div className="space-y-6">
//                                 <div className="grid grid-cols-2 gap-6">
//                                     <FormField control={form.control} name="priority" render={({ field }) => (<FormItem><FormLabel>Priority</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>)} />
//                                     <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
//                                 </div>
//                                 <div className="flex items-center space-x-8 pt-4">
//                                     <FormField control={form.control} name="isFree" render={({ field }) => (<FormItem className="flex items-center gap-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Free PDF</FormLabel></FormItem>)} />
//                                     <FormField control={form.control} name="isChat" render={({ field }) => (<FormItem className="flex items-center gap-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Enable Chat</FormLabel></FormItem>)} />
//                                     <FormField control={form.control} name="isLive" render={({ field }) => (<FormItem className="flex items-center gap-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Live Session</FormLabel></FormItem>)} />
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                             <FormField control={form.control} name="mainCategory" render={({ field }) => (<FormItem><FormLabel>Main Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent>{mainCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
//                             <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedMainCategory}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
//                             <FormField control={form.control} name="section" render={({ field }) => (<FormItem><FormLabel>Section</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedCategory}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent>{sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
//                             <FormField control={form.control} name="topic" render={({ field }) => (<FormItem><FormLabel>Topic</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedSection}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent>{topics.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                             <FormField control={form.control} name="image" render={() => (<FormItem><FormLabel>Thumbnail Image</FormLabel><FormControl><Input type="file" accept="image/*" onChange={e => handleFileChange(e, "image")} /></FormControl>{imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-32 w-auto rounded-lg object-cover" />}<FormMessage /></FormItem>)} />
//                             <FormField control={form.control} name="uploadPdf" render={() => (<FormItem><FormLabel>PDF File</FormLabel><FormControl><Input type="file" accept=".pdf" onChange={e => handleFileChange(e, "uploadPdf")} /></FormControl>{pdfPreview && <div className="mt-2 flex items-center gap-2 text-sm text-gray-600"><FileText className="h-5 w-5" /><span>{pdfPreview.split('/').pop()}</span></div>}<FormMessage /></FormItem>)} />
//                         </div>
//                         <div className="flex justify-end">
//                             <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
//                                 {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{mode === 'create' ? 'Creating...' : 'Updating...'}</>) : (mode === 'create' ? 'Create PDF' : 'Update PDF')}
//                             </Button>
//                         </div>
//                     </form>
//                 </Form>
//             </CardContent>
//         </Card>
//     );
// } 


"use client"

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText } from 'lucide-react';
import { PdfData } from '@/types/pdf';

const BACKEND_API_URL = "http://localhost:5099/api";

interface SelectOption { id: string; name: string; }

const pdfFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    link: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    teacherName: z.string().min(1, "Teacher name is required").optional(),
    priority: z.coerce.number().min(0, "Priority must be 0 or greater"),
    status: z.enum(["active", "inactive", "draft"]),
    isChat: z.boolean().default(false),
    isFree: z.boolean().default(false),
    isLive: z.boolean().default(false),
    mainCategory: z.string().min(1, "A main category is required"),
    category: z.string().min(1, "A category is required"),
    section: z.string().min(1, "A section is required"),
    topic: z.string().min(1, "A topic is required"),
    image: z.any().optional(),
    uploadPdf: z.any().optional(),
    courseBanner: z.string().url().optional().or(z.literal('')),
});

export type PdfFormData = z.infer<typeof pdfFormSchema>;

interface PdfFormProps {
    onSubmit: (data: PdfFormData) => Promise<void>;
    initialData?: PdfData;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}

// ✅ FIX 1: Define a complete default state for the form
const defaultValues: PdfFormData = {
  title: "",
  description: "",
  link: "",
  teacherName: "",
  priority: 0,
  status: "draft",
  isChat: false,
  isFree: false,
  isLive: false,
  mainCategory: "",
  category: "",
  section: "",
  topic: "",
  image: undefined,
  uploadPdf: undefined,
  courseBanner: "",
};

export function PdfForm({ onSubmit, initialData, isLoading = false, mode = 'create' }: PdfFormProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [pdfPreview, setPdfPreview] = useState<string | null>(null);
    
    const [mainCategories, setMainCategories] = useState<SelectOption[]>([]);
    const [categories, setCategories] = useState<SelectOption[]>([]);
    const [sections, setSections] = useState<SelectOption[]>([]);
    const [topics, setTopics] = useState<SelectOption[]>([]);

    const form = useForm<PdfFormData>({
        resolver: zodResolver(pdfFormSchema),
        // ✅ FIX 2: Use the full defaultValues object for create mode to prevent uncontrolled input warnings
        defaultValues: initialData || defaultValues,
    });
    
    useEffect(() => {
      if (mode === 'edit' && initialData) {
          const values = {
              ...initialData,
              mainCategory: initialData.mainCategory?.id || "",
              category: initialData.category?.id || "",
              section: initialData.section?.id || "",
              topic: initialData.topic?.id || "",
          };
          form.reset(values);
          setImagePreview(initialData.image || null);
          setPdfPreview(initialData.uploadPdf || null);
      }
    }, [initialData, mode, form]);

    const selectedMainCategory = form.watch("mainCategory");
    const selectedCategory = form.watch("category");
    const selectedSection = form.watch("section");

    const fetchOptions = async (url: string, nameField: string): Promise<SelectOption[]> => {
        try {
            const response = await fetch(url);
            if (!response.ok) return [];
            const result = await response.json();
            const dataArray = result.data || result || [];
            return dataArray.map((item: any) => ({ id: item.id || item._id, name: item[nameField] }));
        } catch (error) {
            console.error(`Failed to fetch from ${url}`, error);
            return [];
        }
    }
    
    // Fetch initial dropdown options
    useEffect(() => {
        fetchOptions(`${BACKEND_API_URL}/main-categories`, 'mainCategoryName').then(setMainCategories);

        if (mode === 'edit' && initialData) {
            if (initialData.mainCategory?.id) fetchOptions(`${BACKEND_API_URL}/categories?mainCategoryId=${initialData.mainCategory.id}`, 'categoryName').then(setCategories);
            if (initialData.category?.id) fetchOptions(`${BACKEND_API_URL}/sections?categoryId=${initialData.category.id}`, 'sectionName').then(setSections);
            if (initialData.section?.id) fetchOptions(`${BACKEND_API_URL}/topics?sectionId=${initialData.section.id}`, 'topicName').then(setTopics);
        }
    }, [initialData, mode]);

    // ✅ FIX 3: Simplified cascading dropdown logic
    useEffect(() => {
        if (selectedMainCategory) {
            fetchOptions(`${BACKEND_API_URL}/categories?mainCategoryId=${selectedMainCategory}`, 'categoryName').then(setCategories);
            form.setValue('category', ''); 
            setSections([]); 
            setTopics([]);
        }
    }, [selectedMainCategory, form]);

    useEffect(() => {
        if (selectedCategory) {
            fetchOptions(`${BACKEND_API_URL}/sections?categoryId=${selectedCategory}`, 'sectionName').then(setSections);
            form.setValue('section', ''); 
            setTopics([]);
        }
    }, [selectedCategory, form]);
    
    useEffect(() => {
        if (selectedSection) {
            fetchOptions(`${BACKEND_API_URL}/topics?sectionId=${selectedSection}`, 'topicName').then(setTopics);
            form.setValue('topic', '');
        }
    }, [selectedSection, form]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "image" | "uploadPdf") => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue(fieldName, file);
            if (fieldName === "image") setImagePreview(URL.createObjectURL(file));
            else setPdfPreview(file.name);
        }
    };

    return (
        <Card className="w-full max-w-6xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">{mode === 'create' ? 'Add New PDF' : 'Edit PDF'}</CardTitle>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form 
  onSubmit={form.handleSubmit(
    onSubmit, 
    // This function will run ONLY if validation fails
    (errors) => {
      console.log("Form Validation Errors:", errors); 
    }
  )} 
  className="space-y-8"
>
                        {/* The rest of your JSX form remains the same */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Enter PDF title" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Enter PDF description" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="teacherName" render={({ field }) => (<FormItem><FormLabel>Teacher Name</FormLabel><FormControl><Input placeholder="Enter teacher name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="link" render={({ field }) => (<FormItem><FormLabel>External Link (Optional)</FormLabel><FormControl><Input placeholder="https://example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="courseBanner" render={({ field }) => (<FormItem><FormLabel>Course Banner URL (Optional)</FormLabel><FormControl><Input placeholder="https://example.com/banner.jpg" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <FormField control={form.control} name="priority" render={({ field }) => (<FormItem><FormLabel>Priority</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                </div>
                                <div className="flex items-center space-x-8 pt-4">
                                    <FormField control={form.control} name="isFree" render={({ field }) => (<FormItem className="flex items-center gap-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Free PDF</FormLabel></FormItem>)} />
                                    <FormField control={form.control} name="isChat" render={({ field }) => (<FormItem className="flex items-center gap-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Enable Chat</FormLabel></FormItem>)} />
                                    <FormField control={form.control} name="isLive" render={({ field }) => (<FormItem className="flex items-center gap-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Live Session</FormLabel></FormItem>)} />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <FormField control={form.control} name="mainCategory" render={({ field }) => (<FormItem><FormLabel>Main Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent>{mainCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedMainCategory}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="section" render={({ field }) => (<FormItem><FormLabel>Section</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedCategory}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent>{sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="topic" render={({ field }) => (<FormItem><FormLabel>Topic</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedSection}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent>{topics.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField control={form.control} name="image" render={() => (<FormItem><FormLabel>Thumbnail Image</FormLabel><FormControl><Input type="file" accept="image/*" onChange={e => handleFileChange(e, "image")} /></FormControl>{imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-32 w-auto rounded-lg object-cover" />}<FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="uploadPdf" render={() => (<FormItem><FormLabel>PDF File</FormLabel><FormControl><Input type="file" accept=".pdf" onChange={e => handleFileChange(e, "uploadPdf")} /></FormControl>{pdfPreview && <div className="mt-2 flex items-center gap-2 text-sm text-gray-600"><FileText className="h-5 w-5" /><span>{pdfPreview.split('/').pop()}</span></div>}<FormMessage /></FormItem>)} />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{mode === 'create' ? 'Creating...' : 'Updating...'}</>) : (mode === 'create' ? 'Create PDF' : 'Update PDF')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}