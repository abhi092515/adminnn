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
const DemoVideoSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    image: { type: String, required: false, trim: true }
}, {
    _id: false, // Subdocuments get IDs by default, this is explicit.
    // toJSON: { transform: transformSubdocument },
    // toObject: { transform: transformSubdocument }
});
const FAQItemSchema = new mongoose_1.Schema({
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
}, {
    _id: false,
    // toJSON: { transform: transformSubdocument },
    // toObject: { transform: transformSubdocument }
});
const FacultyDetailsSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    designation: { type: String, trim: true },
    bio: { type: String },
    imageUrl: { type: String, trim: true },
    socialLinks: {
        linkedin: { type: String, trim: true },
        twitter: { type: String, trim: true },
        facebook: { type: String, trim: true },
    },
    videoUrl: { type: String, trim: true },
    experience: { type: String, required: true },
    reach: { type: String, required: true },
    description: { type: String, required: true },
}, {
    _id: true,
    // toJSON: { transform: transformSubdocument },
    // toObject: { transform: transformSubdocument }
});
const CourseSchema = new mongoose_1.Schema({
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    priority: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    isLive: { type: Boolean, default: false },
    isRecorded: { type: Boolean, default: false },
    isFree: { type: Boolean, default: false },
    banner: { type: String, default: null, trim: true },
    title: { type: String, required: true, unique: true, trim: true },
    assignHeader: { type: String, required: false },
    description: [{ type: String }],
    mainCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MainCategory', required: true },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
    liveClassesCount: { type: Number, default: 0, min: 0 },
    recordedClassesCount: { type: Number, default: 0, min: 0 }, courseInfo: [{ type: String }],
    demoVideos: [DemoVideoSchema],
    batchInfoPdfUrl: { type: String, trim: true },
    facultyDetails: { type: FacultyDetailsSchema, required: false }, // Explicitly optional
    courseHighlights: [{ type: String }],
    faq: [FAQItemSchema],
    assignedPdfs: {
        type: [{ type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'Pdf' }],
        default: [] // ✅ This prevents the crash
    }, // References to PDF documents
    classes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Class'
        }]
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
CourseSchema.index({ mainCategory: 1, category: 1 });
CourseSchema.index({ status: 1 });
CourseSchema.index({ isFree: 1 });
const Course = mongoose_1.default.model('Course', CourseSchema);
exports.default = Course;
