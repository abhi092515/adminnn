import { Schema, Document, Types } from 'mongoose';

export interface IDemoVideo extends Document {
  title: string;
  url: string;
  
}

export const DemoVideoSchema = new Schema<IDemoVideo>({
  title: { type: String, required: true },
  url: { type: String, required: true },
});