import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import { HttpError } from "../models/http-error.ts";
import { getCoordsForAddress } from '../utilities/location.ts';
import { Place } from '../models/place.ts';
import { User } from '../models/user.ts';

export const getPlaceById = async (req: Request, res: Response, next: NextFunction) => {
    const placeId = req.params.pid;
    console.log(`>>> GET request for place: ${placeId}`);

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (error) {
        console.log('Error getting place\n', error);
        return next(new HttpError(`Error getting place: ${error}`, 500));
    }

    if (!place) {
        console.log('>>> No place found');
        return next(new HttpError(`No place found for: ${placeId}`, 404));
    }
    
    res.json({ place: place.toObject({ getters: true }) });
}

export const getPlacesByUserId = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.uid;
    console.log(`>>> GET request for user places: ${userId}`);

    let places;
    try {
        places = await Place.find({ creator: userId });
    } catch(error) {
        console.log('Error getting places\n', error);
        return next(new HttpError(`Error getting places: ${error}`, 500))
    }

    if (!places || places.length === 0) {
        console.log('>>> No places found');
        return next(new HttpError(`No user places found for: ${userId}`, 404));
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
        console.log('Could not get coordinates for address', error);
        return next(new Error(<string>error));
    }

    const newPlace = new Place ({
        title: title,
        description: description,
        imageUrl: 'https://en.wikipedia.org/wiki/Boston#/media/File:John_Hancock_Tower.jpg',
        address: address,
        location: coordinates,
        creator: creator
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (error) {
        console.log('Error getting user\n', error);
        return next(new HttpError(`Error getting user: ${user}`, 500))
    }

    if (!user) {
        console.log('User not found');
        return next(new HttpError(`No user found for: ${user}`, 404));
    }

    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await newPlace.save({ session: session });
        user.places.push(newPlace)
        await user.save({ session: session });
        await session.commitTransaction();
    } catch (error) {
        console.log(error);
        return next(new HttpError('Creating place faled', 500));
    }

    res.status(201).json({ place: newPlace.toObject({ getters: true }) });
}

export const updatePlaceById = async (req: Request, res: Response, next: NextFunction) => {
    const placeId = req.params.pid;
    console.log(`>>> PATCH request for place: ${placeId}`);
    
    const { title, description } = req.body;

    let place;
    try {
        place = await Place.findByIdAndUpdate(
            placeId,
            { title: title, description: description },
            { new: true }
        );
    } catch(error) {
        console.log('>>> Error getting place and updating\n', error);
        return next(new HttpError(`Error getting place and updating: ${error}`, 500));
    }

    if (!place) {
        console.log('>>> Place not found');
        return next(new HttpError(`No place found for: ${placeId}`, 404))
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });
}

export const deletePlaceById = async (req: Request, res: Response, next: NextFunction) => {
    const placeId = req.params.pid;
    console.log(`>>> DELETE request for place: ${placeId}`);

    try {
        await Place.findByIdAndDelete(placeId);
    } catch (error) {
        console.log('>>> Error deleting place\n', error);
        return next(new HttpError(`Error deleting place: ${error}`, 500));
    }

    res.status(200).json({ message: 'Place deleted' });
}