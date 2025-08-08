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

const formSchema = z.object({
  section: z.string().min(1, "Please select a section."),
  topic: z.string().min(1, "Please select a topic."),
  subTopic: z.string().optional(),
  questionType: z.enum(["single", "comprehension"]),
  answerType: z.enum(["optional", "numerical", "multi-select"]),
  copyQuestion: z.enum(["complete", "question", "option", "solution"]),
  tags: z.string().optional(),
  difficultyLevel: z.string().min(1, "Please select a difficulty level."),
  status: z.enum(["verified", "not_verified"]),
  comprehensionEnglish: z.string().optional(),
  questionEnglish: z.string().min(1, "English question is required."),
  solutionEnglish: z.string().optional(),
  optionsEnglish: z.array(z.object({ text: z.string(), isCorrect: z.boolean() })),
  comprehensionHindi: z.string().optional(),
  questionHindi: z.string().min(1, "Hindi question is required."),
  solutionHindi: z.string().optional(),
  optionsHindi: z.array(z.object({ text: z.string(), isCorrect: z.boolean() })),
  numericalAnswerRange: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type QuestionFormProps = {
  onSubmit: (values: FormValues, isFinished: boolean) => void;
  isPending?: boolean;
};

export function QuestionForm({ onSubmit, isPending }: QuestionFormProps) {
    const [_, setLocation] = useLocation();
    const { sections, topics, subTopics, setSelectedSection, setSelectedTopic, isLoadingSections, isLoadingTopics, isLoadingSubTopics } = useQuestionFormData();
    const [activeEditorId, setActiveEditorId] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            questionType: "single",
            answerType: "optional",
            copyQuestion: "complete",
            difficultyLevel: "3",
            status: "not_verified",
            optionsEnglish: Array(5).fill({ text: "", isCorrect: false }),
            optionsHindi: Array(5).fill({ text: "", isCorrect: false }),
        },
    });

    const { fields: optionsEnglishFields } = useFieldArray({ control: form.control, name: "optionsEnglish" });
    const { fields: optionsHindiFields } = useFieldArray({ control: form.control, name: "optionsHindi" });

    const questionType = form.watch("questionType");
    const answerType = form.watch("answerType");

    const handleSingleAnswerChange = (selectedIndexStr: string) => {
        const selectedIndex = parseInt(selectedIndexStr, 10);
        if (answerType === 'optional' && !isNaN(selectedIndex)) {
            const currentEnglishOptions = form.getValues('optionsEnglish');
            const newEnglishOptions = currentEnglishOptions.map((opt, i) => ({ ...opt, isCorrect: i === selectedIndex }));
            form.setValue('optionsEnglish', newEnglishOptions, { shouldDirty: true });
            
            const currentHindiOptions = form.getValues('optionsHindi');
            const newHindiOptions = currentHindiOptions.map((opt, i) => ({ ...opt, isCorrect: i === selectedIndex }));
            form.setValue('optionsHindi', newHindiOptions, { shouldDirty: true });
        }
    };
    
    const handleSubmit = (values: FormValues) => onSubmit(values, true);

    const handleNextQuestion = async () => {
        const isValid = await form.trigger();
        if (isValid) {
            onSubmit(form.getValues(), false);
            form.reset({
                section: form.getValues('section'),
                topic: form.getValues('topic'),
                subTopic: form.getValues('subTopic'),
                questionType: "single",
                answerType: "optional",
                copyQuestion: "complete",
                tags: "",
                difficultyLevel: "3",
                status: "not_verified",
                comprehensionEnglish: "",
                questionEnglish: "",
                solutionEnglish: "",
                optionsEnglish: Array(5).fill({ text: "", isCorrect: false }),
                comprehensionHindi: "",
                questionHindi: "",
                solutionHindi: "",
                optionsHindi: Array(5).fill({ text: "", isCorrect: false }),
                numericalAnswerRange: "",
            });
            toast.info("Form reset for the next question.");
        } else {
            toast.error("Please fix the errors before proceeding.");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                <Card>
                    <CardHeader><CardTitle>Question Setup</CardTitle></CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField control={form.control} name="section" render={({ field }) => ( <FormItem> <FormLabel>Section</FormLabel> <Select onValueChange={(value) => { field.onChange(value); setSelectedSection(value); form.setValue('topic', ''); form.setValue('subTopic', ''); }} value={field.value}> <FormControl><SelectTrigger><SelectValue placeholder={isLoadingSections ? "Loading..." : "Select a section"} /></SelectTrigger></FormControl> <SelectContent>{sections?.map((s: any) => (<SelectItem key={s.id} value={s.id}>{s.sectionName}</SelectItem>))}</SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="topic" render={({ field }) => ( <FormItem> <FormLabel>Topic</FormLabel> <Select onValueChange={(value) => { field.onChange(value); setSelectedTopic(value); form.setValue('subTopic', ''); }} value={field.value} disabled={!form.watch('section') || isLoadingTopics}> <FormControl><SelectTrigger><SelectValue placeholder={isLoadingTopics ? "Loading..." : "Select a topic"} /></SelectTrigger></FormControl> <SelectContent>{topics?.map((t: any) => (<SelectItem key={t.id} value={t.id}>{t.topicName}</SelectItem>))}</SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="subTopic" render={({ field }) => ( <FormItem> <FormLabel>Sub Topic (Optional)</FormLabel> <Select onValueChange={field.onChange} value={field.value} disabled={!form.watch('topic') || isLoadingSubTopics}> <FormControl><SelectTrigger><SelectValue placeholder={isLoadingSubTopics ? "Loading..." : "Select a sub-topic"} /></SelectTrigger></FormControl> <SelectContent>{subTopics?.map((st: any) => (<SelectItem key={st.id} value={st.id}>{st.subTopicName}</SelectItem>))}</SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8 items-start pt-4">
                            <FormField name="questionType" control={form.control} render={({ field }) => ( <FormItem className="space-y-3"><FormLabel>Question Type</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="single" /></FormControl><FormLabel className="font-normal">Single</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="comprehension" /></FormControl><FormLabel className="font-normal">Comprehension</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)}/>
                            <FormField name="answerType" control={form.control} render={({ field }) => ( <FormItem className="space-y-3"><FormLabel>Answer Type</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-2 pt-2 sm:flex-row sm:flex-wrap sm:space-x-4 sm:space-y-0"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="optional" /></FormControl><FormLabel className="font-normal">Optional</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="numerical" /></FormControl><FormLabel className="font-normal">Numerical</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="multi-select" /></FormControl><FormLabel className="font-normal">Multi-Select</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)}/>
                            <FormField name="copyQuestion" control={form.control} render={({ field }) => ( <FormItem className="space-y-3"><FormLabel>Copy Question</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-2 pt-2 sm:flex-row sm:flex-wrap sm:space-x-4 sm:space-y-0"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="complete" /></FormControl><FormLabel className="font-normal">Complete</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="question" /></FormControl><FormLabel className="font-normal">Question</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="option" /></FormControl><FormLabel className="font-normal">Option</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="solution" /></FormControl><FormLabel className="font-normal">Solution</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)}/>
                            <FormField name="tags" control={form.control} render={({ field }) => (<FormItem><FormLabel>Tags</FormLabel><Input placeholder="tag1, tag2" {...field} /></FormItem>)} />
                            <FormField name="difficultyLevel" control={form.control} render={({ field }) => (<FormItem><FormLabel>Difficulty Level</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger></FormControl><SelectContent>{[1,2,3,4,5].map(level => <SelectItem key={level} value={String(level)}>{level}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* ✅ FIX: Removed "flex flex-col" from the Card component */}
                    <Card>
                        <CardHeader><CardTitle>English</CardTitle></CardHeader>
                        {/* ✅ FIX: Removed "flex-1 flex flex-col" from CardContent */}
                        <CardContent className="space-y-6">
                            {questionType === 'comprehension' && <FormField name="comprehensionEnglish" control={form.control} render={({ field }) => (<FormItem><FormLabel>Comprehension (English)</FormLabel><FormControl><CKEditorComponent {...field} /></FormControl><FormMessage /></FormItem>)} />}
                            <FormField name="questionEnglish" control={form.control} render={({ field }) => (<FormItem><FormLabel>Question (English)</FormLabel><FormControl><CKEditorComponent {...field} /></FormControl><FormMessage /></FormItem>)} />
                            {(answerType === 'optional' || answerType === 'multi-select') && (
                                <div className="space-y-3">
                                    <FormLabel>Options (English)</FormLabel>
                                    <Controller
                                        name="optionsEnglish"
                                        control={form.control}
                                        render={({ field }) => (
                                            <RadioGroup onValueChange={handleSingleAnswerChange} value={String(field.value.findIndex(opt => opt.isCorrect))} className="space-y-4" disabled={answerType !== 'optional'}>
                                                {optionsEnglishFields.map((item, index) => (
                                                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-start gap-3">
                                                        <div className="flex-shrink-0 pt-1">
                                                            {answerType === 'optional' ? ( <FormControl><RadioGroupItem value={String(index)} id={`en-opt-${index}`} /></FormControl> ) : ( <FormField control={form.control} name={`optionsEnglish.${index}.isCorrect`} render={({ field: checkboxField }) => (<FormControl><Checkbox checked={checkboxField.value} onCheckedChange={(checked) => { checkboxField.onChange(checked); form.setValue(`optionsHindi.${index}.isCorrect`, !!checked); }} /></FormControl>)}/> )}
                                                        </div>
                                                        <FormField control={form.control} name={`optionsEnglish.${index}.text`} render={({ field: textField }) => ( <FormItem className="w-full"><FormControl>{activeEditorId === item.id ? (<CKEditorComponent {...textField} />) : (<Input {...textField} onFocus={() => setActiveEditorId(item.id)} placeholder={`Option ${index + 1}`} />)}</FormControl></FormItem>)}/>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        )}
                                    />
                                </div>
                            )}
                            <FormField name="solutionEnglish" control={form.control} render={({ field }) => (<FormItem><FormLabel>Solution (English)</FormLabel><FormControl><CKEditorComponent {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader><CardTitle>Hindi</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                           {questionType === 'comprehension' && <FormField name="comprehensionHindi" control={form.control} render={({ field }) => (<FormItem><FormLabel>Comprehension (Hindi)</FormLabel><FormControl><CKEditorComponent {...field} /></FormControl><FormMessage /></FormItem>)} />}
                           <FormField name="questionHindi" control={form.control} render={({ field }) => (<FormItem><FormLabel>Question (Hindi)</FormLabel><FormControl><CKEditorComponent {...field} /></FormControl><FormMessage /></FormItem>)} />
                           {(answerType === 'optional' || answerType === 'multi-select') && (
                               <div className="space-y-3">
                                   <FormLabel>Options (Hindi)</FormLabel>
                                   <Controller
                                       name="optionsHindi"
                                       control={form.control}
                                       render={({ field }) => (
                                           <RadioGroup onValueChange={handleSingleAnswerChange} value={String(field.value.findIndex(opt => opt.isCorrect))} className="space-y-4" disabled={answerType !== 'optional'}>
                                               {optionsHindiFields.map((item, index) => (
                                                   <div key={item.id} className="flex flex-col sm:flex-row sm:items-start gap-3">
                                                       <div className="flex-shrink-0 pt-1">
                                                            {answerType === 'optional' ? ( <FormControl><RadioGroupItem value={String(index)} id={`hi-opt-${index}`} /></FormControl> ) : ( <FormField control={form.control} name={`optionsHindi.${index}.isCorrect`} render={({ field: checkboxField }) => (<FormControl><Checkbox checked={checkboxField.value} onCheckedChange={(checked) => { checkboxField.onChange(checked); form.setValue(`optionsEnglish.${index}.isCorrect`, !!checked); }} /></FormControl>)}/> )}
                                                       </div>
                                                       <FormField control={form.control} name={`optionsHindi.${index}.text`} render={({ field: textField }) => (<FormItem className="w-full"><FormControl>{activeEditorId === item.id ? (<CKEditorComponent {...textField} />) : (<Input {...textField} onFocus={() => setActiveEditorId(item.id)} placeholder={`Option ${index + 1}`} />)}</FormControl></FormItem>)}/>
                                                   </div>
                                               ))}
                                           </RadioGroup>
                                       )}
                                   />
                               </div>
                           )}
                           <FormField name="solutionHindi" control={form.control} render={({ field }) => (<FormItem><FormLabel>Solution (Hindi)</FormLabel><FormControl><CKEditorComponent {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </CardContent>
                    </Card>
                </div>

                {answerType === 'numerical' && (
                    <Card>
                        <CardHeader><CardTitle>Numerical Answer</CardTitle></CardHeader>
                        <CardContent><FormField name="numericalAnswerRange" control={form.control} render={({ field }) => (<FormItem><FormLabel>Answer Range</FormLabel><Input placeholder="e.g., 10,20" {...field} /><FormDescription>Use a comma to separate a range. Use a single number for an exact answer.</FormDescription><FormMessage /></FormItem>)}/></CardContent>
                    </Card>
                )}
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 pt-4">
                    <FormField 
                        control={form.control} 
                        name="status" 
                        render={({ field }) => (
                            <FormItem className="w-full sm:w-[180px]">
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                                    </FormControl>
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
                        <Button type="button" variant="secondary" onClick={handleNextQuestion} disabled={isPending}>Next Question</Button>
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