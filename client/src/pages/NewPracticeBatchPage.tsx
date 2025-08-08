"use client";

import { PracticeBatchForm } from "@/components/forms/PracticeBatchForm";
import { usePracticeBatches } from "@/hooks/usePracticeBatches";
import { useLocation } from "wouter";

export default function NewPracticeBatchPage() {
    const { createPracticeBatch } = usePracticeBatches();
    const [_, setLocation] = useLocation();

    const handleSubmit = (formData: FormData) => {
        createPracticeBatch.mutate(formData, {
            onSuccess: () => setLocation('/practice-batch'),
        });
    };

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">ADD Batch</h1>
            <div className="max-w-4xl mx-auto">
                <PracticeBatchForm 
                    onSubmit={handleSubmit} 
                    isPending={createPracticeBatch.isPending} 
                />
            </div>
        </div>
    );
}