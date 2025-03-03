import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

import { HttpError } from "../models/http-error.ts";
import { Place } from '../models/place.ts';
import { getValidationMessages } from '../utilities/validation.ts';
import { getCoordsForAddress } from '../utilities/location.ts';

export const getPlaceById = async (req: Request, res: Response, next: NextFunction) => {
    const placeId = req.params.pid;
    console.log(`>>> GET request for place: ${placeId}`);

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (error) {
        console.log('>>> Error getting place\n', error);
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

    const result = validationResult(req);

    if (!result.isEmpty()) {
        const error = getValidationMessages(req).array()[0];
        console.log(`>>> Invalid inputs: ${error}`);
        return next(new HttpError(error, 422));
    }
    
    const { title, description, address, creator } = req.body;

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdPlace = new Place ({
        title: title,
        description: description,
        imageUrl: 'https://en.wikipedia.org/wiki/Boston#/media/File:John_Hancock_Tower.jpg',
        address: address,
        location: coordinates,
        creator: creator
    });

    try {
        await createdPlace.save();
    } catch (error) {
        console.log('>>> Error creating place\n', error);
        return next(new HttpError(`Error creating place: ${error}`, 500));
    }

    res.status(201).json({ place: createdPlace });
}

export const updatePlaceById = async (req: Request, res: Response, next: NextFunction) => {
    const placeId = req.params.pid;
    console.log(`>>> PATCH request for place: ${placeId}`);

    const result = validationResult(req);

    if (!result.isEmpty()) {
        const error = getValidationMessages(req).array()[0];
        console.log(`>>> Invalid inputs: ${error}`);
        return next(new HttpError(error, 422));
    }
    
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