import mongoose, {  Schema, InferSchemaType, Types } from "mongoose";
import validator from "validator";

const userSchema = new Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: (value: string) => {
            if (!validator.isEmail(value)) {
                console.log('Invalid email address')
                throw new Error('invalid email address')
            }
        },
    },
    password: { type: String, required: true, minLength: 6, maxLength: 16 },
    imageUrl: { type: String, required: true },
    places: [{ type: Types.ObjectId, required: true, ref: 'Place' }]
});

type UserType = InferSchemaType<typeof userSchema>;

export const User = mongoose.model<UserType>('User', userSchema);