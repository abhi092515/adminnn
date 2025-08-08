"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
function transformSubdocument(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
}
var DemoVideoSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
}, {
    _id: true, // Subdocuments get IDs by default, this is explicit.
    toJSON: { transform: transformSubdocument },
    toObject: { transform: transformSubdocument }
});
var FAQItemSchema = new mongoose_1.Schema({
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
}, {
    _id: true,
    toJSON: { transform: transformSubdocument },
    toObject: { transform: transformSubdocument }
});
var FacultyDetailsSchema = new mongoose_1.Schema({
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
    toJSON: { transform: transformSubdocument },
    toObject: { transform: transformSubdocument }
});
var CourseSchema = new mongoose_1.Schema({
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    priority: { type: Number, default: 0 },
    isLive: { type: Boolean, default: false },
    isRecorded: { type: Boolean, default: false },
    isFree: { type: Boolean, default: false },
    banner: { type: String, default: null, trim: true },
    title: { type: String, required: true, unique: true, trim: true },
    assignHeader: { type: String, required: true, trim: true },
    description: [{ type: String }],
    mainCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MainCategory', required: true },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
    liveClassesCount: { type: Number, default: 0, min: 0 },
    recordedClassesCount: { type: Number, default: 0, min: 0 },
    courseInfo: [{ type: String }],
    demoVideos: [DemoVideoSchema],
    batchInfoPdfUrl: { type: String, trim: true },
    facultyDetails: { type: FacultyDetailsSchema, required: false }, // Explicitly optional
    courseHighlights: [{ type: String }],
    faq: [FAQItemSchema],
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
            ret.id = ret._id.toString(); // Create an 'id' property from the '_id'
            delete ret._id;
            delete ret.__v;
        }
    },
    // Use `toObject` for other conversions, like console.log(doc.toObject())
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        }
    }
});
CourseSchema.index({ mainCategory: 1, category: 1 });
CourseSchema.index({ status: 1 });
CourseSchema.index({ isFree: 1 });
var Course = mongoose_1.default.model('Course', CourseSchema);
exports.default = Course;
