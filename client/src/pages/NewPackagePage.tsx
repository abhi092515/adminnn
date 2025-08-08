"use client";

import { PackageForm } from "@/components/forms/PackageForm";
import { usePackages } from "@/hooks/usePackages";
import { useLocation } from "wouter";

export default function NewPackagePage() {
    const { createPackage } = usePackages();
    const [_, setLocation] = useLocation();

    const handleSubmit = (formData: FormData) => {
        createPackage.mutate(formData, {
            onSuccess: () => setLocation('/packages'),
        });
    };

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">ADD Package</h1>
            <div className="max-w-4xl mx-auto">
                <PackageForm 
                    onSubmit={handleSubmit} 
                    isPending={createPackage.isPending} 
                />
            </div>
        </div>
    );
}