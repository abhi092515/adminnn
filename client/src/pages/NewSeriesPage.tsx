"use client";

import { SeriesForm } from "@/components/forms/SeriesForm";
import { useSeries } from "@/hooks/useSeries"; // You'll need to update this hook
import { useLocation } from "wouter";

export default function NewSeriesPage() {
    const { createSeries } = useSeries(); // createSeries mutation needed in the hook
    const [_, setLocation] = useLocation();

    const handleSubmit = (values: any) => {
        // The form data `values` already matches the new complex model
        createSeries.mutate(values, {
            onSuccess: () => setLocation('/series'),
        });
    };

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">ADD Series</h1>
            <SeriesForm 
                onSubmit={handleSubmit} 
                isPending={createSeries.isPending} 
            />
        </div>
    );
}