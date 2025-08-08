"use client";

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createNotification } from '@/lib/api/notifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';

export default function NewNotificationPage() {
  const [, setLocation] = useLocation();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      toast.success("Notification created successfully!");
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setLocation("/in-app-notification");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please select an image file.");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append('image', imageFile);

    mutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create New Notification</h2>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="url">Notification URL</Label>
          <Input id="url" name="url" type="url" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">Image</Label>
          <Input id="image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="videoLink">Video Link (Optional)</Label>
          <Input id="videoLink" name="videoLink" type="url" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="redirectUrl">Redirect URL</Label>
          <Input id="redirectUrl" name="redirectUrl" type="url" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduledAt">Schedule On (Optional)</Label>
          <Input id="scheduledAt" name="scheduledAt" type="datetime-local" />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating..." : "Create Notification"}
          </Button>
        </div>
      </form>
    </div>
  );
}