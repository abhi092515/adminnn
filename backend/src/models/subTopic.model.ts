import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISubTopic extends Document {
    subTopicName: string;
    status: 'active' | 'inactive';
    topic: Types.ObjectId; // Link to the parent Topic
}

const subTopicSchema: Schema<ISubTopic> = new Schema({
    subTopicName: {
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
    topic: {
        type: Schema.Types.ObjectId,
        ref: 'Topic', // This must match your Topic model name
        required: true,
    },
}, { timestamps: true });

export default mongoose.model<ISubTopic>('SubTopic', subTopicSchema);