// src/pages/SectionPage.tsx
import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionModal } from "@/components/ui/section-modal";
import { useSections } from "@/hooks/use-sections";
import { Skeleton } from "@/components/ui/skeleton";
import { type Section, type InsertSection } from "@shared/schema";
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

export default function SectionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [deletingSection, setDeletingSection] = useState<Section | null>(null);

  const {
    sections,
    isLoading,
    error,
    createSection,
    updateSection,
    deleteSection,
    isCreating,
    isUpdating,
    isDeleting,
  } = useSections();

  const handleAddSection = () => {
    setEditingSection(null);
    setIsModalOpen(true);
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setIsModalOpen(true);
  };

  const handleDeleteSection = (section: Section) => {
    setDeletingSection(section);
  };

  const confirmDelete = () => {
    if (deletingSection) {
      deleteSection.mutate(deletingSection.id);
      setDeletingSection(null);
    }
  };

  const handleModalSubmit = (data: InsertSection) => {
    if (editingSection) {
      updateSection.mutate({ id: editingSection.id, data });
    } else {
      createSection.mutate(data);
    }
    setIsModalOpen(false);
    setEditingSection(null);
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
        <h3 className="text-lg font-medium mb-2">Failed to load sections</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All Sections</h1>
        <Button onClick={handleAddSection} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Section
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sections?.map((section) => (
          <Card key={section.id} className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-sm">{section.sectionName}</h3>
                <Button
                  variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteSection(section)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{section.description}</p>
              <div className="flex items-center justify-between">
                <Badge
                  variant={section.status === "active" ? "default" : "secondary"}
                  className={
                    section.status === "active"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  <div className={`w-2 h-2 rounded-full mr-1 ${
                    section.status === "active" ? "bg-green-400" : "bg-red-400"
                  }`} />
                  {section.status === "active" ? "Active" : "Inactive"}
                </Badge>
                <Button
                  variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 h-auto"
                  onClick={() => handleEditSection(section)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sections && sections.length === 0 && !isLoading && (
        <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first section.</p>
            <Button onClick={handleAddSection}><Plus className="h-4 w-4 mr-2" />Add New Section</Button>
        </div>
      )}

      <SectionModal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingSection(null); }}
        onSubmit={handleModalSubmit}
        section={editingSection}
        isLoading={isCreating || isUpdating}
      />

      <AlertDialog open={!!deletingSection} onOpenChange={() => setDeletingSection(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingSection?.sectionName}"? This action cannot be undone.
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