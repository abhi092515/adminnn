// /types/pdf.ts

// Represents the nested object structure when fetching a PDF
export interface PopulatedField {
  id: string;
  name: string;
}

// Corresponds to the main PDF data from the backend
export interface PdfData {
  id: string;
  title: string;
  description: string;
  link?: string;
  teacherName: string;
  priority: number;
  status: 'active' | 'inactive' | 'draft';
  isChat: boolean;
  isFree: boolean;
  isLive: boolean;
  mainCategory: PopulatedField;
  category: PopulatedField;
  section: PopulatedField;
  topic: PopulatedField;
  image?: string; // URL of the uploaded image
  uploadPdf?: string; // URL of the uploaded PDF
  courseBanner?: string;
}

// For dropdown options
export interface SelectOption {
  id: string;
  name: string;
}

export interface MainCategoryOption extends SelectOption {}
export interface CategoryOption extends SelectOption {}
export interface SectionOption extends SelectOption {}
export interface TopicOption extends SelectOption {}