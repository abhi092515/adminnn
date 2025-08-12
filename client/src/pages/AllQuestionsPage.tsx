"use client";

import { useState } from "react";
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

const initialFilterState: QuestionFilters = {
    page: 1,
    limit: 10,
    // ... other initial filters
};

export default function AllQuestionsPage() {
    const [filters, setFilters] = useState<QuestionFilters>(initialFilterState);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    
    const form = useForm<QuestionFilters>({
        defaultValues: initialFilterState
    });

    // FIX: We pass the filters to the hook, but will perform slicing locally.
    const { data: responseData, isLoading, isFetching } = useQuestions(filters);
    
    const { 
        sections, topics, subTopics, 
        setSelectedSection, setSelectedTopic,
        // ... other hook values
    } = useQuestionFilters();

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
        if (newPage > 0) {
            setFilters(prev => ({ ...prev, page: newPage }));
        }
    };

    const setLimit = (newLimit: string | number) => {
        setFilters(prev => ({ ...prev, page: 1, limit: Number(newLimit) }));
    };

    // --- FIX: All local pagination logic is now handled here ---
    const questions = responseData || [];
    const totalResults = questions.length;
    const totalPages = Math.ceil(totalResults / filters.limit);
    const currentPage = filters.page;

    const paginatedQuestions = questions.slice(
      (currentPage - 1) * filters.limit,
      currentPage * filters.limit
    );
    // -----------------------------------------------------------

    return (
        <div className="space-y-6">
            {/* --- No changes needed in the header or filter form --- */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">All Questions</h1>
                <Link href="/questions/new">
                    <Button><Plus className="h-4 w-4 mr-2" /> Add New</Button>
                </Link>
            </div>
            <Card>
                {/* ... The filter form section remains unchanged ... */}
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Results</CardTitle>
                        <div className="flex items-center gap-4">
                            {/* FIX: Use our locally calculated totalResults */}
                            <span className="text-sm text-muted-foreground">Total Results: {totalResults}</span>
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
                                {/* ... TableHeader remains unchanged ... */}
                            </TableHeader>
                            <TableBody>
                                {isLoading || isFetching ? (
                                    <TableRow><TableCell colSpan={8} className="h-32 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                                ) : totalResults === 0 ? (
                                     <TableRow><TableCell colSpan={8} className="h-32 text-center">No questions found.</TableCell></TableRow>
                                ) : (
                                    // FIX: Map over the locally sliced 'paginatedQuestions' array
                                    paginatedQuestions.map((q: any, index: number) => (
                                        <TableRow key={q._id}>
                                            <TableCell>{((currentPage - 1) * filters.limit) + index + 1}</TableCell>
                                            <TableCell className="font-mono">{q.questionId}</TableCell>
                                            {/* FIX: Access nested question text */}
                                            <TableCell className="max-w-xs truncate">{q.question?.en}</TableCell>
                                            <TableCell>{q.topic?.name}</TableCell>
                                            <TableCell>{q.section?.name}</TableCell>
                                            <TableCell>{q.difficultyLevel}</TableCell>
                                            <TableCell><Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button></TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/questions/edit/${q._id}`}><Button variant="ghost" size="icon" title="Edit"><Edit className="h-4 w-4" /></Button></Link>
                                                <Button variant="ghost" size="icon" className="text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></Button>
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
                        {/* FIX: Use our local currentPage and totalPages variables */}
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
                             <Button variant="outline" size="sm" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}