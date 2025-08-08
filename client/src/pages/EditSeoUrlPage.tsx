"use client";

import { SeoUrlForm } from "@/components/forms/SeoUrlForm";
import { useSeoUrls } from "@/hooks/useSeoUrls";
import { useLocation, useRoute } from "wouter";
import { Loader2 } from "lucide-react";

export default function EditSeoUrlPage() {
    const [_, params] = useRoute("/seo-urls/edit/:id");
    const id = params?.id;
    const [__, setLocation] = useLocation();

    const { getSeoUrlById, updateSeoUrl } = useSeoUrls();
    const { data: initialData, isLoading } = getSeoUrlById(id);
    
    const handleSubmit = (values: any) => {
        if (!id) return;
        updateSeoUrl.mutate({ id, data: values }, {
            onSuccess: () => setLocation('/seo-urls'),
        });
    };
    
    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* ✅ This key prop is the most important part of the fix */}
            <SeoUrlForm 
                key={initialData?._id}
                initialData={initialData}
                onSubmit={handleSubmit}
                isPending={updateSeoUrl.isPending}
            />
        </div>
    );
}