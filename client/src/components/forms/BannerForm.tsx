"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocation } from "wouter";
import { useBanners } from '@/hooks/use-banners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Zod schema for form validation
const bannerFormSchema = z.object({
  websiteBanner: z.any().optional(),
  mobileBanner: z.any().optional(),
  redirectUrl: z.string().url({ message: "Please enter a valid URL." }).min(1, "Redirect URL is required."),
  isActive: z.boolean().default(true),
});

type BannerFormData = z.infer<typeof bannerFormSchema>;

interface BannerFormProps {
  bannerId?: string;
}

export function BannerForm({ bannerId }: BannerFormProps) {
  const [_, setLocation] = useLocation();
  const { getBannerById, createBanner, updateBanner } = useBanners();
  const isEditMode = !!bannerId;
  const { data: initialData, isLoading: isLoadingData } = getBannerById(bannerId);

  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: { isActive: true },
  });

  // Populate form with existing data when in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset({
        redirectUrl: initialData.redirectUrl,
        isActive: initialData.isActive,
        // File fields will show preview, no need to set value here
      });
    }
  }, [initialData, isEditMode, form]);

  // Handler for form submission
  const onSubmit = (data: BannerFormData) => {
    const formData = new FormData();
    
    // Append text and boolean fields
    formData.append('redirectUrl', data.redirectUrl);
    formData.append('isActive', String(data.isActive));

    // Only append files if they have been selected
    if (data.websiteBanner instanceof File) {
      formData.append('websiteBanner', data.websiteBanner);
    }
    if (data.mobileBanner instanceof File) {
      formData.append('mobileBanner', data.mobileBanner);
    }

    if (isEditMode) {
      updateBanner.mutate({ bannerId, formData }, { onSuccess: () => setLocation('/banners') });
    } else {
      createBanner.mutate(formData, { onSuccess: () => setLocation('/banners') });
    }
  };

  const onValidationErrors = (errors: any) => {
    console.error("Form Validation Errors:", errors);
    toast.error("Please fix the errors before submitting.");
  };

  const isSubmitting = createBanner.isPending || updateBanner.isPending;

  if (isLoadingData) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onValidationErrors)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Edit Banner' : 'Add New Banner'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Desktop Banner Field */}
            <FormField
              control={form.control}
              name="websiteBanner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desktop / Laptop Banner</FormLabel>
                  {isEditMode && initialData?.websiteBannerUrl && <img src={initialData.websiteBannerUrl} alt="Current Desktop Banner" className="h-40 w-auto object-contain rounded-md my-2 border bg-muted" />}
                  <FormControl>
                    <Input type="file" accept="image/*" onChange={e => field.onChange(e.target.files?.[0])} />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">Recommended size: 1585 x 585 pixels</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Mobile Banner Field */}
            <FormField
              control={form.control}
              name="mobileBanner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile / App Banner</FormLabel>
                   {isEditMode && initialData?.mobileBannerUrl && <img src={initialData.mobileBannerUrl} alt="Current Mobile Banner" className="h-40 w-auto object-contain rounded-md my-2 border bg-muted" />}
                  <FormControl>
                    <Input type="file" accept="image/*" onChange={e => field.onChange(e.target.files?.[0])} />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">Recommended size: 600 x 300 pixels</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Redirect URL Field */}
            <FormField
              control={form.control}
              name="redirectUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Redirection URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/product/123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Status Field */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Status</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Inactive banners will not be shown to users.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
           <Button type="button" variant="outline" onClick={() => setLocation('/banners')}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Update Banner' : 'Create Banner'}
          </Button>
        </div>
      </form>
    </Form>
  );
}