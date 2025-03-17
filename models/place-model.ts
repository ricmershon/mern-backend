import mongoose, { Document, Schema, Types } from "mongoose";

export interface PlaceInterface extends Document {
    title: string;
    description: string;
    image: string;
    address: string;
    location: {
        lat: number,
        lng: number
    },
    creator: Types.ObjectId
}

const placeSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    address: { type: String, required: true },
    location: { 
        lat: { type: Number, required: true },
        lng: { type: Number, required: true}
    },
    creator: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
});

export const Place = mongoose.model<PlaceInterface>('Place', placeSchema);