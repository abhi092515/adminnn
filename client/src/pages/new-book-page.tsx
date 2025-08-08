"use client";
import { BookForm } from "@/components/forms/book-form";

export default function NewBookPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Book</h1>
      <BookForm />
    </div>
  );
}