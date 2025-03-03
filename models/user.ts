import mongoose, { Schema } from "mongoose";
import validator from "validator";

const userSchema = new Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: validateEmail,
    },
    password: { type: String, required: true, minLength: 6, maxLength: 16 },
    imageUrl: { type: String, required: true },
    places: { type: String, required: true }
});

export const User = mongoose.model('User', userSchema);

async function validateEmail(email: string) {
    if (!validator.isEmail(email)) {
        throw new Error('Invalid email address');
    }
    const user = await User.findOne({ email });
    if (user) {
        throw new Error('User with this email already registered')
    }
}