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
const bookSchema = new mongoose_1.Schema({
    // ... (your existing schema fields remain the same)
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    shortDescription: { type: String, trim: true },
    fullDescription: { type: String, trim: true },
    edition: { type: String, trim: true },
    publisher: { type: String, trim: true },
    publicationDate: { type: Date },
    language: { type: String, required: true },
    dimensions: { type: String },
    pages: { type: Number },
    image1: { type: String },
    image2: { type: String },
    image3: { type: String },
    image4: { type: String },
    samplePdf: { type: String },
    mainCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MainCategory', required: true },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
    videoLink: { type: String, trim: true },
    oldPrice: { type: Number },
    newPrice: { type: Number, required: true },
    status: {
        type: String,
        enum: ['active', 'inactive', 'out-of-stock'],
        default: 'active',
    },
}, {
    timestamps: true,
    // ✅ ADD THIS PART TO TRANSFORM THE JSON OUTPUT
    toJSON: {
        virtuals: true, // Ensure virtuals are included
        transform: (doc, ret) => {
            ret.id = ret._id; // Rename _id to id
            delete ret._id; // Delete the original _id
            delete ret.__v; // Delete the __v field
        }
    }
});
exports.default = mongoose_1.default.model('Book', bookSchema);
