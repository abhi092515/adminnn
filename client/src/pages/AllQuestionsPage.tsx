"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link } from "wouter";
import { useQuestions, type QuestionFilters } from "@/hooks/useQuestions";
import { useQuestionFilters } from "@/hooks/useQuestionFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Loader2, Plus, Edit, Trash2, Search, SlidersHorizontal, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// This defines the initial state for your filters, including pagination.
const initialFilterState: QuestionFilters = {
    page: 1,
    limit: 10,
    questionId: "",
    keywords: "",
    tags: "",
    questionType: undefined,
    status: undefined,
    sectionId: "",
    topicId: "",
    subTopicId: "",
    difficultyLevel: "",
    answerType: undefined,
    language: undefined,
    isReported: undefined,
    isDuplicate: undefined,
    reviewer: "",
    admin: "",
    reportedType: undefined,
};

export default function AllQuestionsPage() {
    // State to hold the current filters sent to the API
    const [filters, setFilters] = useState<QuestionFilters>(initialFilterState);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

    
    // React Hook Form instance to manage the filter form inputs
    const form = useForm<QuestionFilters>({
        defaultValues: initialFilterState
    });

    // --- Data Fetching ---
    // ✅ FIX: Renamed destructured 'data' to 'allQuestions' to reflect that it's the full array.
    const { data: allQuestions, isLoading, isFetching, deleteQuestion } = useQuestions(filters);
    
    // Hook to populate the cascading dropdowns in the advanced filters
    const { 
        sections, topics, 
        topicsForFilter, subTopics, 
        setSelectedSection, setSelectedTopic,
        isLoadingSections, isLoadingTopicsForFilter, isLoadingSubTopics 
    } = useQuestionFilters();

    // --- Event Handlers ---
    const onSubmit = (values: QuestionFilters) => {
        setFilters({ ...values, page: 1, limit: filters.limit });
    };

    const resetFilters = () => {
        form.reset(initialFilterState);
        setSelectedSection("");
        setSelectedTopic("");
        setFilters(initialFilterState);
    };
    
    const setPage = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const setLimit = (newLimit: string | number) => {
        setFilters(prev => ({ ...prev, page: 1, limit: Number(newLimit) }));
    };

    const handleOpenDeleteDialog = (id: string) => {
        setQuestionToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (questionToDelete) {
            deleteQuestion.mutate(questionToDelete, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setQuestionToDelete(null);
                }
            });
        }
    };

    // --- Data Processing ---
    const sectionMap = useMemo(() => {
        if (!Array.isArray(sections)) return new Map();
        return new Map(sections.map((s: any) => [s.id, s.sectionName]));
    }, [sections]);

    const topicMap = useMemo(() => {
        if (!Array.isArray(topics)) return new Map();
        return new Map(topics.map((t: any) => [t.id, t.topicName]));
    }, [topics]);

    // ✅ FIX: This logic correctly handles local pagination for the API's simple array response.
    const questions = allQuestions || [];
    const totalResults = questions.length;
    const totalPages = Math.ceil(totalResults / (filters.limit || 10));
    const currentPage = filters.page || 1;

    const paginatedQuestions = useMemo(() => {
        return questions.slice(
            (currentPage - 1) * (filters.limit || 10),
            currentPage * (filters.limit || 10)
        );
    }, [questions, currentPage, filters.limit]);
    // -----------------------------------------------------------

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">All Questions</h1>
                <Link href="/questions/new">
                    <Button><Plus className="h-4 w-4 mr-2" /> Add New</Button>
                </Link>
            </div>

            {/* --- Filter Section --- */}
            <Card>
                <CardContent className="p-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <FormField name="keywords" control={form.control} render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Search by Keyword</FormLabel>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Enter keyword, title, or tags..." {...field} className="pl-10" />
                                        </div>
                                    </FormItem>
                                )}/>
                                <div className="flex items-end gap-2">
                                    <Button type="submit" disabled={isFetching}>
                                        {isFetching && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Search
                                    </Button>
                                    <Button type="button" variant="secondary" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                                        <SlidersHorizontal className="h-4 w-4 mr-2" /> Advanced
                                    </Button>
                                </div>
                            </div>
                            
                            {showAdvancedFilters && (
                                <div className="border-t pt-6 mt-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        <FormField name="questionId" control={form.control} render={({ field }) => (<FormItem><FormLabel>Question ID</FormLabel><Input placeholder="Exact Question ID" {...field} value={field.value || ''} /></FormItem>)} />
                                        <FormField name="tags" control={form.control} render={({ field }) => (<FormItem><FormLabel>Tags</FormLabel><Input placeholder="tags" {...field} value={field.value || ''} /></FormItem>)} />
                                        <FormField name="sectionId" control={form.control} render={({ field }) => (<FormItem><FormLabel>Section</FormLabel><Select onValueChange={(value) => { field.onChange(value); setSelectedSection(value); form.setValue('topicId', ''); form.setValue('subTopicId', ''); }} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder={isLoadingSections ? "Loading..." : "Select section"} /></SelectTrigger></FormControl><SelectContent>{Array.isArray(sections) && sections.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.sectionName}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                                        <FormField name="topicId" control={form.control} render={({ field }) => (<FormItem><FormLabel>Topic</FormLabel><Select onValueChange={(value) => { field.onChange(value); setSelectedTopic(value); form.setValue('subTopicId', ''); }} value={field.value} disabled={!form.watch('sectionId') || isLoadingTopicsForFilter}><FormControl><SelectTrigger><SelectValue placeholder={isLoadingTopicsForFilter ? "Loading..." : "Select topic"} /></SelectTrigger></FormControl><SelectContent>{Array.isArray(topicsForFilter) && topicsForFilter.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.topicName}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                                        <FormField name="subTopicId" control={form.control} render={({ field }) => (<FormItem><FormLabel>Sub Topic</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!form.watch('topicId') || isLoadingSubTopics}><FormControl><SelectTrigger><SelectValue placeholder={isLoadingSubTopics ? "Loading..." : "Select sub topic"} /></SelectTrigger></FormControl><SelectContent>{Array.isArray(subTopics) && subTopics.map((st: any) => <SelectItem key={st.id} value={st.id}>{st.subTopicName}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                                        <FormField name="status" control={form.control} render={({ field }) => (<FormItem><FormLabel>Question Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="verified">Verified</SelectItem><SelectItem value="not_verified">Not Verified</SelectItem><SelectItem value="fresh">Fresh</SelectItem><SelectItem value="in_use">In Used</SelectItem></SelectContent></Select></FormItem>)} />
                                        <FormField name="difficultyLevel" control={form.control} render={({ field }) => (<FormItem><FormLabel>Difficulty Level</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger></FormControl><SelectContent>{[1,2,3,4,5,6].map(l => <SelectItem key={l} value={String(l)}>{l}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                                        <FormField name="language" control={form.control} render={({ field }) => (<FormItem><FormLabel>Language</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger></FormControl><SelectContent><SelectItem value="english">English</SelectItem><SelectItem value="hindi">Hindi</SelectItem></SelectContent></Select></FormItem>)} />
                                        <FormField name="reportedType" control={form.control} render={({ field }) => (<FormItem><FormLabel>Reported Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="formatting_issue">Formatting Issue</SelectItem><SelectItem value="no_solution">No Solution</SelectItem><SelectItem value="wrong_answer">Wrong Answer</SelectItem><SelectItem value="wrong_question">Wrong Question</SelectItem><SelectItem value="others">Others</SelectItem></SelectContent></Select></FormItem>)}/>
                                        <FormField name="admin" control={form.control} render={({ field }) => (<FormItem><FormLabel>Admins</FormLabel><Input placeholder="Admin or Data Entry name" {...field} value={field.value || ''} /></FormItem>)} />
                                        <FormField name="reviewer" control={form.control} render={({ field }) => (<FormItem><FormLabel>Reviewer</FormLabel><Input placeholder="Reviewer name" {...field} value={field.value || ''} /></FormItem>)} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                                        <FormField name="questionType" control={form.control} render={({ field }) => (<FormItem><FormLabel>Question Type</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="single" /></FormControl><FormLabel className="font-normal">Single</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="comprehension" /></FormControl><FormLabel className="font-normal">Comprehension</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)}/>
                                        <FormField name="answerType" control={form.control} render={({ field }) => (<FormItem><FormLabel>Answer Type</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="optional" /></FormControl><FormLabel className="font-normal">Optional</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="numerical" /></FormControl><FormLabel className="font-normal">Numerical</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="multi-select" /></FormControl><FormLabel className="font-normal">Multi-Select</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)}/>
                                        <FormField name="isReported" control={form.control} render={({ field }) => (<FormItem><FormLabel>Reported</FormLabel><FormControl><RadioGroup onValueChange={(val) => field.onChange(val === 'true')} value={String(field.value)} className="flex items-center space-x-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)}/>
                                        <FormField name="isDuplicate" control={form.control} render={({ field }) => (<FormItem><FormLabel>Duplicate</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="only_duplicate" /></FormControl><FormLabel className="font-normal">Only Duplicate</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="only_original" /></FormControl><FormLabel className="font-normal">Only Original</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)}/>
                                    </div>
                                    <div className="flex justify-end gap-4">
                                        <Button type="button" variant="outline" onClick={resetFilters}>Reset All</Button>
                                        <Button type="submit">Apply Filters</Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* --- Results Section --- */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Question List</CardTitle>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">Total: {totalResults}</span>
                            <Select onValueChange={setLimit} defaultValue={String(filters.limit)}>
                                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">Show 10</SelectItem>
                                    <SelectItem value="25">Show 25</SelectItem>
                                    <SelectItem value="50">Show 50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>S.No.</TableHead>
                                    <TableHead>#QId.</TableHead>
                                    <TableHead>Question</TableHead>
                                    <TableHead>Topic</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Difficulty</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: filters.limit! }).map((_, i) => (
                                        <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                                    ))
                                ) : totalResults === 0 ? (
                                     <TableRow><TableCell colSpan={7} className="h-32 text-center">No questions found.</TableCell></TableRow>
                                ) : (
                                    paginatedQuestions.map((q: any, index: number) => (
                                        <TableRow key={q._id}>
                                            <TableCell>{((currentPage - 1) * (filters.limit ?? 10)) + index + 1}</TableCell>
                                            <TableCell className="font-mono text-xs">{q.questionId || q._id}</TableCell>
                                            <TableCell className="max-w-xs truncate">{q.question?.en || 'N/A'}</TableCell>
                                            <TableCell>{topicMap.get(q.topicId) || 'N/A'}</TableCell>
                                            <TableCell>{sectionMap.get(q.sectionId) || 'N/A'}</TableCell>
                                            <TableCell>{q.difficultyLevel}</TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/questions/edit/${q._id}`}><Button variant="ghost" size="icon" title="Edit"><Edit className="h-4 w-4" /></Button></Link>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-red-500" 
                                                    title="Delete"
                                                    onClick={() => handleOpenDeleteDialog(q._id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="flex w-full justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
                             <Button variant="outline" size="sm" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= totalPages}>Next</Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the question
                            from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteConfirm}
                            disabled={deleteQuestion.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteQuestion.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}