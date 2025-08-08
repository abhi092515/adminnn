"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// --- SCHEMA DEFINITION ---
const bannerSchema = new mongoose_1.Schema({
    websiteBannerUrl: {
        type: String,
        required: true,
    },
    mobileBannerUrl: {
        type: String,
        required: true,
    },
    redirectUrl: {
        type: String,
        required: true,
    },
    priority: {
        type: Number,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        },
    },
});
// Ensures priority is unique ONLY for banners that are currently active
bannerSchema.index({ priority: 1 }, {
    unique: true,
    partialFilterExpression: { isActive: true }
});
// --- STATIC METHODS ---
// Find the highest current priority and return the next number in sequence
bannerSchema.statics.getNextPriority = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const highestPriorityBanner = yield this.findOne({}).sort({ priority: -1 });
        return highestPriorityBanner ? highestPriorityBanner.priority + 1 : 1;
    });
};
// --- MIDDLEWARE ---
// This hook runs BEFORE validation to auto-assign a priority to new banners
bannerSchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew && this.priority == null) {
            this.priority = yield this.constructor.getNextPriority();
        }
        next();
    });
});
const BannerV2 = (0, mongoose_1.model)('BannerV2', bannerSchema);
exports.default = BannerV2;
