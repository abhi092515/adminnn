"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useInstructionFormData } from "@/hooks/useInstructions";
import { useLocation } from "wouter";
import { CKEditorComponent } from "@/components/ui/CKEditorComponent"; // ✅ 1. Import the new component

const formSchema = z.object({
    series: z.string().optional(),
    generalInstructionEnglish: z.string().optional(),
    specificInstructionEnglish: z.string().optional(),
    generalInstructionHindi: z.string().optional(),
    specificInstructionHindi: z.string().optional(),
    status: z.enum(["active", "inactive"]),
});

type InstructionFormValues = z.infer<typeof formSchema>;

type InstructionFormProps = {
  onSubmit: (values: InstructionFormValues) => void;
  initialData?: any;
  isPending?: boolean;
};

export function InstructionForm({ onSubmit, initialData, isPending }: InstructionFormProps) {
    const [_, setLocation] = useLocation();
    const { seriesList, isLoadingSeries } = useInstructionFormData();

    const form = useForm<InstructionFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            series: "",
            generalInstructionEnglish: "",
            specificInstructionEnglish: "",
            generalInstructionHindi: "",
            specificInstructionHindi: "",
            status: "active",
        },
    });

    useEffect(() => {
        if (initialData) {
            const defaultData = {
                ...initialData,
                series: initialData.series?._id || initialData.series || "",
            };
            form.reset(defaultData);
        }
    }, [initialData, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle>{initialData ? "Edit Instruction" : "Add New Instruction"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="series"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Series (Optional)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingSeries}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isLoadingSeries ? "Loading series..." : "Select a test series (optional)"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {seriesList?.map((series: any) => (
                                                    <SelectItem key={series._id} value={series._id}>{series.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="space-y-6">
                                {/* ✅ 2. Replaced Textarea with CKEditorComponent */}
                                <FormField 
                                  name="generalInstructionEnglish" 
                                  control={form.control} 
                                  render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>General Instruction (English)</FormLabel>
                                        <FormControl>
                                            <CKEditorComponent {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField 
                                  name="specificInstructionEnglish" 
                                  control={form.control} 
                                  render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Test Specific Instruction (English)</FormLabel>
                                        <FormControl>
                                            <CKEditorComponent {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <div className="space-y-6">
                                <FormField 
                                  name="generalInstructionHindi" 
                                  control={form.control} 
                                  render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>General Instruction (Hindi)</FormLabel>
                                        <FormControl>
                                            <CKEditorComponent {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField 
                                  name="specificInstructionHindi" 
                                  control={form.control} 
                                  render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Test Specific Instruction (Hindi)</FormLabel>
                                        <FormControl>
                                            <CKEditorComponent {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => setLocation('/instructions')}>Cancel</Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit
                    </Button>
                </div>
            </form>
        </Form>
    );
}