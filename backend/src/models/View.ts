// src/models/View.ts
import { Document, Schema, model, Types, Model } from 'mongoose';

export interface IView extends Document {
  id: string;
  classId: Types.ObjectId;
  userId?: Types.ObjectId;
  sessionId?: string;
  viewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IViewMethods {
  isRecent(): boolean;
  isAuthenticated(): boolean;
}

export interface IViewStatics {
  findByUserOrSession(userId?: Types.ObjectId, sessionId?: string): Promise<IView[]>;
  hasViewed(classId: Types.ObjectId, userId?: Types.ObjectId, sessionId?: string): Promise<boolean>;
}

export type IViewModel = Model<IView, {}, IViewMethods> & IViewStatics;

const viewSchema = new Schema<IView, IViewModel, IViewMethods>({
  classId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true,
    index: true
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: false // Can be null for anonymous users
  },  sessionId: { 
    type: String,
    required: false // For anonymous users or additional tracking
  },  viewedAt: { 
    type: Date, 
    default: Date.now 
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes for performance
viewSchema.index({ classId: 1, viewedAt: -1 }); // Most common query
viewSchema.index({ userId: 1, viewedAt: -1 }); // User history
viewSchema.index({ sessionId: 1, viewedAt: -1 }); // Anonymous user tracking
viewSchema.index({ viewedAt: -1 }); // Recent views, trending
viewSchema.index({ classId: 1, userId: 1 }); // Check if user viewed specific class
viewSchema.index({ classId: 1, sessionId: 1 }); // Check if session viewed specific class

// Compound index for unique view detection
viewSchema.index({ 
  classId: 1, 
  userId: 1, 
  sessionId: 1 
}, { 
  sparse: true // Only index documents that have these fields
});

// Virtual for checking if view is recent (within last hour)
viewSchema.virtual('isRecent').get(function(this: IView) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.viewedAt > oneHourAgo;
});

// Instance method to check if view is from authenticated user
viewSchema.methods.isAuthenticated = function(this: IView): boolean {
  return !!this.userId;
};

// Static method to find views by user or session
viewSchema.statics.findByUserOrSession = function(
  userId?: Types.ObjectId, 
  sessionId?: string
): Promise<IView[]> {
  const query: any = {};
  if (userId) {
    query.userId = userId;
  } else if (sessionId) {
    query.sessionId = sessionId;
  } else {
    return this.find({ _id: null }); // Return empty result
  }
  
  return this.find(query).sort({ viewedAt: -1 });
};

// Static method to check if class was viewed by user/session
viewSchema.statics.hasViewed = function(
  classId: Types.ObjectId, 
  userId?: Types.ObjectId, 
  sessionId?: string
): Promise<boolean> {
  const orConditions: any[] = [];
  
  if (userId) {
    orConditions.push({ userId });
  }
  if (sessionId) {
    orConditions.push({ sessionId });
  }
  
  if (orConditions.length === 0) {
    return Promise.resolve(false);
  }
  
  return this.exists({
    classId,
    $or: orConditions
  }).then(result => !!result);
};

const View = model<IView, IViewModel>('View', viewSchema) as IViewModel;

export default View;
