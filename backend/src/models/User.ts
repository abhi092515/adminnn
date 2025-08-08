// src/models/User.ts
import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';


export type UserRole = 'superadmin' | 'admin' | 'data-entry';


export interface IUser extends Document {
    name: string;
    email: string;
    phone?: string;
    password: string;
    city?: string;
    state?: string;
    isActive: boolean;
    profilePicture?: string;
    role: UserRole; 
    createdAt?: Date;
    updatedAt?: Date;
    comparePassword(password: string): Promise<boolean>;

}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        password: { type: String, required: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        isActive: { type: Boolean, default: true },
        profilePicture: { type: String },
        role: {
            type: String,
            enum: ['superadmin', 'admin', 'data-entry'],
            default: 'data-entry',
        },
    },
    {
        timestamps: true,
        // --- ADD THESE SCHEMA OPTIONS HERE ---
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                // 1. Convert _id to string and add as 'id' at the beginning
                ret.id = ret._id.toString();

                // 2. Remove the original _id and __v fields
                delete ret._id;
                delete ret.__v;
                // 3. Remove password from JSON output for security
                delete ret.password;

                return ret;
            },
        },
        toObject: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
                delete ret.password;
                return ret;
            },
        },
        // --- END OF SCHEMA OPTIONS ---
    }
);
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// --- ADD: Method to compare passwords for login ---
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = model<IUser>('User', userSchema);
export default User;
