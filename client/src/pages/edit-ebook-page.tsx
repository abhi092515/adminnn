import { useParams } from "wouter";
import { EbookForm } from "@/components/forms/ebook-form"; // Adjust path if needed

export default function EditEbookPage() {
  const params = useParams();
  const ebookId = params.id;

  return (
    <div className="p-4 md:p-6">
      <EbookForm ebookId={ebookId} />
    </div>
  );
}