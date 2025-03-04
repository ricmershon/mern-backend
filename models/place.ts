import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const placeSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    address: { type: String, required: true },
    location: { 
        lat: { type: Number, required: true },
        lng: { type: Number, required: true}
    },
    creator: { type: Types.ObjectId, required: true, ref: 'User' },
});

type PlaceType = InferSchemaType<typeof placeSchema>;

export const Place = mongoose.model<PlaceType>('Place', placeSchema);