import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  url: string;
  image: string;
  videoLink?: string;
  redirectUrl: string;
}

const NotificationSchema = new Schema<INotification>({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  videoLink: {
    type: String,
  },
  redirectUrl: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Notification = model<INotification>('Notification', NotificationSchema);

export default Notification;