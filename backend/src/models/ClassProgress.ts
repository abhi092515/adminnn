import { Schema, model, Document, Types } from 'mongoose';

export interface IClassProgress extends Document {
    userId: string;
    classId: string;
    courseId: Types.ObjectId;
    userStartTime: Date;
    userEndTime: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export const classProgressSchema = new Schema<IClassProgress>(
    {
        userId: { type: String, required: true },
        classId: { type: String, required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        userStartTime: { type: Date, required: true },
        userEndTime: { type: Date, required: true },
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

const ClassProgress = model<IClassProgress>('ClassProgress', classProgressSchema);
export default ClassProgress;
