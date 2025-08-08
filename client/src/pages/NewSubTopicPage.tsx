"use client";
import { SubTopicForm } from "@/components/forms/SubTopicForm";
import { useSubTopics } from "@/hooks/use-sub-topics";
import { useLocation } from "wouter";

export default function NewSubTopicPage() {
    const { createSubTopic } = useSubTopics();
    const [_, setLocation] = useLocation();
    const handleSubmit = (data: any) => {
        createSubTopic.mutate(data, {
            onSuccess: () => setLocation('/sub-topics'),
        });
    };
    return <SubTopicForm onSubmit={handleSubmit} isPending={createSubTopic.isPending} />;
}