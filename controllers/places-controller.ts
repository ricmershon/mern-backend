import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';

import { AuthRequest } from '../middleware/check-auth.ts';
import { HttpError } from "../models/http-error.ts";
import { getCoordsForAddress } from '../utilities/location.ts';
import { Place } from '../models/place-model.ts';
import { User } from '../models/user-model.ts';

/**
 * @returns array of place objects for all users.
 */
export const getPlaceById = async (req: Request, res: Response, next: NextFunction) => {
    const placeId = req.params.pid;
    console.log('>>> getPlaceById:');

    let place;
    try {
        place = await Place.findById(placeId);
        if (!place) {
            return next(new HttpError('Place not found.', 404));
        }
    } catch (error) {
        console.log(`>>> Error finding place: ${error}.`);
        return next(new HttpError(`Error finding place: ${error}.`, 500));
    }
    
    res.json({ place: place.toObject({ getters: true }) });
}

/**
 * @returns array of place objects by user.
 */
export const getPlacesByUserId = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.uid;
    console.log('>>> getPlacesByUserId:');

    let places;
    try {
        places = await Place.find({ creator: userId });
        if (!places || places.length === 0) {
            return next(new HttpError('No user places found.', 404));
        }
    } catch(error) {
        console.log(`>>> Error finding places: ${error}.`);
        return next(new HttpError(`Error finding places: ${error}.`, 500));
    }

    res.json({ places: places.map((place) => place.toObject({ getters: true })) });
}

/**
 * Creates a new place.
 * @returns place object.
 */
export const createPlace = async (req: Request, res: Response, next: NextFunction) => {
    console.log('>>> createPlace:');
    
    const { title, description, address } = req.body;

    const creator = (req as AuthRequest).userData.userId;

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        console.log(`>>> Error getting place coordinates: ${error}.`);
        return next(new Error(<string>error));
    }

    const newPlace = new Place({
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
            return next(new HttpError('No user found.', 404));
        }
    } catch (error) {
        console.log(`>>> Error finding user: ${error}.`);
        return next(new HttpError(`Error finding user: ${error}.`, 500))
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
        console.log(`>>> Error creating place: ${error}.`);
        return next(new HttpError(`Error creating place: ${error}.`, 500));
    }

    res.status(201).json({ place: newPlace.toObject({ getters: true }) });
}

/**
 * Updates a place.
 * @returns place id of place updated.
 */
export const updatePlaceById = async (req: Request, res: Response, next: NextFunction) => {
    const placeId = req.params.pid;
    console.log('>>> updatePlaceById:');
    
    const { title, description } = req.body;

    let place;
    try {
        place = await Place.findById(placeId);
        if (!place) {
            return next (new HttpError('Place not found.', 404))
        }
    } catch (error) {
        console.log(`>>> Error finding place: ${error}.`)
        return next(new HttpError(`Error finding place: ${error}.`, 500));
    }

    if (place.creator.toString() !== (req as AuthRequest).userData.userId) {
        return next(new HttpError('Not authorized to update place.', 401));
    }

    try {
        place = await Place.updateOne(
            { _id: placeId },
            { title: title, description: description },
            { new: true }
        );
    } catch(error) {
        console.log(`>>> Error updating place:  ${error}.`);
        return next(new HttpError(`Error updating place: ${error}.`, 500));
    }

    res.status(200).json({ place: placeId });
}

/**
 * Deletes a place
 * @returns message: 'Place deleted'
 */
export const deletePlaceById = async (req: Request, res: Response, next: NextFunction) => {
    const placeId = req.params.pid;
    console.log('>>> deletePlaceById:');

    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
        if (!place) {
            return next (new HttpError('Place not found.', 404))
        }
    } catch (error) {
        console.log(`>>> Error finding place: ${error}.`)
        return next(new HttpError(`Error finding place: ${error}.`, 500));
    }

    if (place.creator._id.toString() !== (req as AuthRequest).userData.userId) {
        return next(new HttpError('Not authorized to delete place.', 401));
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
            return next(new HttpError(`Error updating user.`, 500));
        }

        const deletedPlace = await Place.findByIdAndDelete(placeId).session(session);
        if (!deletedPlace) {
            return next(new HttpError(`Error deleting place.`, 500));
        }

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        console.log(`>>> Error deleting place: ${error}.`);
        return next(new HttpError(`Error deleting place: ${error}`, 500));
    }

    fs.unlink(place.image, (error) => {
        console.log(`>>> Error deleting image file: ${error}`)
    });

    res.status(200).json({ message: 'Place deleted' });
}