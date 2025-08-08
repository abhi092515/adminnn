"use strict";
// src/models/seoUrl.model.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoUrl = void 0;
const mongoose_1 = require("mongoose");
const SeoUrlSchema = new mongoose_1.Schema({
    // ... other fields are unchanged ...
    page_url: { type: String, required: true, trim: true },
    page_title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    seo_keywords: { type: [String], default: [] },
    no_index: { type: Boolean, default: false },
    no_follow: { type: Boolean, default: false },
    canonical_url: { type: String, default: '' },
    error_code: { type: Number, default: null },
    redirection_url: { type: String, default: '' },
    priority: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    // THE ONLY CHANGE IS HERE: `required` is removed.
    customer_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Customer', // Assumes you have a 'Customer' model
        // required: true, // This line is now removed or commented out
    },
}, {
    timestamps: true,
});
// This index will now enforce uniqueness for documents that HAVE a customer_id.
// It will allow multiple documents where customer_id is null.
SeoUrlSchema.index({ customer_id: 1, page_url: 1 }, { unique: true, sparse: true });
exports.SeoUrl = (0, mongoose_1.model)('SeoUrl', SeoUrlSchema);
