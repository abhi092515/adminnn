"use client";

import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getNotificationById, updateNotification } from '@/lib/api/notifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useLocation, useRoute } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { AlertCircle } from 'lucide-react';

export default function EditNotificationPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/in-app-notification/edit/:id");
  const id = params?.id || '';

  const { data: notification, isLoading, error } = useQuery({
    queryKey: ['notification', id],
    queryFn: () => getNotificationById(id),
    enabled: !!id,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: updateNotification,
    onSuccess: () => {
      toast.success("Notification updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification', id] });
      setLocation("/in-app-notification");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    mutation.mutate({ id, data: formData });
  };
  
  // Format date for datetime-local input
  const formatDateTimeLocal = (isoString: string | undefined) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600"><AlertCircle className="inline-block mr-2" />{error.message}</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Edit Notification</h2>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow">
        {/* We use defaultValue to pre-fill the form */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={notification?.title} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="url">Notification URL</Label>
          <Input id="url" name="url" type="url" defaultValue={notification?.url} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">New Image (Optional)</Label>
          <Input id="image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          <p className="text-sm text-gray-500">Leave empty to keep the current image.</p>
          <img src={notification?.image} alt="Current" className="h-16 w-auto object-cover rounded-md mt-2" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="videoLink">Video Link (Optional)</Label>
          <Input id="videoLink" name="videoLink" type="url" defaultValue={notification?.videoLink} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="redirectUrl">Redirect URL</Label>
          <Input id="redirectUrl" name="redirectUrl" type="url" defaultValue={notification?.redirectUrl} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduledAt">Schedule On (Optional)</Label>
          <Input id="scheduledAt" name="scheduledAt" type="datetime-local" defaultValue={formatDateTimeLocal(notification?.scheduledAt)} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}