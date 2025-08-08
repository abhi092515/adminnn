"use client";
import { useParams } from "wouter";
import { BookForm } from "@/components/forms/book-form";

export default function EditBookPage() {
  const { id } = useParams();
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Book</h1>
      <BookForm bookId={id} />
    </div>
  );
}