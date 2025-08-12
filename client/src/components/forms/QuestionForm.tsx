"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuestionFormData } from "@/hooks/useQuestionFormData";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { CKEditorComponent } from "@/components/ui/CKEditorComponent";
import { useState } from "react";

// This interface reflects the final data structure sent to the backend.
interface BackendPayload {
    mainCategory: string;
    category: string;
    sectionId: string;
    topicId: string;
    subTopicId?: string;
    quesType: string;
    answerType: string;
    options?: { [key: string]: string }[];
    comprehension?: { [key: string]: string };
    question: { [key: string]: string };
    answer: { [key: string]: string };
    solution: { [key: string]: string };
    difficultyLevel: number;
    marks: number;
    priority: number;
    isVerified: boolean;
    customerId?: string;
    quesStatus?: string;
}

// The form's Zod schema, updated to match the final backend schema.
const formSchema = z.object({
    mainCategory: z.string().min(1, "Please select a main category."),
    category: z.string().min(1, "Please select a category."),
    sectionId: z.string().min(1, "Please select a section."),
    topicId: z.string().min(1, "Please select a topic."),
    subTopicId: z.string().optional(),
    quesType: z.enum(["single_choice", "comprehension"]),
    answerType: z.enum(["optional", "numerical", "multi-select"]),
    difficultyLevel: z.string().min(1, "Please select a difficulty level."),
    verificationStatus: z.enum(["verified", "not_verified"]),
    comprehensionEnglish: z.string().optional(),
    questionEnglish: z.string().min(1, "English question is required."),
    solutionEnglish: z.string().optional(),
    optionsEnglish: z.array(z.object({ text: z.string(), isCorrect: z.boolean() })),
    comprehensionHindi: z.string().optional(),
    questionHindi: z.string().min(1, "Hindi question is required."),
    solutionHindi: z.string().optional(),
    optionsHindi: z.array(z.object({ text: z.string(), isCorrect: z.boolean() })),
    numericalAnswerRange: z.string().optional(),
    marks: z.coerce.number().min(0, "Marks must be a positive number."),
    priority: z.coerce.number().min(0, "Priority must be a positive number."),
    customerId: z.string().optional(),
    quesStatus: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type QuestionFormProps = {
  onSubmit: (data: BackendPayload, isFinished: boolean) => void;
  isPending?: boolean;
};

// This function correctly transforms form data into the backend payload format.
const transformDataForBackend = (values: FormValues): BackendPayload => {
    const question = { en: values.questionEnglish, hi: values.questionHindi };
    const solution = { en: values.solutionEnglish || '', hi: values.solutionHindi || '' };

    let comprehension: { [key: string]: string } | undefined;
    if (values.quesType === 'comprehension' && (values.comprehensionEnglish || values.comprehensionHindi)) {
        comprehension = {
            en: values.comprehensionEnglish || '',
            hi: values.comprehensionHindi || '',
        };
    }

    let options: { [key: string]: string }[] | undefined;
    if (values.answerType === 'optional' || values.answerType === 'multi-select') {
        options = values.optionsEnglish
            .map((engOpt, index) => {
                const hinOpt = values.optionsHindi[index];
                if (engOpt.text.trim() || hinOpt.text.trim()) {
                    return { en: engOpt.text, hi: hinOpt.text };
                }
                return null;
            })
            .filter((opt): opt is { [key: string]: string } => opt !== null);
    }

    const answer: { [key: string]: string } = {};
    if (values.answerType === 'numerical') {
        answer.en = values.numericalAnswerRange || '';
        answer.hi = values.numericalAnswerRange || '';
    } else if (values.answerType === 'optional') {
        const correctIndex = values.optionsEnglish.findIndex(opt => opt.isCorrect);
        answer.en = String(correctIndex);
        answer.hi = String(correctIndex);
    } else if (values.answerType === 'multi-select') {
        const correctIndices = values.optionsEnglish
            .map((opt, index) => opt.isCorrect ? index : -1)
            .filter(index => index !== -1);
        answer.en = correctIndices.join(',');
        answer.hi = correctIndices.join(',');
    }
    
    return {
        mainCategory: values.mainCategory,
        category: values.category,
        sectionId: values.sectionId,
        topicId: values.topicId,
        subTopicId: values.subTopicId || undefined,
        quesType: values.quesType,
        answerType: values.answerType,
        difficultyLevel: parseInt(values.difficultyLevel, 10),
        isVerified: values.verificationStatus === 'verified',
        marks: values.marks,
        priority: values.priority,
        customerId: values.customerId,
        quesStatus: values.quesStatus,
        question,
        solution,
        comprehension,
        options,
        answer,
    };
};


export function QuestionForm({ onSubmit, isPending }: QuestionFormProps) {
    const [_, setLocation] = useLocation();
    const { 
        mainCategories, categories, sections, topics, subTopics, 
        setSelectedMainCategory, setSelectedCategory, setSelectedSection, setSelectedTopic,
        isLoadingMainCategories, isLoadingCategories, isLoadingSections, isLoadingTopics, isLoadingSubTopics 
    } = useQuestionFormData();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            mainCategory: "",
            category: "",
            sectionId: "",
            topicId: "",
            quesType: "single_choice",
            answerType: "optional",
            difficultyLevel: "3",
            verificationStatus: "not_verified",
            optionsEnglish: Array(5).fill({ text: "", isCorrect: false }),
            optionsHindi: Array(5).fill({ text: "", isCorrect: false }),
            marks: 4,
            priority: 1,
            quesStatus: "fresh",
        },
    });

    const { fields: optionsEnglishFields, update: updateEnglishOptions } = useFieldArray({ control: form.control, name: "optionsEnglish" });
    const { fields: optionsHindiFields, update: updateHindiOptions } = useFieldArray({ control: form.control, name: "optionsHindi" });

    const answerType = form.watch("answerType");
    const quesType = form.watch("quesType");

    const handleSingleAnswerChange = (selectedIndexStr: string) => {
        const selectedIndex = parseInt(selectedIndexStr, 10);
        if (answerType === 'optional' && !isNaN(selectedIndex)) {
            const currentEnglishOptions = form.getValues('optionsEnglish');
            currentEnglishOptions.forEach((opt, i) => updateEnglishOptions(i, { ...opt, isCorrect: i === selectedIndex }));
            const currentHindiOptions = form.getValues('optionsHindi');
            currentHindiOptions.forEach((opt, i) => updateHindiOptions(i, { ...opt, isCorrect: i === selectedIndex }));
        }
    };
    
    const handleFormSubmit = (values: FormValues, isFinished: boolean) => {
        const backendData = transformDataForBackend(values);
        onSubmit(backendData, isFinished);
    };

    const handleFinalSubmit = (values: FormValues) => handleFormSubmit(values, true);

    const handleNextQuestion = async () => {
        // 1. Check if the current form data is valid
        const isValid = await form.trigger();
        
        if (isValid) {
            // 2. If valid, submit the data by calling the parent's function.
            //    We pass 'false' because the user is not finished yet.
            handleFormSubmit(form.getValues(), false);

            // 3. Reset the form for the next entry, but preserve the selected categories.
            form.reset({
                mainCategory: form.getValues('mainCategory'),
                category: form.getValues('category'),
                sectionId: form.getValues('sectionId'),
                topicId: form.getValues('topicId'),
                subTopicId: form.getValues('subTopicId'),
                // Reset all other fields to their default state
                quesType: "single_choice",
                answerType: "optional",
                difficultyLevel: "3",
                verificationStatus: "not_verified",
                comprehensionEnglish: "",
                questionEnglish: "",
                solutionEnglish: "",
                optionsEnglish: Array(5).fill({ text: "", isCorrect: false }),
                comprehensionHindi: "",
                questionHindi: "",
                solutionHindi: "",
                optionsHindi: Array(5).fill({ text: "", isCorrect: false }),
                numericalAnswerRange: "",
                marks: 4,
                priority: 1,
                quesStatus: "fresh",
            });
            toast.info("Question submitted. Form ready for the next entry.");
        } else {
            toast.error("Please fix the errors before proceeding.");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-8">
                <Card>
                    <CardHeader><CardTitle>Question Setup</CardTitle></CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            {/* --- Start of Dropdown Code --- */}
                            <FormField control={form.control} name="mainCategory" render={({ field }) => ( 
                                <FormItem>
                                    <FormLabel>Main Category</FormLabel>
                                    <Select 
                                        onValueChange={(value) => { 
                                            field.onChange(value); 
                                            setSelectedMainCategory?.(value); 
                                            form.resetField('category');
                                            form.resetField('sectionId');
                                            form.resetField('topicId');
                                            form.resetField('subTopicId');
                                        }} 
                                        value={field.value}
                                    >
                                        <FormControl><SelectTrigger><SelectValue placeholder={isLoadingMainCategories ? "Loading..." : "Select Main Category"} /></SelectTrigger></FormControl>
                                        <SelectContent>{mainCategories?.map((mc: any) => (<SelectItem key={mc.id} value={mc.id}>{mc.mainCategoryName}</SelectItem>))}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem> 
                            )}/>
                            <FormField control={form.control} name="category" render={({ field }) => ( 
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select 
                                        onValueChange={(value) => { 
                                            field.onChange(value); 
                                            setSelectedCategory?.(value);
                                            form.resetField('sectionId');
                                            form.resetField('topicId');
                                            form.resetField('subTopicId');
                                        }} 
                                        value={field.value} 
                                        disabled={!form.watch('mainCategory') || isLoadingCategories}
                                    >
                                        <FormControl><SelectTrigger><SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select Category"} /></SelectTrigger></FormControl>
                                        <SelectContent>{categories?.map((c: any) => (<SelectItem key={c.id} value={c.id}>{c.categoryName}</SelectItem>))}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem> 
                            )}/>
                            <FormField control={form.control} name="sectionId" render={({ field }) => ( 
                                <FormItem> 
                                    <FormLabel>Section</FormLabel>
                                    <Select 
                                        onValueChange={(value) => { 
                                            field.onChange(value); 
                                            setSelectedSection(value); 
                                            form.resetField('topicId');
                                            form.resetField('subTopicId');
                                        }} 
                                        value={field.value} 
                                        disabled={!form.watch('category') || isLoadingSections}
                                    >
                                        <FormControl><SelectTrigger><SelectValue placeholder={isLoadingSections ? "Loading..." : "Select a section"} /></SelectTrigger></FormControl>
                                        <SelectContent>{sections?.map((s: any) => (<SelectItem key={s.id} value={s.id}>{s.sectionName}</SelectItem>))}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem> 
                            )}/>
                            <FormField control={form.control} name="topicId" render={({ field }) => ( 
                                <FormItem>
                                    <FormLabel>Topic</FormLabel>
                                    <Select 
                                        onValueChange={(value) => { 
                                            field.onChange(value); 
                                            setSelectedTopic(value); 
                                            form.resetField('subTopicId');
                                        }} 
                                        value={field.value} 
                                        disabled={!form.watch('sectionId') || isLoadingTopics}
                                    >
                                        <FormControl><SelectTrigger><SelectValue placeholder={isLoadingTopics ? "Loading..." : "Select a topic"} /></SelectTrigger></FormControl>
                                        <SelectContent>{topics?.map((t: any) => (<SelectItem key={t.id} value={t.id}>{t.topicName}</SelectItem>))}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem> 
                            )}/>
                            <FormField control={form.control} name="subTopicId" render={({ field }) => ( 
                                <FormItem>
                                    <FormLabel>Sub Topic (Optional)</FormLabel>
                                    <Select 
                                        onValueChange={field.onChange} 
                                        value={field.value} 
                                        disabled={!form.watch('topicId') || isLoadingSubTopics}
                                    >
                                        <FormControl><SelectTrigger><SelectValue placeholder={isLoadingSubTopics ? "Loading..." : "Select a sub-topic"} /></SelectTrigger></FormControl>
                                        <SelectContent>{subTopics?.map((st: any) => (<SelectItem key={st._id} value={st._id}>{st.subTopicName}</SelectItem>))}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem> 
                            )}/>
                            {/* --- End of Dropdown Code --- */}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8 items-start pt-4">
                            <FormField name="quesType" control={form.control} render={({ field }) => ( <FormItem className="space-y-3"><FormLabel>Question Type</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-2 pt-2 sm:flex-row sm:flex-wrap sm:space-x-4 sm:space-y-0"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="single_choice" /></FormControl><FormLabel className="font-normal">Single Choice</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="comprehension" /></FormControl><FormLabel className="font-normal">Comprehension</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)}/>
                            <FormField name="answerType" control={form.control} render={({ field }) => ( <FormItem className="space-y-3"><FormLabel>Answer Type</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-2 pt-2 sm:flex-row sm:flex-wrap sm:space-x-4 sm:space-y-0"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="optional" /></FormControl><FormLabel className="font-normal">Optional</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="numerical" /></FormControl><FormLabel className="font-normal">Numerical</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="multi-select" /></FormControl><FormLabel className="font-normal">Multi-Select</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)}/>
                            <FormField name="difficultyLevel" control={form.control} render={({ field }) => (<FormItem><FormLabel>Difficulty Level</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger></FormControl><SelectContent>{[1,2,3,4,5].map(level => <SelectItem key={level} value={String(level)}>{level}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                            <FormField name="marks" control={form.control} render={({ field }) => (<FormItem><FormLabel>Marks</FormLabel><Input type="number" placeholder="e.g., 4" {...field} /></FormItem>)} />
                            <FormField name="priority" control={form.control} render={({ field }) => (<FormItem><FormLabel>Priority</FormLabel><Input type="number" placeholder="e.g., 1" {...field} /></FormItem>)} />
                            <FormField name="customerId" control={form.control} render={({ field }) => (<FormItem><FormLabel>Customer ID (Optional)</FormLabel><Input placeholder="Customer ID" {...field} /></FormItem>)} />
                            <FormField name="quesStatus" control={form.control} render={({ field }) => (<FormItem><FormLabel>Question Status (Optional)</FormLabel><Input placeholder="e.g., fresh" {...field} /></FormItem>)} />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader><CardTitle>English</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            {quesType === 'comprehension' && <FormField name="comprehensionEnglish" control={form.control} render={({ field }) => (<FormItem><FormLabel>Comprehension (English)</FormLabel><FormControl><CKEditorComponent data={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />}
                            <FormField name="questionEnglish" control={form.control} render={({ field }) => (<FormItem><FormLabel>Question (English)</FormLabel><FormControl><CKEditorComponent data={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                            {(answerType === 'optional' || answerType === 'multi-select') && (
                                <div className="space-y-3">
                                    <FormLabel>Options (English)</FormLabel>
                                    <Controller
                                        name="optionsEnglish"
                                        control={form.control}
                                        render={() => (
                                            <RadioGroup onValueChange={handleSingleAnswerChange} value={String(form.getValues('optionsEnglish').findIndex(opt => opt.isCorrect))} className="space-y-4" disabled={answerType !== 'optional'}>
                                                {optionsEnglishFields.map((item, index) => (
                                                    <div key={item.id} className="flex items-start gap-3">
                                                        <div className="flex-shrink-0 pt-1">
                                                            {answerType === 'optional' ? ( <FormControl><RadioGroupItem value={String(index)} /></FormControl> ) : ( <FormField control={form.control} name={`optionsEnglish.${index}.isCorrect`} render={({ field: checkboxField }) => (<FormControl><Checkbox checked={checkboxField.value} onCheckedChange={(checked) => { checkboxField.onChange(checked); form.setValue(`optionsHindi.${index}.isCorrect`, !!checked); }} /></FormControl>)}/> )}
                                                        </div>
                                                        <FormField control={form.control} name={`optionsEnglish.${index}.text`} render={({ field: textField }) => (
                                                            <FormItem className="w-full"><FormControl><CKEditorComponent data={textField.value} onChange={textField.onChange} /></FormControl></FormItem>
                                                        )}/>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        )}
                                    />
                                </div>
                            )}
                            <FormField name="solutionEnglish" control={form.control} render={({ field }) => (<FormItem><FormLabel>Solution (English)</FormLabel><FormControl><CKEditorComponent data={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader><CardTitle>Hindi</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                           {quesType === 'comprehension' && <FormField name="comprehensionHindi" control={form.control} render={({ field }) => (<FormItem><FormLabel>Comprehension (Hindi)</FormLabel><FormControl><CKEditorComponent data={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />}
                           <FormField name="questionHindi" control={form.control} render={({ field }) => (<FormItem><FormLabel>Question (Hindi)</FormLabel><FormControl><CKEditorComponent data={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                           {(answerType === 'optional' || answerType === 'multi-select') && (
                               <div className="space-y-3">
                                   <FormLabel>Options (Hindi)</FormLabel>
                                   <Controller
                                       name="optionsHindi"
                                       control={form.control}
                                       render={() => (
                                           <RadioGroup className="space-y-4" disabled>
                                               {optionsHindiFields.map((item, index) => (
                                                   <div key={item.id} className="flex items-start gap-3">
                                                       <div className="flex-shrink-0 pt-1">
                                                           {answerType === 'optional' ? ( <RadioGroupItem value={String(index)} checked={form.getValues(`optionsEnglish.${index}.isCorrect`)} /> ) : ( <Checkbox checked={form.getValues(`optionsEnglish.${index}.isCorrect`)} />)}
                                                       </div>
                                                       <FormField control={form.control} name={`optionsHindi.${index}.text`} render={({ field: textField }) => ( 
                                                            <FormItem className="w-full"><FormControl><CKEditorComponent data={textField.value} onChange={textField.onChange} /></FormControl></FormItem>
                                                        )}/>
                                                   </div>
                                               ))}
                                           </RadioGroup>
                                       )}
                                   />
                               </div>
                           )}
                           <FormField name="solutionHindi" control={form.control} render={({ field }) => (<FormItem><FormLabel>Solution (Hindi)</FormLabel><FormControl><CKEditorComponent data={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                        </CardContent>
                    </Card>
                </div>

                {answerType === 'numerical' && (
                    <Card>
                        <CardHeader><CardTitle>Numerical Answer</CardTitle></CardHeader>
                        <CardContent><FormField name="numericalAnswerRange" control={form.control} render={({ field }) => (<FormItem><FormLabel>Answer</FormLabel><Input placeholder="e.g., 10-20 or 15" {...field} /><FormDescription>Use a hyphen for a range.</FormDescription><FormMessage /></FormItem>)}/></CardContent>
                    </Card>
                )}
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 pt-4">
                    <FormField control={form.control} name="verificationStatus" render={({ field }) => (
                            <FormItem className="w-full sm:w-[180px]">
                                <FormLabel>Verification Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="verified">Verified</SelectItem>
                                        <SelectItem value="not_verified">Not Verified</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )} 
                    />
                    <div className="flex justify-end items-center gap-4">
                        <Button type="button" variant="outline" onClick={() => setLocation('/questions')}>Cancel</Button>
                        <Button type="button" variant="secondary" onClick={handleNextQuestion} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Next Question
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Finish
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}