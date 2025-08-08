"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Upload, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

const formSchema = z.object({
    title: z.string().min(1, "Batch Title is required."),
    image: z.any().optional(),
    pdf: z.any().optional(),
    price: z.coerce.number().min(0, "Price is required."),
    discountPrice: z.coerce.number().min(0).optional(),
    description: z.string().optional(),
    shortDescription: z.string().min(1, "Short Description is required."),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    customTag1: z.string().optional(),
    customTag2: z.string().optional(),
    status: z.enum(["active", "inactive"]),
});

type BatchFormValues = z.infer<typeof formSchema>;

type PracticeBatchFormProps = {
  onSubmit: (formData: FormData) => void;
  initialData?: any; // For edit mode later
  isPending?: boolean;
};

export function PracticeBatchForm({ onSubmit, initialData, isPending }: PracticeBatchFormProps) {
  const [_, setLocation] = useLocation();
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      price: 0,
      shortDescription: "",
      status: "active",
    },
  });

  const handleSubmit = (values: BatchFormValues) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if ((key === 'image' || key === 'pdf') && value instanceof File) {
        formData.append(key, value);
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else if (value != null) {
        formData.append(key, String(value));
      }
    });
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card>
          <CardHeader><CardTitle>Batch Information</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField name="image" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      {imagePreview && <img src={imagePreview} alt="preview" className="w-20 h-20 object-cover rounded-md border" />}
                      <Button asChild variant="outline">
                        <label className="cursor-pointer flex items-center gap-2"><Upload className="h-4 w-4" /> Upload<Input type="file" className="hidden" accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              field.onChange(file);
                              setImagePreview(URL.createObjectURL(file));
                            }
                          }}
                        /></label>
                      </Button>
                    </div>
                  </FormControl><FormMessage />
                </FormItem>
              )} />
              <FormField name="pdf" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>PDF</FormLabel>
                  <FormControl>
                    <Button asChild variant="outline">
                      <label className="cursor-pointer flex items-center gap-2"><FileIcon className="h-4 w-4" /> Upload PDF<Input type="file" className="hidden" accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                            setPdfFileName(file.name);
                          }
                        }}
                      /></label>
                    </Button>
                  </FormControl>
                  {pdfFileName && <FormDescription>Selected: {pdfFileName}</FormDescription>}
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField name="title" control={form.control} render={({ field }) => (<FormItem><FormLabel>Batch Title</FormLabel><FormControl><Input placeholder="e.g., SSC CGL Tier 1 Practice Batch" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField name="price" control={form.control} render={({ field }) => (<FormItem><FormLabel>Batch Price (₹)</FormLabel><FormControl><Input type="number" placeholder="e.g., 499" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="discountPrice" control={form.control} render={({ field }) => (<FormItem><FormLabel>Discount Price (₹)</FormLabel><FormControl><Input type="number" placeholder="e.g., 199" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                {/* This is a placeholder. For a real rich text editor, integrate a library like TipTap or ReactQuill */}
                <FormControl><Textarea rows={8} placeholder="Enter a detailed description for the batch..." {...field} /></FormControl>
                <FormDescription>A rich text editor can be implemented here.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="shortDescription" control={form.control} render={({ field }) => (<FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea placeholder="Enter a concise summary..." {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField name="startDate" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="endDate" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField name="customTag1" control={form.control} render={({ field }) => (<FormItem><FormLabel>Custom Tag 1</FormLabel><FormControl><Input placeholder="e.g., New Pattern" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="customTag2" control={form.control} render={({ field }) => (<FormItem><FormLabel>Custom Tag 2</FormLabel><FormControl><Input placeholder="e.g., Highly Recommended" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
          </CardContent>
        </Card>
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => setLocation('/practice-batch')}>Cancel</Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}