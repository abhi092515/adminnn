"use client";
import { SubTopicForm } from "@/components/forms/SubTopicForm";
import { useSubTopics } from "@/hooks/use-sub-topics";
import { useLocation, useRoute } from "wouter";
import { Loader2 } from "lucide-react";

export default function EditSubTopicPage() {
    const [_, params] = useRoute("/sub-topics/edit/:id");
    const id = params?.id;
    const [__, setLocation] = useLocation();
    const { getSubTopicById, updateSubTopic } = useSubTopics();
    const { data: initialData, isLoading } = getSubTopicById(id);

    const handleSubmit = (data: any) => {
        if (!id) return;
        updateSubTopic.mutate({ id, data }, {
            onSuccess: () => setLocation('/sub-topics'),
        });
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    
    return <SubTopicForm initialData={initialData} onSubmit={handleSubmit} isPending={updateSubTopic.isPending} />;
}