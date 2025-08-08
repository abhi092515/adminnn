import mongoose, { Document, Schema } from 'mongoose';

export interface ISeries extends Document {
    name: string;
    status: 'active' | 'inactive';
}

const seriesSchema: Schema<ISeries> = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, { timestamps: true });

export default mongoose.model<ISeries>('Series', seriesSchema);