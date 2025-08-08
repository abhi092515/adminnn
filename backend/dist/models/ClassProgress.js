"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classProgressSchema = void 0;
const mongoose_1 = require("mongoose");
exports.classProgressSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    classId: { type: String, required: true },
    courseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true },
    userStartTime: { type: Date, required: true },
    userEndTime: { type: Date, required: true },
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
const ClassProgress = (0, mongoose_1.model)('ClassProgress', exports.classProgressSchema);
exports.default = ClassProgress;
