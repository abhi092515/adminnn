"use client";

import { SubscriptionForm } from "@/components/forms/SubscriptionForm";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useLocation } from "wouter";

export default function NewSubscriptionPage() {
    const { createSubscription } = useSubscriptions();
    // ✅ CHANGED: Use the setLocation function from the wouter hook
    const [_, setLocation] = useLocation();

    const handleSubmit = (values: any) => {
        createSubscription.mutate(values, {
            onSuccess: () => {
                // ✅ CHANGED: Navigate using setLocation instead of router.push
                setLocation('/subscriptions');
            },
        });
    };

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl font-bold mb-6">Create New Subscription</h1>
            <SubscriptionForm 
                onSubmit={handleSubmit} 
                isPending={createSubscription.isPending} 
            />
        </div>
    );
}