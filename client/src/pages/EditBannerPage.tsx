"use client";

import { useParams } from "wouter";
import { BannerForm } from "@/components/forms/BannerForm";

export default function EditBannerPage() {
  const { id } = useParams();
  
  return (
    <div className="p-4 md:p-6">
      <BannerForm bannerId={id} />
    </div>
  );
}