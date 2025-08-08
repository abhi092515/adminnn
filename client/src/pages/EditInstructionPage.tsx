"use client";

import { InstructionForm } from "@/components/forms/InstructionForm";
import { useInstructions } from "@/hooks/useInstructions";
import { useLocation, useRoute } from "wouter";
import { Loader2 } from "lucide-react";

export default function EditInstructionPage() {
    const [_, params] = useRoute("/instructions/edit/:id");
    const id = params?.id;
    const [__, setLocation] = useLocation();

    const { getInstructionById, updateInstruction } = useInstructions();
    const { data: initialData, isLoading } = getInstructionById(id);
    
    const handleSubmit = (values: any) => {
        if (!id) return;
        updateInstruction.mutate({ id, data: values }, {
            onSuccess: () => setLocation('/instructions'),
        });
    };
    
    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Instruction</h1>
            <InstructionForm 
                initialData={initialData}
                onSubmit={handleSubmit}
                isPending={updateInstruction.isPending}
            />
        </div>
    );
}