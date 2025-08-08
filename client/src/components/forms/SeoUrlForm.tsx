"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  page_url: z.string().min(1, "Page URL is required."),
  page_title: z.string().min(1, "Page Title is required."),
  description: z.string().min(1, "Description is required."),
  seo_keywords: z.string().optional(),
  no_index: z.boolean().default(false),
  no_follow: z.boolean().default(false),
  redirection_url: z.string().optional(),
  isActive: z.boolean().default(true),
});

type SeoUrlFormValues = z.infer<typeof formSchema>;

type SeoUrlFormProps = {
  onSubmit: (values: any) => void;
  initialData?: any;
  isPending?: boolean;
};

export function SeoUrlForm({ onSubmit, initialData, isPending }: SeoUrlFormProps) {
  const form = useForm<SeoUrlFormValues>({
    resolver: zodResolver(formSchema),
    // ✅ REQUIRED CHANGE: Populate defaultValues directly from the initialData prop.
    defaultValues: {
      page_url: initialData?.page_url || "",
      page_title: initialData?.page_title || "",
      description: initialData?.description || "",
      seo_keywords: initialData?.seo_keywords?.join(', ') || "",
      no_index: initialData?.no_index || false,
      no_follow: initialData?.no_follow || false,
      redirection_url: initialData?.redirection_url || "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const handleSubmit = (values: SeoUrlFormValues) => {
    const processedValues = {
      ...values,
      seo_keywords: values.seo_keywords ? values.seo_keywords.split(',').map(kw => kw.trim()) : [],
    };
    onSubmit(processedValues);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit SEO URL' : 'Add New SEO URL'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <FormField control={form.control} name="page_url" render={({ field }) => (<FormItem><FormLabel>Page URL</FormLabel><FormControl><Input placeholder="/path/to/your-page" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="page_title" render={({ field }) => (<FormItem><FormLabel>Page Title</FormLabel><FormControl><Input placeholder="Your Engaging Page Title" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="A brief, compelling description for search engines." {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="seo_keywords" render={({ field }) => (<FormItem><FormLabel>SEO Keywords</FormLabel><FormControl><Input placeholder="keyword1, keyword2, keyword3" {...field} /></FormControl><FormDescription>Enter keywords separated by commas.</FormDescription><FormMessage /></FormItem>)} />
            
            <CardTitle className="pt-4">Page Information</CardTitle>
            <div className="flex items-center space-x-8">
              <FormField control={form.control} name="no_index" render={({ field }) => (<FormItem className="flex items-center space-x-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>No Index</FormLabel></FormItem>)} />
              <FormField control={form.control} name="no_follow" render={({ field }) => (<FormItem className="flex items-center space-x-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>No Follow</FormLabel></FormItem>)} />
            </div>

            <FormField control={form.control} name="redirection_url" render={({ field }) => (<FormItem><FormLabel>Redirection URL (Optional)</FormLabel><FormControl><Input placeholder="/redirect/to/this-page" {...field} /></FormControl><FormMessage /></FormItem>)} />
            
            <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  {/* ✅ REQUIRED CHANGE: Bind the Select's value to the form state */}
                  <Select onValueChange={(value) => field.onChange(value === 'true')} value={String(field.value)}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>

            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Save Changes" : "Create SEO URL"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}