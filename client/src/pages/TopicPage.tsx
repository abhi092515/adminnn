import { useState } from "react";
// 1. FIX: Added 'Folder' to the import list
import { Plus, Edit, Trash2, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TopicModal } from "@/components/ui/topic-modal";
import { useTopics } from "@/hooks/use-topics";
import { Skeleton } from "@/components/ui/skeleton";
import { type Topic, type InsertTopic } from "@/hooks/use-topics";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TopicPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<Topic | null>(null);

  const {
    topics,
    isLoading,
    error,
    createTopic,
    updateTopic,
    deleteTopic,
    isCreating,
    isUpdating,
    isDeleting,
  } = useTopics();

  const handleAddTopic = () => {
    setEditingTopic(null);
    setIsModalOpen(true);
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setIsModalOpen(true);
  };

  const handleDeleteTopic = (topic: Topic) => {
    setDeletingTopic(topic);
  };

  const confirmDelete = () => {
    if (deletingTopic) {
      deleteTopic.mutate(deletingTopic.id);
      setDeletingTopic(null);
    }
  };

  const handleModalSubmit = (data: InsertTopic) => {
    if (editingTopic) {
      updateTopic.mutate({ id: editingTopic.id, data });
    } else {
      createTopic.mutate(data);
    }
    setIsModalOpen(false);
    setEditingTopic(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <h3 className="text-lg font-medium mb-2">Failed to load topics</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All Topics</h1>
        <Button onClick={handleAddTopic} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Topic
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {topics?.map((topic) => (
          // 2. IMPROVEMENT: Added flexbox classes for consistent card height
          <Card key={topic.id} className="border border-gray-200 shadow-sm flex flex-col">
            <CardContent className="p-4 flex-grow flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-sm flex-1 pr-2">{topic.topicName}</h3>
                <Button
                  variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                  onClick={() => handleDeleteTopic(topic)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              
              {topic.section?.sectionName && (
                <Badge variant="outline" className="mb-3 w-fit inline-flex items-center">
                  <Folder className="h-3 w-3 mr-1.5 flex-shrink-0" />
                  {topic.section.sectionName}
                </Badge>
              )}

              {/* This div pushes the content below it to the bottom of the card */}
              <div className="mt-auto flex items-center justify-between pt-2">
                <Badge
                  variant={topic.status === "active" ? "default" : "secondary"}
                  className={
                    topic.status === "active"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  <div className={`w-2 h-2 rounded-full mr-1.5 ${
                    topic.status === "active" ? "bg-green-400" : "bg-red-400"
                  }`} />
                  {topic.status === "active" ? "Active" : "Inactive"}
                </Badge>
                <Button
                  variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 h-auto"
                  onClick={() => handleEditTopic(topic)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {topics && topics.length === 0 && !isLoading && (
        <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No topics yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first topic.</p>
            <Button onClick={handleAddTopic}><Plus className="h-4 w-4 mr-2" />Add New Topic</Button>
        </div>
      )}

      <TopicModal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTopic(null); }}
        onSubmit={handleModalSubmit}
        topic={editingTopic}
        isLoading={isCreating || isUpdating}
      />

      <AlertDialog open={!!deletingTopic} onOpenChange={() => setDeletingTopic(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTopic?.topicName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}