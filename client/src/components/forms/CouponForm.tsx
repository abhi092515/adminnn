"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocation } from "wouter";
import { useCoupons } from '@/hooks/useCoupons'
import { useCourses } from '@/hooks/use-courses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const couponFormSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").transform(val => val.toUpperCase()),
  type: z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number().positive("Discount value must be a positive number."),
  usageLimitPerUser: z.coerce.number().int().positive().default(1),
  startDate: z.string().min(1, "Start date is required"),
  expireDate: z.string().min(1, "Expire date is required"),
  applicableOn: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
}).refine(data => new Date(data.expireDate) >= new Date(data.startDate), {
  message: "Expire date must be on or after the start date",
  path: ["expireDate"],
});

type CouponFormData = z.infer<typeof couponFormSchema>;

export function CouponForm({ couponId }: { couponId?: string }) {
  const [_, setLocation] = useLocation();
  const { getCouponById, createCoupon, updateCoupon } = useCoupons();
  const { data: courses, isLoading: isLoadingCourses } = useCourses();

  const isEditMode = !!couponId;
  const { data: initialData, isLoading: isLoadingData } = getCouponById(couponId);

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: { type: 'percentage', isActive: true, usageLimitPerUser: 1, applicableOn: [] },
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset({
        ...initialData,
        startDate: new Date(initialData.startDate).toISOString().split('T')[0],
        expireDate: new Date(initialData.expireDate).toISOString().split('T')[0],
      });
    }
  }, [initialData, isEditMode, form]);

  const onSubmit = (data: CouponFormData) => {
    if (isEditMode) {
      updateCoupon.mutate({ couponId, couponData: data }, { onSuccess: () => setLocation('/coupons') });
    } else {
      createCoupon.mutate(data, { onSuccess: () => setLocation('/coupons') });
    }
  };
  
  const isSubmitting = createCoupon.isPending || updateCoupon.isPending;

  if (isLoadingData) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader><CardTitle>{isEditMode ? 'Edit Coupon' : 'Add New Coupon'}</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <FormField control={form.control} name="code" render={({ field }) => (<FormItem><FormLabel>Coupon Code</FormLabel><FormControl><Input placeholder="e.g., SUMMER25" {...field} /></FormControl><FormMessage /></FormItem>)} />
              
              {/* ✅ THIS IS THE CORRECTED RADIO GROUP STRUCTURE */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Coupon Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="percentage" />
                          </FormControl>
                          <FormLabel className="font-normal">Percentage</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="fixed" />
                          </FormControl>
                          <FormLabel className="font-normal">Fixed Amount</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="discountValue" render={({ field }) => (<FormItem><FormLabel>Discount Value</FormLabel><FormControl><Input type="number" placeholder="e.g., 25 or 500" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="usageLimitPerUser" render={({ field }) => (<FormItem><FormLabel>Usage Limit Per User</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="startDate" render={({ field }) => (<FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="expireDate" render={({ field }) => (<FormItem><FormLabel>Expire Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="isActive" render={({ field }) => (<FormItem className="flex items-center gap-4 pt-4"><FormLabel>Status (Active)</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            <div className="space-y-4">
              <FormLabel>Applied On</FormLabel>
              <CardDescription>Select courses this coupon can be applied to. Leave blank to apply to all.</CardDescription>
              <ScrollArea className="h-72 w-full rounded-md border p-4">
                {isLoadingCourses ? <Loader2 className="animate-spin" /> : courses?.map(course => (
                  <FormField key={course.id} control={form.control} name="applicableOn" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                      <FormControl><Checkbox checked={field.value?.includes(course.id)} onCheckedChange={(checked) => {
                          return checked ? field.onChange([...(field.value || []), course.id]) : field.onChange(field.value?.filter(id => id !== course.id));
                      }} /></FormControl>
                      <FormLabel className="font-normal">{course.title}</FormLabel>
                    </FormItem>
                  )} />
                ))}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => setLocation('/coupons')}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Update Coupon' : 'Create Coupon'}
          </Button>
        </div>
      </form>
    </Form>
  );
}