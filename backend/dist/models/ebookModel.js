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
const ebookSchema = new mongoose_1.Schema({
    // All fields from the book schema...
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    shortDescription: { type: String, trim: true },
    fullDescription: { type: String, trim: true },
    edition: { type: String, trim: true },
    publisher: { type: String, trim: true },
    pages: { type: Number },
    samplePdf: { type: String },
    bookPdf: { type: String }, // ✨ Added the new field
    language: { type: String, required: true },
    mainCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MainCategory', required: true },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
    videoLink: { type: String, trim: true },
    newPrice: { type: Number, required: true },
    oldPrice: { type: Number },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    image1: { type: String },
    image2: { type: String },
    image3: { type: String },
    image4: { type: String },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});
exports.default = mongoose_1.default.model('Ebook', ebookSchema);
