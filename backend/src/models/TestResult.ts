// src/models/TestResult.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface ITestResult extends Document {
  seriesId: Types.ObjectId;
  userId: string; // PHP service user ID (stored as string instead of ObjectId)
  courseId: Types.ObjectId;
  accuracy: number;
  timeSpent: number; 
  totalTime: number; 
  questionsAttempted: number;
  totalQuestions: number;
  score: number;
}

const testResultSchema = new Schema<ITestResult>(
  {
    seriesId: { 
      type: Schema.Types.ObjectId, 
      required: true,
      index: true
    },    userId: { 
      type: String, 
      required: true,
      index: true
    },
    courseId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Course', 
      required: true,
      index: true
    },
    accuracy: { 
      type: Number, 
      required: true,
      min: [0, 'Accuracy cannot be negative'],
      max: [100, 'Accuracy cannot exceed 100']
    },
    timeSpent: { 
      type: Number, 
      required: true,
      min: [0, 'Time spent cannot be negative']
    },
    totalTime: { 
      type: Number, 
      required: true,
      min: [0, 'Total time cannot be negative']
    },
    questionsAttempted: { 
      type: Number, 
      required: true,
      min: [0, 'Questions attempted cannot be negative']
    },
    totalQuestions: { 
      type: Number, 
      required: true,
      min: [0, 'Total questions cannot be negative']
    },
    score: { 
      type: Number, 
      required: true,
      min: [0, 'Score cannot be negative']
    }
  },
  {
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
  }
);

testResultSchema.index({ seriesId: 1, userId: 1, courseId: 1 }, { unique: true });

testResultSchema.index({ userId: 1, createdAt: -1 }); // For user's test history
testResultSchema.index({ courseId: 1, createdAt: -1 }); // For course-related test results

const TestResult = model<ITestResult>('TestResult', testResultSchema);
export default TestResult;