import mongoose, { Schema } from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 6, maxLength: 16 },
    imageUrl: { type: String, required: true },
    places: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

export const User = mongoose.model('User', userSchema);