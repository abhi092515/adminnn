"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    title: z.string().optional(),
    amount: z.coerce.number().min(0, "Amount cannot be negative"),
    durationInDays: z.coerce.number().int().positive("Duration must be a positive number"),
    priority: z.coerce.number().default(0),
    status: z.enum(["active", "inactive"]),
    courses: z.array(z.string()).default([]),
    ebooks: z.array(z.string()).default([]),
    coupons: z.array(z.string()).default([]),
});

type SubscriptionFormProps = {
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    initialData?: any;
    isPending?: boolean;
};

// Reusable component for selecting items
const ItemSelector = ({ value, onChange, items, categories, label }: any) => {
    const [selectedCategory, setSelectedCategory] = useState("");

    const relevantCategories = useMemo(() => {
        if (!items || !categories) return [];
        // ✅ FIX: The logic now correctly uses the category ID string from each item.
        const itemCategoryIds = new Set(items.map((item: any) => item.category).filter(Boolean));
        return categories.filter((cat: any) => itemCategoryIds.has(cat.id));
    }, [items, categories]);
    
    const handleSelectAll = (checked: boolean) => {
        onChange(checked && items ? items.map((item: any) => item.id).filter(Boolean) : []);
    };

    const handleSelectByCategory = (categoryId: string) => {
        if (!categoryId || !items) return;
        // ✅ FIX: The filter now correctly compares the item's category ID string.
        const itemsInCategory = items.filter((item: any) => item.category === categoryId).map((item: any) => item.id).filter(Boolean);
        const currentSelection = value || [];
        const newSelection = [...new Set([...currentSelection, ...itemsInCategory])];
        onChange(newSelection);
        setSelectedCategory(""); // Reset the dropdown
    };

    return (
        <Card>
            <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => handleSelectAll(true)}>Select All</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleSelectAll(false)}>Deselect All</Button>
                        <Select value={selectedCategory} onValueChange={handleSelectByCategory}>
                            <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Add by Category" /></SelectTrigger>
                            <SelectContent>
                                {relevantCategories.map((cat: any) => (<SelectItem key={cat.id} value={cat.id}>{cat.categoryName}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                    <ScrollArea className="h-48 rounded-md border p-4">
                        <div className="space-y-2">
                            {items?.map((item: any) => (
                                <div key={item.id} className="flex items-center space-x-3">
                                    <Checkbox
                                        id={item.id}
                                        checked={value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                            if (!item.id) return;
                                            const currentValues = value || [];
                                            const newValues = checked
                                                ? [...currentValues, item.id]
                                                : currentValues.filter((v: string) => v !== item.id);
                                            onChange(newValues);
                                        }}
                                    />
                                    <Label htmlFor={item.id} className="font-normal cursor-pointer">
                                        {item.title || item.name || item.code}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
};

export function SubscriptionForm({ onSubmit, initialData, isPending }: SubscriptionFormProps) {
    const { formData, isLoadingFormData } = useSubscriptions();
    const isInitialized = useRef(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", title: "", amount: 0, durationInDays: 30, priority: 0, status: "active", courses: [], ebooks: [], coupons: [] },
    });

    useEffect(() => {
        if (initialData && !isInitialized.current) {
            const transformedData = {
                ...initialData,
                courses: initialData.courses?.map((c: any) => c.id).filter(Boolean) || [],
                ebooks: initialData.ebooks?.map((e: any) => e.id).filter(Boolean) || [],
                coupons: initialData.coupons?.map((c: any) => c.id).filter(Boolean) || [],
            };
            form.reset(transformedData);
            isInitialized.current = true;
        }
    }, [initialData, form.reset]);

    const watchedName = form.watch("name");
    const watchedAmount = form.watch("amount");

    const handleFillDefaults = () => {
        form.reset({ ...form.getValues(), name: "all exams", title: "valid for 1 year", amount: 499, durationInDays: 365, priority: 0 });
    };

    if (isLoadingFormData) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                        console.error("Form validation errors:", errors);
                        toast.error("Please fill out all required fields correctly.");
                    })} className="space-y-8">
                        
                        <Card>
                            <CardHeader><CardTitle>Subscription Details</CardTitle></CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Subscription Name</FormLabel><FormControl><Input placeholder="e.g., Premium Annual Plan" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title (Optional)</FormLabel><FormControl><Input placeholder="e.g., All Access Pass" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount (₹)</FormLabel><FormControl><Input type="number" placeholder="4999" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="durationInDays" render={({ field }) => (<FormItem><FormLabel>Duration (in Days)</FormLabel><FormControl><Input type="number" placeholder="365" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="priority" render={({ field }) => (<FormItem><FormLabel>Priority</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <div className="space-y-8">
                            <FormField
                                control={form.control}
                                name="courses"
                                render={({ field }) => (
                                    <ItemSelector 
                                        value={field.value}
                                        onChange={field.onChange}
                                        items={formData?.courses} 
                                        categories={formData?.categories} 
                                        label="Assign Courses" 
                                    />
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ebooks"
                                render={({ field }) => (
                                    <ItemSelector 
                                        value={field.value}
                                        onChange={field.onChange}
                                        items={formData?.ebooks} 
                                        categories={formData?.categories} 
                                        label="Assign E-Books" 
                                    />
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="coupons"
                                render={({ field }) => (
                                    <ItemSelector 
                                        value={field.value}
                                        onChange={field.onChange}
                                        items={formData?.coupons} 
                                        // categories={[]} // Coupons don't have categories in this setup
                                        label="Assign Coupons" 
                                    />
                                )}
                            />
                            <Card className="opacity-50 cursor-not-allowed">
                                <CardHeader><CardTitle>Assign Packages (Coming Soon)</CardTitle></CardHeader>
                                <CardContent><p className="text-sm text-muted-foreground">This feature is not yet available.</p></CardContent>
                            </Card>
                        </div>

                        <div className="flex items-center gap-4">
                             <Button type="submit" disabled={isPending} size="lg">
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? "Update Subscription" : "Create Subscription"}
                            </Button>
                            {!initialData && (
                                <Button type="button" variant="outline" onClick={handleFillDefaults}>
                                    Fill by Default
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </div>

            <div className="lg:col-span-1">
                <Card className="sticky top-6">
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                        <CardDescription>This is how the plan will look.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-lg border">
                            <h3 className="text-xl font-bold text-gray-800">{watchedName || "Subscription Name"}</h3>
                            <p className="text-3xl font-extrabold text-blue-600 mt-2">₹{watchedAmount || "0"}</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="coupon">Have a coupon?</Label>
                            <div className="flex gap-2">
                                <Input id="coupon" placeholder="Enter coupon code" />
                                <Button variant="secondary">Apply</Button>
                            </div>
                        </div>
                        <Button className="w-full" size="lg">Subscribe Now</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
