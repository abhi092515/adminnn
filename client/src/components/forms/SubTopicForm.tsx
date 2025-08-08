"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTopicList } from "@/hooks/use-sub-topics";
import { useLocation } from "wouter";

const formSchema = z.object({
  subTopicName: z.string().min(1, "Sub-topic name is required."),
  topic: z.string().min(1, "Please select a parent topic."),
  status: z.enum(["active", "inactive"]),
});

type FormValues = z.infer<typeof formSchema>;

type SubTopicFormProps = {
  onSubmit: (data: FormValues) => void;
  initialData?: any;
  isPending?: boolean;
};

export function SubTopicForm({ onSubmit, initialData, isPending }: SubTopicFormProps) {
  const [_, setLocation] = useLocation();
  const { data: topics, isLoading: isLoadingTopics } = useTopicList();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { subTopicName: "", topic: "", status: "active" },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        subTopicName: initialData.subTopicName,
        topic: initialData.topic?._id || initialData.topic,
        status: initialData.status,
      });
    }
  }, [initialData, form]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>{initialData ? "Edit Sub-Topic" : "Add New Sub-Topic"}</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="topic" render={({ field }) => ( <FormItem><FormLabel>Parent Topic</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder={isLoadingTopics ? "Loading topics..." : "Select a topic"} /></SelectTrigger></FormControl><SelectContent>{topics?.map(t => <SelectItem key={t.id} value={t.id}>{t.topicName}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
            <FormField control={form.control} name="subTopicName" render={({ field }) => ( <FormItem><FormLabel>Sub-Topic Name</FormLabel><FormControl><Input placeholder="Enter sub-topic name" {...field} /></FormControl><FormMessage /></FormItem>)}/>
            <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setLocation('/sub-topics')}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : "Save"}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}