import { queryClient } from "@/lib/queryClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5099/api';

// Define the Notification type
export interface Notification {
  _id: string;
  title: string;
  url: string;
  image: string;
  videoLink?: string;
  redirectUrl: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 1. Fetch all notifications
export const getNotifications = async (): Promise<Notification[]> => {
  const response = await fetch(`${API_BASE_URL}/notifications`);
  if (!response.ok) throw new Error("Failed to fetch notifications");
  return response.json();
};

// 2. Fetch a single notification by ID
export const getNotificationById = async (id: string): Promise<Notification> => {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}`);
  if (!response.ok) throw new Error("Notification not found");
  return response.json();
};

// 3. Create a new notification using FormData
export const createNotification = async (data: FormData) => {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    method: 'POST',
    body: data,
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to create notification");
  }
  return response.json();
};

// 4. Update a notification using FormData
export const updateNotification = async ({ id, data }: { id: string; data: FormData }) => {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
    method: 'PUT',
    body: data,
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to update notification");
  }
  return response.json();
};


// 5. Delete a notification
export const deleteNotification = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
    method: 'DELETE',
  });
  if (response.status !== 204) {
    const err = await response.json();
    throw new Error(err.message || "Failed to delete notification");
  }
  // Invalidate the query to refetch the list automatically
  queryClient.invalidateQueries({ queryKey: ['notifications'] });
  return { success: true };
};