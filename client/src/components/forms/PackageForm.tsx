"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";
import { usePackageFormData } from "@/hooks/usePackages";
import { useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
    name: z.string().min(1, "Package Name is required."),
    image: z.any().optional(),
    mainCategory: z.string().min(1, "Main Category is required."),
    assignedToMainMenu: z.boolean().default(false).optional(),
    category: z.string().min(1, "Category is required."),
    description: z.string().optional(),
    status: z.enum(["active", "inactive"]),
});

type PackageFormValues = z.infer<typeof formSchema>;

type PackageFormProps = {
  onSubmit: (formData: FormData) => void;
  initialData?: any;
  isPending?: boolean;
};

export function PackageForm({ onSubmit, initialData, isPending }: PackageFormProps) {
  const [_, setLocation] = useLocation();
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const { mainCategories, categories, setMainCategoryId, isLoadingCategories } = usePackageFormData();

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      mainCategory: "",
      assignedToMainMenu: false,
      category: "",
      description: "",
      status: "active",
    },
  });

  const handleSubmit = (values: PackageFormValues) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
        if (key === 'image' && value instanceof File) {
            formData.append('image', value);
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
                <CardHeader>
                    <CardTitle>Package Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Package Image</FormLabel>
                                <FormControl>
                                    <div className="flex items-center gap-4">
                                        {imagePreview && <img src={imagePreview} alt="preview" className="w-24 h-24 object-cover rounded-md border" />}
                                        <Button asChild variant="outline">
                                            <label htmlFor="image-upload" className="cursor-pointer flex items-center gap-2">
                                                <Upload className="h-4 w-4" /> Upload Image
                                                <Input id="image-upload" type="file" className="hidden" accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            field.onChange(file);
                                                            setImagePreview(URL.createObjectURL(file));
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Package Name</FormLabel><FormControl><Input placeholder="e.g., Ultimate SSC CGL Pack" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField
                        control={form.control}
                        name="assignedToMainMenu"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assign Main Menu</FormLabel>
                                <Select
                                    // Convert the string from the dropdown ('true'/'false') back to a boolean for the form state
                                    onValueChange={(value) => field.onChange(value === 'true')}
                                    // Convert the boolean from the form state to a string for the Select value
                                    value={String(field.value)}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an option" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="true">Yes</SelectItem>
                                        <SelectItem value="false">No</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    If 'Yes', this package may be featured in the main menu.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="mainCategory"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Main Category</FormLabel>
                                    <Select onValueChange={(value) => { field.onChange(value); setMainCategoryId(value); }} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a main category" /></SelectTrigger></FormControl>
                                        <SelectContent>{mainCategories?.map((cat: any) => (<SelectItem key={cat.id} value={cat.id}>{cat.mainCategoryName}</SelectItem>))}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCategories || !categories?.length}>
                                        <FormControl><SelectTrigger><SelectValue placeholder={isLoadingCategories ? 'Loading...' : 'Select a category'} /></SelectTrigger></FormControl>
                                        <SelectContent>{categories?.map((cat: any) => (<SelectItem key={cat.id} value={cat.id}>{cat.categoryName}</SelectItem>))}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Package Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Describe the package..." {...field} rows={6} />
                                </FormControl>
                                <FormDescription>Rich text editor tools can be added here.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField control={form.control} name="status" render={({ field }) => ( <FormItem> <FormLabel>Status</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl> <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                </CardContent>
            </Card>
            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setLocation('/packages')}>Cancel</Button>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit
                </Button>
            </div>
        </form>
    </Form>
  );
}