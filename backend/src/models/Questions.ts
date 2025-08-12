import mongoose, { Schema, Document, Types } from 'mongoose';


// function transformSubdocument(doc: any, ret: any) {
//   ret.id = ret._id.toString();
//   delete ret?._id;
//   delete ret?.__v;
// }

// --- Demo Options ---
export interface IOptions {
    id?: string; // Transformed output
    en?: string;
    hi?: string;
    be?: string;
    gu?: string
}



export interface IQuestion extends Document {
    id: string; // This will be the string version of _id
    status: 'active' | 'inactive';
    priority: number;

    mainCategory: Types.ObjectId;
    category: Types.ObjectId;
    sectionId: Types.ObjectId;
    topicId: Types.ObjectId;
    subTopicId: Types.ObjectId;

    quesType: string;
    answerType: string;
    options?: IOptions[];
    comprehension?: Map<string, string>;
    question: Map<string, string>;
    questionImage?: Map<string, string>;
    description?: Map<string, string>;
    answer: Map<string, string>;
    solution: Map<string, string>;
    customerId?: string;
    difficultyLevel: number;
    marks: number;
    isVerified: boolean;
    quesStatus?: string;
    reviewerId?: Types.ObjectId;
    addedBy?: Types.ObjectId;
    verifiedBy?: Types.ObjectId;
    reviewedDate?: Date; // ISO date string
    parentQuestionId?: string;
    compQuesId?: string;
    questionView?: string;

    createdAt: Date;
    updatedAt: Date;
}


const QuestionSchema: Schema = new Schema<IQuestion>({

    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    priority: { type: Number, default: 0 },

    mainCategory: { type: Schema.Types.ObjectId, ref: 'MainCategory', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    subTopicId: { type: Schema.Types.ObjectId, required: false },

    isVerified: { type: Boolean, default: false },

    comprehension: { type: Map, of: String, required: false },
    question: { type: Map, of: String, required: true },
    questionImage: { type: Map, of: String, required: false },
    description: { type: Map, of: String, required: false },
    answer: { type: Map, of: String, required: true },
    solution: { type: Map, of: String, required: true },
    options: {type: [{ type: Map, of: String, required: false}], default: [] },

    customerId: { type: String, trim: true },
    difficultyLevel: { type: Number, default: 0, min: 0 },
    marks: { type: Number, default: 0, min: 0 },
    quesStatus: { type: String, trim: true },
    reviewerId: { type: String, trim: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false},
    reviewedDate: { type: Date, trim: true }, // ISO date string
    parentQuestionId: { type: String, trim: true },
    compQuesId: { type: String, required: false },
    questionView: { type: String, required: false },

}, {
    timestamps: true,
    // Use `toJSON` to define the output format for API responses (e.g., res.json())
    toJSON: {
        virtuals: true, // Ensure virtuals are included if you add any later
        transform: function (doc, ret) {
            ret.id = ret._id?.toString(); // Create an 'id' property from the '_id'
            delete ret._id;
            delete ret.__v;
        }
    },
    // Use `toObject` for other conversions, like console.log(doc.toObject())
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id?.toString();
            delete ret._id;
            delete ret.__v;
        }
    }
});

QuestionSchema.index({ mainCategory: 1, category: 1 });
QuestionSchema.index({ status: 1 });

const Question = mongoose.model<IQuestion>('Question', QuestionSchema);

export default Question;