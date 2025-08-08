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
/**
 * @schema FacultySchema
 * @description Defines the schema for the Faculty collection in MongoDB.
 */
const FacultySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Faculty name is required.'],
        trim: true,
    },
    experience: {
        type: String,
        required: [true, 'Faculty experience is required.'],
        trim: true,
    },
    reach: {
        type: String,
        required: [true, 'Faculty reach is required.'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Faculty description is required.'],
        trim: true,
    },
    introVideoUrl: {
        type: String,
        trim: true,
    },
}, {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
    // Transformation options for converting the document to JSON or a plain object
    toJSON: {
        virtuals: true, // Ensure virtuals (like 'id') are included
        transform: (doc, ret) => {
            // 'ret' is the plain object representation of the document
            delete ret._id; // Remove the internal _id
            delete ret.__v; // Remove the __v version key
        },
    },
    toObject: {
        virtuals: true, // Ensure virtuals are included
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
        },
    },
});
// Create a virtual 'id' property that gets the string representation of '_id'
FacultySchema.virtual('id').get(function () {
    return this._id.toHexString();
});
/**
 * @model Faculty
 * @description Mongoose model for the 'faculties' collection.
 * The name 'Faculty' is used as the reference ('ref') in other models.
 */
const Faculty = mongoose_1.default.model('Faculty', FacultySchema);
exports.default = Faculty;
