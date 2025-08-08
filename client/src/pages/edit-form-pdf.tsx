"use client";

import React, { useMemo } from 'react';
import { useLocation, useParams } from "wouter";
import { PdfForm } from "@/components/forms/pdf-form";
import { usePdfs } from "@/hooks/use-pdfs";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from 'lucide-react';

export default function EditCoursePdfPage() {
  const [_, setLocation] = useLocation();
  const params = useParams();
  const pdfId = params.id;
  const { toast } = useToast();
  
  const { 
    getPdfById, 
    updatePdfMutation, 
    uploadFileMutation 
  } = usePdfs();

  const { data: initialData, isLoading: isFetching, isError, error } = getPdfById(pdfId);

  const handleUpdatePdf = async (data: any) => {
    if (!pdfId) return;

    try {
      const payload = { ...data };

      if (data.image instanceof File) {
        const uploadedImage = await uploadFileMutation.mutateAsync(data.image);
        payload.image = uploadedImage.url;
      } else {
        payload.image = initialData?.image || null;
      }

      if (data.uploadPdf instanceof File) {
        const uploadedPdf = await uploadFileMutation.mutateAsync(data.uploadPdf);
        payload.uploadPdf = uploadedPdf.url;
      } else {
        payload.uploadPdf = initialData?.uploadPdf || null;
      }

      await updatePdfMutation.mutateAsync({ id: pdfId, data: payload });

      toast({ title: "PDF Updated!", description: "The PDF details have been saved." });
      setLocation("/online-course-pdfs");

    } catch (error: any) {
      toast({ title: "Error", description: `Failed to update PDF: ${error.message}`, variant: "destructive" });
    }
  };

  if (isFetching) {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  if (isError) {
    return (
        <div className="text-center text-red-500 py-12">
            <h2 className="text-xl font-semibold">Error Loading PDF</h2>
            <p>{error?.message || "Something went wrong."}</p>
        </div>
    );
  }

  const isSubmitting = updatePdfMutation.isPending || uploadFileMutation.isPending;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Course PDF</h1>
      <div className="max-w-6xl">
        <PdfForm 
          onSubmit={handleUpdatePdf}
          initialData={initialData}
          isLoading={isSubmitting}
          mode="edit" 
        />
      </div>
    </div>
  );
}