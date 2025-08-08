"use client";

import { useQuery, useMutation } from '@tanstack/react-query';
import { getNotifications, deleteNotification, Notification } from '@/lib/api/notifications';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { PlusCircle, Trash2, Edit, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function InAppNotificationPage() {
  const { data: notifications, isLoading, error } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      toast.success("Notification deleted successfully!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading notifications...</div>;
  if (error) return <div className="text-red-600"><AlertCircle className="inline-block mr-2" />{error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">In-App Notifications</h2>
        <Link href="/in-app-notification/new">
          <Button><PlusCircle className="mr-2 h-4 w-4" />Create Notification</Button>
        </Link>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Scheduled On</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications?.map((notification) => (
              <TableRow key={notification._id}>
                <TableCell>
                  <img src={notification.image} alt={notification.title} className="h-12 w-20 object-cover rounded-md bg-gray-100" />
                </TableCell>
                <TableCell className="font-medium">{notification.title}</TableCell>
                <TableCell>
                  {/* Display scheduledAt if it exists, otherwise fall back to createdAt */}
                  {new Date(notification.scheduledAt || notification.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link href={`/in-app-notification/edit/${notification._id}`}>
                      <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                    </Link>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(notification._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}