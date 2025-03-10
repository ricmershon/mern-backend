import mongoose, { Document, Schema } from "mongoose";

import { UserInterface } from "./user-model";

export interface PlaceInterface extends Document {
    title: string;
    description: string;
    imageUrl: string;
    address: string;
    location: {
        lat: number,
        lng: number
    },
    creator: UserInterface
}

const placeSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    address: { type: String, required: true },
    location: { 
        lat: { type: Number, required: true },
        lng: { type: Number, required: true}
    },
    creator: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
});

export const Place = mongoose.model<PlaceInterface>('Place', placeSchema);