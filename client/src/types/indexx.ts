export interface Ebook {
  id: string;
  title: string;
  author: string;
  shortDescription?: string;
  fullDescription?: string;
  edition?: string;
  publisher?: string;
  publicationDate?: string; // Stored as ISO string
  language: string;
  dimensions?: string;
  pages?: number;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  samplePdf?: string;
  bookPdf?: string;
  mainCategory: any; // Use a more specific type if you have one
  category: any;     // Use a more specific type if you have one
  videoLink?: string;
  oldPrice?: number;
  newPrice: number;
  status: 'active' | 'inactive';
} 
export interface Book {
  id: string;
  title: string;
  author: string;
  newPrice: number;
  status: 'active' | 'inactive' | 'out-of-stock';
  shortDescription?: string;
  fullDescription?: string;
  edition?: string;
  publisher?: string;
  publicationDate?: string;
  language?: string;
  dimensions?: string;
  pages?: number;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  samplePdf?: string;
  mainCategory: any;
  category: any;
  videoLink?: string;
  oldPrice?: number;
  [key: string]: any; 
} 

export interface Analytics {
  totalRevenue: string;
  subscriptions: number;
  salesCount: number;
  usersCount: number;
}

export interface Sale {
  id: string;
  amount: number;
  user: {
    name: string;
    email: string;
    avatarUrl: string;
    initials: string;
  };
}
export interface Banner {
  id: string;
  title: string;
  websiteBannerUrl: string;
  mobileBannerUrl: string;
  priority: number;
  isActive: boolean;
} 

export interface Course {
  id: string;
  title: string;
} 

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  discountValue: number;
  usageLimitPerUser: number;
  startDate: string; // Stored as ISO string
  expireDate: string; // Stored as ISO string
  applicableOn: string[]; // Array of course IDs
  isActive: boolean;
}

