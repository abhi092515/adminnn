import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IInstruction extends Document {
    series?: Types.ObjectId;
    generalInstructionEnglish?: string;
    specificInstructionEnglish?: string;
    generalInstructionHindi?: string;
    specificInstructionHindi?: string;
    status: 'active' | 'inactive';
}

const instructionSchema: Schema<IInstruction> = new Schema({
    series: {
        type: Schema.Types.ObjectId,
        ref: 'Series',
    },
    // ✅ The old 'instruction' field is removed and replaced with these:
    generalInstructionEnglish: { type: String, trim: true },
    specificInstructionEnglish: { type: String, trim: true },
    generalInstructionHindi: { type: String, trim: true },
    specificInstructionHindi: { type: String, trim: true },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, { timestamps: true });

export default mongoose.model<IInstruction>('Instruction', instructionSchema);