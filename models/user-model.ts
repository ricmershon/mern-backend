import mongoose, { Document, Schema } from "mongoose";
import validator from "validator";

import { PlaceInterface } from "./place-model";

export interface UserInterface extends Document {
    name: string;
    email: string;
    password: string;
    image: string;
    places: Array<PlaceInterface>;
} 

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
    password: { type: String, required: true, minLength: 6 },
    image: { type: String, required: true },
    places: [{ type: Schema.Types.ObjectId, required: true, ref: 'Place' }]
});

export const User = mongoose.model<UserInterface>('User', userSchema);