// "use client";

// import { PdfForm } from "@/components/forms/pdf-form";
// import { usePdfs } from "@/hooks/use-pdfs";
// import { useToast } from "@/hooks/use-toast";
// import { useLocation } from "wouter";

// export default function NewCoursePdfPage() {
//   const [_, setLocation] = useLocation();
//   const { toast } = useToast();
//   // Get all mutations from the hook
//   const { createPdfMutation, uploadFileMutation } = usePdfs();

//   const handleCreatePdf = async (data: any) => {
//     try {
//       let imageUrl = "";
//       let pdfUrl = "";

//       // Step 1: Upload files if they exist and get their URLs
//       if (data.image instanceof File) {
//         const uploadedImage = await uploadFileMutation.mutateAsync(data.image);
//         imageUrl = uploadedImage.url;
//       }
//       if (data.uploadPdf instanceof File) {
//         const uploadedPdf = await uploadFileMutation.mutateAsync(data.uploadPdf);
//         pdfUrl = uploadedPdf.url;
//       }

//       // Step 2: Prepare the final JSON payload
//       const payload = {
//         ...data,
//         image: imageUrl,
//         uploadPdf: pdfUrl,
//       };

//       // Step 3: Send the JSON payload to create the PDF record
//       await createPdfMutation.mutateAsync(payload);

//       toast({ title: "PDF Created!", description: "The new PDF has been added." });
//       setLocation("/online-course-pdfs");

//     } catch (error: any) {
//       toast({ title: "Error", description: error.message || "Failed to create PDF.", variant: "destructive" });
//     }
//   };
  
//   // The isLoading state should consider all possible mutations
//   const isLoading = createPdfMutation.isPending || uploadFileMutation.isPending;

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold">Add New Course PDF</h1>
//       <div className="max-w-4xl">
//         <PdfForm 
//           onSubmit={handleCreatePdf}
//           isLoading={isLoading}
//           mode="create" 
//         />
//       </div>
//     </div>
//   );
// } 
// src/pages/new-pdf-form-page.tsx

"use client";

import { PdfForm , type PdfFormData } from "@/components/forms/pdf-form";
import { usePdfs } from "@/hooks/use-pdfs";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function NewCoursePdfPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  // ✅ Get the updated createPdfMutation from the hook
  const { createPdfMutation, uploadFileMutation } = usePdfs();

  // ✅ This function is now much simpler
  // const handleCreatePdf = async (data: any) => {
  //   try {
  //     const formData = new FormData();

  //     // Loop through the form data and append everything to FormData
  //     Object.keys(data).forEach(key => {
  //       // We handle JSON stringified arrays/objects from your Zod schema
  //       if (typeof data[key] === 'object' && !(data[key] instanceof File)) {
  //         formData.append(key, JSON.stringify(data[key]));
  //       } else {
  //         formData.append(key, data[key]);
  //       }
  //     });

  //     // Call the mutation with the single FormData object
  //     await createPdfMutation.mutateAsync(formData);

  //     setLocation("/online-course-pdfs");

  //   } catch (error: any) {
  //     // Error is now handled by the mutation's onError callback
  //     console.error(error);
  //   }
  // };
  // const handleCreatePdf = async (data: any) => {
  //   try {
  //     // 1. Client-side check for the required file
  //     if (!(data.uploadPdf instanceof File)) {
  //       toast({
  //         title: "Required Field Missing",
  //         description: "Please upload a PDF file to continue.",
  //         variant: "destructive",
  //       });
  //       return;
  //     }
  
  //     const payload: any = { ...data }; // Start with all text data from the form
  
  //     // 2. Upload required PDF and add its URL to the payload
  //     const uploadedPdf = await uploadFileMutation.mutateAsync(data.uploadPdf);
  //     payload.uploadPdf = uploadedPdf.url;
  
  //     // 3. Upload optional image ONLY if it exists
  //     if (data.image instanceof File) {
  //       const uploadedImage = await uploadFileMutation.mutateAsync(data.image);
  //       payload.image = uploadedImage.url;
  //     } else {
  //       delete payload.image; // If no image, remove it from the payload
  //     }
  
  //     // 4. Send the final payload to create the PDF record
  //     await createPdfMutation.mutateAsync(payload);
  
  //     toast({ title: "PDF Created!", description: "The new PDF has been added." });
  //     setLocation("/online-course-pdfs");
  
  //   } catch (error: any) {
  //     toast({ title: "Error", description: error.message || "Failed to create PDF.", variant: "destructive" });
  //   }
  // };
  // In src/pages/new-pdf-form-page.tsx

const handleCreatePdf = async (data: PdfFormData) => {
  try {
    const formData = new FormData();

    // ✅ Loop through the data from react-hook-form
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      // Append files, and non-file values directly.
      // FormData handles converting booleans and numbers to strings.
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    // Call the mutation with the single FormData object
    await createPdfMutation.mutateAsync(formData);

    setLocation("/online-course-pdfs");

  } catch (error: any) {
    // The error is now handled by the mutation's onError callback
    console.error("Submission failed:", error);
  }
};
  const isLoading = createPdfMutation.isPending || uploadFileMutation.isPending;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add New Course PDF</h1>
      <div className="max-w-4xl">
        <PdfForm 
          onSubmit={handleCreatePdf}
          isLoading={isLoading}
          mode="create" 
        />
      </div>
    </div>
  );
}