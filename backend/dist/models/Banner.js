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
const bannerSchema = new mongoose_1.Schema({
    // Banner content (all optional)
    title: {
        type: String,
        maxLength: 100
    },
    description: {
        type: String,
        maxLength: 500
    },
    imageUrl: {
        type: String
    },
    // Optional class reference
    classId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Class',
        default: null
    },
    // Banner management
    isActive: {
        type: Boolean,
        default: true
    }, priority: {
        type: Number,
        required: false,
        min: 1
    },
    // Scheduling (optional)
    startDate: {
        type: Date,
        default: null
    },
    endDate: {
        type: Date,
        default: null
    },
    // Metadata
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
    toObject: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
// Indexes for performance
bannerSchema.index({ isActive: 1, priority: 1 }); // Most common query
bannerSchema.index({ startDate: 1, endDate: 1 }); // Scheduling
bannerSchema.index({ classId: 1 }); // Find banners for specific class
// Ensure unique priority for active banners only
bannerSchema.index({ priority: 1 }, {
    unique: true,
    partialFilterExpression: { isActive: true }
});
// Static method to get active banners
bannerSchema.statics.getActiveBanners = function () {
    const now = new Date();
    return this.find({
        isActive: true,
        $or: [
            { startDate: null, endDate: null },
            { startDate: { $lte: now }, endDate: { $gte: now } },
            { startDate: { $lte: now }, endDate: null },
            { startDate: null, endDate: { $gte: now } }
        ]
    })
        .populate('classId', 'title description teacherName image')
        .sort({ priority: 1 });
};
// Static method to get next priority for new banners
bannerSchema.statics.getNextPriority = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const highest = yield this.findOne({ isActive: true })
            .sort({ priority: -1 })
            .select('priority');
        return highest ? highest.priority + 1 : 1;
    });
};
// Pre-save middleware to auto-assign priority for new banners
bannerSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew && !this.priority) {
            try {
                this.priority = yield this.constructor.getNextPriority();
            }
            catch (error) {
                return next(error);
            }
        }
        next();
    });
});
const Banner = (0, mongoose_1.model)('Banner', bannerSchema);
exports.default = Banner;
