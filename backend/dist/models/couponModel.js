"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const couponSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed'],
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0,
    },
    usageLimitPerUser: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
    },
    startDate: {
        type: Date,
        required: true,
    },
    expireDate: {
        type: Date,
        required: true,
    },
    applicableOn: [{
            type: mongoose_1.Schema.Types.ObjectId,
            refPath: 'applicableOnModel', // Can refer to different models if needed
        }],
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
// Validator to ensure expireDate is after startDate
couponSchema.path('expireDate').validate(function (value) {
    return this.startDate <= value;
}, 'Expire Date must be on or after the Start Date.');
const Coupon = (0, mongoose_1.model)('Coupon', couponSchema);
exports.default = Coupon;
