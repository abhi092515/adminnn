"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useSeriesFormData } from "@/hooks/useSeriesFormData";
import { CKEditorComponent } from "@/components/ui/CKEditorComponent";
import { useLocation } from "wouter";

const formSchema = z.object({
  name: z.string().min(1, "Series Name is required"),
  mainTab: z.string().min(1, "Main Tab selection is required"),
  examTime: z.coerce.number().positive("Exam Time must be a positive number"),
  mainCategory: z.string().min(1, "Main Category is required"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().optional(),
  negativeMarks: z.coerce.number().min(0),
  status: z.enum(["active", "inactive"]),
  isSkipable: z.boolean(),
  overallCutoff: z.coerce.number().min(0),
  totalMarks: z.coerce.number().positive(),
  analysisDate: z.date().optional(),
  isJeeMains: z.boolean(),
  isBilingual: z.boolean(),
  isDailyDose: z.boolean(),
  isBengali: z.boolean(),
  customTag1: z.string().optional(),
  customTag2: z.string().optional(),
  expertComment: z.string().optional(),
  sectionDetails: z.array(z.object({
    section: z.string().min(1, "Section is required"),
    sectionTime: z.coerce.number().min(0),
    negativeMarks: z.coerce.number().min(0),
    positiveMarks: z.coerce.number().min(0),
    totalQuestion: z.coerce.number().min(0),
  })),
  cutoffDetails: z.array(z.object({
    section: z.string().min(1, "Section is required"),
    cutoffMarks: z.coerce.number().min(0),
  })),
});

type FormValues = z.infer<typeof formSchema>;

export function SeriesForm({ onSubmit, isPending }: any) {
  const [_, setLocation] = useLocation();
  const { mainCategories, categories, subCategories, sections, setSelectedMainCategory, setSelectedCategory } = useSeriesFormData();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "active",
      isSkipable: true,
      isJeeMains: false,
      isBilingual: true,
      isDailyDose: false,
      isBengali: false,
      sectionDetails: [],
      cutoffDetails: [],
      negativeMarks: 0,
      overallCutoff: 0,
      totalMarks: 0,
    },
  });

  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({ control: form.control, name: "sectionDetails" });
  const { fields: cutoffFields, append: appendCutoff, remove: removeCutoff } = useFieldArray({ control: form.control, name: "cutoffDetails" });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader><CardTitle>Series Details</CardTitle></CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Series Name</FormLabel><FormControl><Input placeholder="e.g., SSC CGL Full Mock Test" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="mainTab" render={({ field }) => (<FormItem><FormLabel>Main Tab</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a tab" /></SelectTrigger></FormControl><SelectContent><SelectItem value="practice">Practice</SelectItem><SelectItem value="previous_paper">Previous Paper</SelectItem><SelectItem value="free_mock">Free Mock</SelectItem><SelectItem value="test_series">Test Series</SelectItem><SelectItem value="quiz">Quiz</SelectItem><SelectItem value="scholarship">Scholarship Test</SelectItem><SelectItem value="topic_wise">Topic Wise</SelectItem><SelectItem value="sectional">Sectional Test</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="examTime" render={({ field }) => (<FormItem><FormLabel>Exam Time (Minutes)</FormLabel><FormControl><Input type="number" placeholder="e.g., 60" {...field} /></FormControl><FormMessage /></FormItem>)}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="mainCategory" render={({ field }) => (<FormItem><FormLabel>Main Category</FormLabel><Select onValueChange={(v) => {field.onChange(v); setSelectedMainCategory(v);}} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent>{mainCategories?.map((cat:any) => <SelectItem key={cat.id} value={cat.id}>{cat.mainCategoryName}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>)}/>
                <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={(v) => {field.onChange(v); setSelectedCategory(v);}} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent>{categories?.map((cat:any) => <SelectItem key={cat.id} value={cat.id}>{cat.categoryName}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>)}/>
                <FormField control={form.control} name="subCategory" render={({ field }) => (<FormItem><FormLabel>Sub Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent>{subCategories?.map((cat:any) => <SelectItem key={cat.id} value={cat.id}>{cat.subTopicName}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>)}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField control={form.control} name="negativeMarks" render={({ field }) => (<FormItem><FormLabel>Negative Marks</FormLabel><FormControl><Input type="number" placeholder="e.g., 0.25" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="overallCutoff" render={({ field }) => (<FormItem><FormLabel>Overall CutOff</FormLabel><FormControl><Input type="number" placeholder="e.g., 85" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="totalMarks" render={({ field }) => (<FormItem><FormLabel>Marks</FormLabel><FormControl><Input type="number" placeholder="e.g., 200" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select><FormMessage/></FormItem>)}/>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
                <FormField control={form.control} name="analysisDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Analysis Date & Time</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP p") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                <FormField name="isSkipable" control={form.control} render={({ field }) => (<FormItem><FormLabel>Skippable</FormLabel><FormControl><RadioGroup onValueChange={(val) => field.onChange(val === 'true')} value={String(field.value)} className="flex space-x-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)}/>
                <FormField name="isJeeMains" control={form.control} render={({ field }) => (<FormItem><FormLabel>Is JEE-Mains</FormLabel><FormControl><RadioGroup onValueChange={(val) => field.onChange(val === 'true')} value={String(field.value)} className="flex space-x-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)}/>
                <FormField name="isBilingual" control={form.control} render={({ field }) => (<FormItem><FormLabel>Is Bi-Lingual</FormLabel><FormControl><RadioGroup onValueChange={(val) => field.onChange(val === 'true')} value={String(field.value)} className="flex space-x-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)}/>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField name="isDailyDose" control={form.control} render={({ field }) => (<FormItem><FormLabel>Is Daily Dose</FormLabel><FormControl><RadioGroup onValueChange={(val) => field.onChange(val === 'true')} value={String(field.value)} className="flex space-x-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)}/>
                <FormField name="isBengali" control={form.control} render={({ field }) => (<FormItem><FormLabel>Is Bengali</FormLabel><FormControl><RadioGroup onValueChange={(val) => field.onChange(val === 'true')} value={String(field.value)} className="flex space-x-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)}/>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="customTag1" render={({ field }) => (<FormItem><FormLabel>Custom Tag 1</FormLabel><FormControl><Input placeholder="Optional tag" {...field} /></FormControl></FormItem>)}/>
                <FormField control={form.control} name="customTag2" render={({ field }) => (<FormItem><FormLabel>Custom Tag 2</FormLabel><FormControl><Input placeholder="Optional tag" {...field} /></FormControl></FormItem>)}/>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex justify-between items-center"><CardTitle>Section Details</CardTitle><Button type="button" size="sm" onClick={() => appendSection({ section: '', sectionTime: 0, negativeMarks: 0, positiveMarks: 1, totalQuestion: 0 })}><PlusCircle className="h-4 w-4 mr-2" />Add Section</Button></div></CardHeader>
          <CardContent className="space-y-4">
            {sectionFields.map((field, index) => (
              <div key={field.id} className="flex flex-col md:flex-row items-end gap-4 p-4 border rounded-lg">
                <FormField control={form.control} name={`sectionDetails.${index}.section`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Section</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent>{sections?.map((s:any) => <SelectItem key={s.id} value={s.id}>{s.sectionName}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>)} />
                <FormField control={form.control} name={`sectionDetails.${index}.sectionTime`} render={({ field }) => (<FormItem><FormLabel>Time (min)</FormLabel><Input type="number" {...field} /></FormItem>)} />
                <FormField control={form.control} name={`sectionDetails.${index}.negativeMarks`} render={({ field }) => (<FormItem><FormLabel>Negative Marks</FormLabel><Input type="number" {...field} /></FormItem>)} />
                <FormField control={form.control} name={`sectionDetails.${index}.positiveMarks`} render={({ field }) => (<FormItem><FormLabel>Positive Marks</FormLabel><Input type="number" {...field} /></FormItem>)} />
                <FormField control={form.control} name={`sectionDetails.${index}.totalQuestion`} render={({ field }) => (<FormItem><FormLabel>Total Questions</FormLabel><Input type="number" {...field} /></FormItem>)} />
                <Button type="button" variant="destructive" size="icon" onClick={() => removeSection(index)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            {sectionFields.length === 0 && <p className="text-sm text-center text-muted-foreground">No sections added.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex justify-between items-center"><CardTitle>Cutoff Section Marks</CardTitle><Button type="button" size="sm" onClick={() => appendCutoff({ section: '', cutoffMarks: 0 })}><PlusCircle className="h-4 w-4 mr-2" />Add Cutoff</Button></div></CardHeader>
          <CardContent className="space-y-4">
             {cutoffFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg">
                 <FormField control={form.control} name={`cutoffDetails.${index}.section`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Section</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent>{sections?.map((s:any) => <SelectItem key={s.id} value={s.id}>{s.sectionName}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>)} />
                 <FormField control={form.control} name={`cutoffDetails.${index}.cutoffMarks`} render={({ field }) => (<FormItem><FormLabel>Cutoff Marks</FormLabel><Input type="number" {...field} /></FormItem>)} />
                 <Button type="button" variant="destructive" size="icon" onClick={() => removeCutoff(index)}><Trash2 className="h-4 w-4" /></Button>
              </div>
             ))}
             {cutoffFields.length === 0 && <p className="text-sm text-center text-muted-foreground">No cutoffs added.</p>}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>Expert Comment</CardTitle></CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="expertComment"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CKEditorComponent {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => setLocation('/series')}>Cancel</Button>
          <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="mr-2 h-4 w-4" />}Submit</Button>
        </div>
      </form>
    </Form>
  );
}