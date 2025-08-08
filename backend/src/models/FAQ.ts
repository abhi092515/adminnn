import { Schema, Document, Types } from 'mongoose';

export interface IFAQItem extends Document {
  question: string;
  answer: string;
}

export const FAQItemSchema = new Schema<IFAQItem>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});
