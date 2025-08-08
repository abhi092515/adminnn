"use client";

import { SeoUrlForm } from "@/components/forms/SeoUrlForm";
import { useSeoUrls } from "@/hooks/useSeoUrls";
import { useLocation } from "wouter";

export default function NewSeoUrlPage() {
    const { createSeoUrl } = useSeoUrls();
    const [_, setLocation] = useLocation();

    const handleSubmit = (values: any) => {
        createSeoUrl.mutate(values, {
            onSuccess: () => setLocation('/seo-urls'),
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <SeoUrlForm onSubmit={handleSubmit} isPending={createSeoUrl.isPending} />
        </div>
    );
}