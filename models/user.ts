import mongoose, { Schema } from "mongoose";
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
    places: { type: String, required: true }
});

export const User = mongoose.model('User', userSchema);