import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';

import { AuthRequest } from '../middleware/check-auth.ts';
import { HttpError } from "../models/http-error.ts";
import { getCoordsForAddress } from '../utilities/location.ts';
import { Place } from '../models/place-model.ts';
import { User } from '../models/user-model.ts';

export const getPlaceById = async (req: Request, res: Response, next: NextFunction) => {
    const placeId = req.params.pid;
    console.log(`>>> GET request for place: ${placeId}`);

    let place;
    try {
        place = await Place.findById(placeId);
        if (!place) {
            return next(new HttpError(`No place found for: ${placeId}`, 404));
        }
    } catch (error) {
        return next(new HttpError(`Error getting place: ${error}`, 500));
    }
    
    res.json({ place: place.toObject({ getters: true }) });
}

export const getPlacesByUserId = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.uid;
    console.log(`>>> GET request for user places: ${userId}`);

    let places;
    try {
        places = await Place.find({ creator: userId });
        if (!places || places.length === 0) {
            return next(new HttpError(`No user places found for: ${userId}`, 404));
        }
    } catch(error) {
        return next(new HttpError(`Error getting places: ${error}`, 500));
    }

    res.json({ places: places.map((place) => place.toObject({ getters: true })) });
}

export const createPlace = async (req: Request, res: Response, next: NextFunction) => {
    console.log(`>>> POST request for create place`);
    
    const { title, description, address, creator } = req.body;

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(new Error(<string>error));
    }

    const newPlace = new Place ({
        title: title,
        description: description,
        image: req.file!.path,
        address: address,
        location: coordinates,
        creator: creator
    });

    let user;
    try {
        user = await User.findById(creator);
        if (!user) {
            return next(new HttpError(`No user found for: ${creator}`, 404));
        }
    } catch (error) {
        return next(new HttpError(`Error getting user: ${creator}`, 500))
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await newPlace.save({ session: session });
        user.places.push(newPlace)
        await user.save({ session: session });
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        return next(new HttpError(`Error creating place: ${error}`, 500));
    }

    res.status(201).json({ place: newPlace.toObject({ getters: true }) });
}

export const updatePlaceById = async (req: Request, res: Response, next: NextFunction) => {
    const placeId = req.params.pid;
    console.log(`>>> PATCH request for place: ${placeId}`);
    
    const { title, description } = req.body;

    let place;
    try {
        place = await Place.findById(placeId);
        if (!place) {
            return next (new HttpError(`Place not found: ${placeId}`, 404))
        }
    } catch (error) {
        return next(new HttpError(`Error finding place: ${error}`, 500));
    }

    if (place.creator.toString() !== (req as AuthRequest).userData.userId) {
        return next(new HttpError(`Not authorized to update place: ${placeId}`, 401));
    }

    try {
        place = await Place.updateOne(
            { _id: placeId },
            { title: title, description: description },
            { new: true }
        );
    } catch(error) {
        return next(new HttpError(`Error updating place: ${error}`, 500));
    }

    res.status(200).json({ place: placeId });
}

export const deletePlaceById = async (req: Request, res: Response, next: NextFunction) => {
    const placeId = req.params.pid;
    console.log(`>>> DELETE request for place: ${placeId}`);

    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
        if (!place) {
            return next (new HttpError(`Place not found: ${placeId}`, 404))
        }
    } catch (error) {
        return next(new HttpError(`Error finding place: ${error}`, 500));
    }

    if (place.creator._id.toString() !== (req as AuthRequest).userData.userId) {
        return next(new HttpError(`Not authorized to delete place: ${placeId}`, 401));
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const updatedUser = await User.updateOne(
            { _id: place.creator.id },
            { $pull: { places: placeId } },
            { session: session }
        );
        if (updatedUser.modifiedCount !== 1) {
            return next(new HttpError(`Error updating user: ${place.creator.id}`, 500));
        }

        const deletedPlace = await Place.findByIdAndDelete(placeId).session(session);
        if (!deletedPlace) {
            return next(new HttpError(`Error deleting place: ${placeId}`, 500));
        }

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        console.log(error);
        return next(new HttpError(`Error deleting place: ${error}`, 500));
    }

    fs.unlink(place.image, (error) => {
        console.log('Error deleting image file', error)
    });

    res.status(200).json({ message: 'Place deleted' });
}