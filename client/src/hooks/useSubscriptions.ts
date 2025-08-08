import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:5099/api/subscriptions';

// --- API Functions ---

const fetchApi = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, options);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'An API error occurred');
    }
    return res.json();
};

const fetchSubscriptions = () => fetchApi(API_BASE_URL);
const fetchSubscriptionById = (id: string) => fetchApi(`${API_BASE_URL}/${id}`);
const createSubscription = (data: any) => fetchApi(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
});
const updateSubscription = ({ id, data }: { id: string; data: any }) => fetchApi(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
});
const deleteSubscriptionApi = (id: string) => fetchApi(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
const fetchSubscriptionFormData = () => fetchApi(`${API_BASE_URL}/form-data`);


// --- Custom Hook ---
export function useSubscriptions() {
    const queryClient = useQueryClient();

    const subscriptionsQuery = useQuery({ 
        queryKey: ['subscriptions'], 
        queryFn: () => fetchSubscriptions().then(res => res.data) 
    });
    
    const formDataQuery = useQuery({ 
        queryKey: ['subscriptionFormData'], 
        queryFn: () => fetchSubscriptionFormData().then(res => res.data)
    });

    const getSubscriptionByIdQuery = (id?: string) => useQuery({
        queryKey: ['subscription', id],
        queryFn: () => fetchSubscriptionById(id!).then(res => res.data),
        enabled: !!id,
    });
    
    const createSubscriptionMutation = useMutation({
        mutationFn: createSubscription,
        onSuccess: () => {
            toast.success('Subscription created successfully!');
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });
    
    const updateSubscriptionMutation = useMutation({
        mutationFn: updateSubscription,
        onSuccess: (data, { id }) => {
            toast.success('Subscription updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
            queryClient.invalidateQueries({ queryKey: ['subscription', id] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const deleteSubscriptionMutation = useMutation({
        mutationFn: deleteSubscriptionApi,
        onSuccess: () => {
            toast.success('Subscription deleted successfully!');
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    return {
        subscriptions: subscriptionsQuery.data,
        isLoading: subscriptionsQuery.isLoading,
        formData: formDataQuery.data,
        isLoadingFormData: formDataQuery.isLoading,
        getSubscriptionById: getSubscriptionByIdQuery,
        createSubscription: createSubscriptionMutation,
        updateSubscription: updateSubscriptionMutation,
        deleteSubscription: deleteSubscriptionMutation,
    };
}