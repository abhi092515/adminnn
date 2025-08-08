"use client";

import { SubscriptionForm } from "@/components/forms/SubscriptionForm";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useRoute, useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function EditSubscriptionPage() {
    const [match, params] = useRoute("/subscriptions/edit/:id");
    const id = params?.id;
    const [_, setLocation] = useLocation();
    
    const { getSubscriptionById, updateSubscription } = useSubscriptions();
    const { data: initialData, isLoading: isLoadingData } = getSubscriptionById(id);
    const isUpdating = updateSubscription.isPending;

    const handleSubmit = (values: any) => {
        if (!id) return;
        updateSubscription.mutate({ id, data: values }, {
            onSuccess: () => {
                setLocation('/subscriptions');
            },
        });
    };

    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-4 text-muted-foreground">Loading Subscription...</span>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl font-bold mb-6">Edit Subscription</h1>
            {/* ✅ CRITICAL FIX: Add the key prop here */}
            <SubscriptionForm 
                key={initialData?._id} 
                onSubmit={handleSubmit} 
                initialData={initialData}
                isPending={isUpdating} 
            />
        </div>
    );
}