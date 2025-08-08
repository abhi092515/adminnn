"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const API_BASE_URL = 'http://localhost:5099/api'; // Adjust if needed

// --- API Functions for Form Data ---
const fetchSections = async () => {
    const res = await fetch(`${API_BASE_URL}/sections`);
    if (!res.ok) throw new Error("Failed to fetch sections");
    const result = await res.json();
    return result.data;
};
const fetchTopicsBySection = async (sectionId: string) => {
    if (!sectionId) return [];
    const res = await fetch(`${API_BASE_URL}/topics?sectionId=${sectionId}`);
    if (!res.ok) throw new Error("Failed to fetch topics");
    const result = await res.json();
    return result.data;
};
// Add a fetchSubTopics function here if you have that API endpoint

// --- API Function for Duplication ---
const duplicateQuestions = async (payload: { sourceQuestionIds: string[], targetTopicId: string, targetSubTopicId?: string }) => {
    const res = await fetch(`${API_BASE_URL}/questions/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to duplicate questions');
    }
    return res.json();
};

const formSchema = z.object({
    sectionId: z.string().min(1, "Please select a section."),
    topicId: z.string().min(1, "Please select a topic."),
    subTopicId: z.string().optional(),
    questionIds: z.string().min(1, "Please enter at least one question ID."),
});

type FormValues = z.infer<typeof formSchema>;

export default function DuplicateQuestionPage() {
    const [_, setLocation] = useLocation();
    const [selectedSection, setSelectedSection] = useState("");

    const { data: sections, isLoading: isLoadingSections } = useQuery({ queryKey: ['sections'], queryFn: fetchSections });
    const { data: topics, isLoading: isLoadingTopics } = useQuery({ 
        queryKey: ['topics', selectedSection], 
        queryFn: () => fetchTopicsBySection(selectedSection),
        enabled: !!selectedSection 
    });
    // Add a useQuery for sub-topics here if needed

    const mutation = useMutation({
        mutationFn: duplicateQuestions,
        onSuccess: (res) => {
            toast.success(res.message || "Questions duplicated successfully!");
            form.reset();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { sectionId: "", topicId: "", subTopicId: "", questionIds: "" },
    });

    const onSubmit = (values: FormValues) => {
        const sourceQuestionIds = values.questionIds.split(',').map(id => id.trim()).filter(Boolean);
        if (sourceQuestionIds.length === 0) {
            toast.error("Please enter valid, comma-separated question IDs.");
            return;
        }

        mutation.mutate({
            sourceQuestionIds,
            targetTopicId: values.topicId,
            targetSubTopicId: values.subTopicId,
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Duplicate Question</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Duplicate Question Section</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="sectionId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Section</FormLabel>
                                        <Select onValueChange={(value) => { field.onChange(value); setSelectedSection(value); form.setValue('topicId', ''); }} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isLoadingSections ? "Loading..." : "Select a section"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>{sections?.map((s: any) => (<SelectItem key={s.id} value={s.id}>{s.sectionName}</SelectItem>))}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="topicId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Topic</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedSection || isLoadingTopics}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isLoadingTopics ? "Loading..." : "Select a topic"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>{topics?.map((t: any) => (<SelectItem key={t.id} value={t.id}>{t.topicName}</SelectItem>))}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="subTopicId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sub Topic (Optional)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!form.getValues('topicId')}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a sub-topic" /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="placeholder-id">Placeholder Sub-Topic</SelectItem></SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="questionIds"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assign Question IDs</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter question IDs separated by commas..." {...field} rows={5} />
                                        </FormControl>
                                        <FormDescription>Copy and paste one or more question IDs here.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => setLocation('/')}>Cancel</Button>
                                <Button type="submit" disabled={mutation.isPending}>
                                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Copy Questions
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}