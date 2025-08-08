// src/models/seoUrl.model.ts

import { model, Schema, Document } from 'mongoose';

// Interface for TypeScript type-checking (no changes here)
export interface ISeoUrl extends Document {
  page_url: string;
  page_title: string;
  description: string;
  seo_keywords: string[];
  no_index: boolean;
  no_follow: boolean;
  canonical_url?: string;
  error_code?: number;
  redirection_url?: string;
  priority?: number;
  isActive: boolean;
  customer_id?: Schema.Types.ObjectId; // Changed to optional
}

const SeoUrlSchema: Schema = new Schema(
  {
    // ... other fields are unchanged ...
    page_url: { type: String, required: true, trim: true },
    page_title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    seo_keywords: { type: [String], default: [] },
    no_index: { type: Boolean, default: false },
    no_follow: { type: Boolean, default: false },
    canonical_url: { type: String, default: '' },
    error_code: { type: Number, default: null },
    redirection_url: { type: String, default: '' },
    priority: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    
    // THE ONLY CHANGE IS HERE: `required` is removed.
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: 'Customer', // Assumes you have a 'Customer' model
      // required: true, // This line is now removed or commented out
    },
  },
  {
    timestamps: true,
  }
);

// This index will now enforce uniqueness for documents that HAVE a customer_id.
// It will allow multiple documents where customer_id is null.
SeoUrlSchema.index({ customer_id: 1, page_url: 1 }, { unique: true, sparse: true });

export const SeoUrl = model<ISeoUrl>('SeoUrl', SeoUrlSchema);