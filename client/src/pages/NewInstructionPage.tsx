"use client";

import { InstructionForm } from "@/components/forms/InstructionForm";
import { useInstructions } from "@/hooks/useInstructions";
import { useLocation } from "wouter";

export default function NewInstructionPage() {
    const { createInstruction } = useInstructions();
    const [_, setLocation] = useLocation();

    const handleSubmit = (values: any) => {
        createInstruction.mutate(values, {
            onSuccess: () => setLocation('/instructions'),
        });
    };

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">ADD Instruction</h1>
            <div className="max-w-4xl mx-auto">
                <InstructionForm 
                    onSubmit={handleSubmit} 
                    isPending={createInstruction.isPending} 
                />
            </div>
        </div>
    );
}