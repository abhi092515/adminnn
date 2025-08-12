"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const QuestionSchema = new mongoose_1.Schema({
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    priority: { type: Number, default: 0 },
    mainCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MainCategory', required: true },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
    sectionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Section', required: true },
    topicId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', required: true },
    subTopicId: { type: mongoose_1.Schema.Types.ObjectId, required: false },
    isVerified: { type: Boolean, default: false },
    comprehension: { type: Map, of: String, required: false },
    question: { type: Map, of: String, required: true },
    questionImage: { type: Map, of: String, required: false },
    description: { type: Map, of: String, required: false },
    answer: { type: Map, of: String, required: true },
    solution: { type: Map, of: String, required: true },
    options: { type: [{ type: Map, of: String, required: false }], default: [] },
    customerId: { type: String, trim: true },
    difficultyLevel: { type: Number, default: 0, min: 0 },
    marks: { type: Number, default: 0, min: 0 },
    quesStatus: { type: String, trim: true },
    reviewerId: { type: String, trim: true },
    addedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: false },
    verifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: false },
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
            var _a;
            ret.id = (_a = ret._id) === null || _a === void 0 ? void 0 : _a.toString(); // Create an 'id' property from the '_id'
            delete ret._id;
            delete ret.__v;
        }
    },
    // Use `toObject` for other conversions, like console.log(doc.toObject())
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            var _a;
            ret.id = (_a = ret._id) === null || _a === void 0 ? void 0 : _a.toString();
            delete ret._id;
            delete ret.__v;
        }
    }
});
QuestionSchema.index({ mainCategory: 1, category: 1 });
QuestionSchema.index({ status: 1 });
const Question = mongoose_1.default.model('Question', QuestionSchema);
exports.default = Question;
