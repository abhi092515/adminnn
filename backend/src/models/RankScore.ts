import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRankScore extends Document {
  userId: string;
  courseId: Types.ObjectId;
  rank_score: number;
  level_score: number;
  level: string;
  createdAt: Date;
  updatedAt: Date;
}

const RankScoreSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      trim: true,
    },    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    rank_score: {
      type: Number,
      required: [true, 'Rank score is required'],
      min: [0, 'Rank score cannot be negative'],
      max: [100, 'Rank score cannot exceed 100'],
    },
    level_score: {
      type: Number,
      required: [true, 'Level score is required'],
      min: [0, 'Level score cannot be negative'],
      max: [100, 'Level score cannot exceed 100'],
    },
    level: {
      type: String,
      required: [true, 'Level is required'],
      enum: ['Beginner', 'Medium', 'Advanced', 'Pro'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient queries
RankScoreSchema.index({ userId: 1, courseId: 1 });
RankScoreSchema.index({ rank_score: -1 }); // For finding max rank scores

export default mongoose.model<IRankScore>('RankScore', RankScoreSchema);
