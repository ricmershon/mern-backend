import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';

import { HttpError } from "../models/http-error.ts";
import { Place } from '../models/place.ts';
import { PlaceType } from '../types';
import { getValidationMessages } from '../utilities/validation.ts';
import { getCoordsForAddress } from '../utilities/location.ts';

const DUMMY_PLACES: Array<PlaceType> = [
    {
        id: 'p1',
        title: 'Empire State Building',
        description: 'One of the most famous sky scrapers in the world!',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
        address: '20 W 34th St, New York, NY 10001',
        location: {
            lat: 40.7484405,
            lng: -73.9878584
        },
        creator: 'u1'
    },
    {
        id: 'p2',
        title: 'Empire State Building',
        description: 'One of the most famous sky scrapers in the world!',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
        address: '20 W 34th St, New York, NY 10001',
        location: {
            lat: 40.7484405,
            lng: -73.9878584
        },
        creator: 'u2'
    }
];

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

export const updatePlaceById = (req: Request, res: Response, _next: NextFunction) => {
    const placeId = req.params.pid;
    
    console.log(`>>> PATCH request for place: ${placeId}`);

        const result = validationResult(req);

        if (!result.isEmpty()) {
            const error = getValidationMessages(req).array()[0];
            console.log(`>>> Invalid inputs: ${error}`);
            throw new HttpError(error, 422);
        }
    
    const { title, description } = req.body;
    const updatedPlaceIndex = DUMMY_PLACES.findIndex((p) => placeId === p.id);
    
    if (updatedPlaceIndex === -1) {
        console.log('>>> Place not found');
        throw new HttpError(`No place found for: ${placeId}`, 404)
    }
    
    const updatedPlace: PlaceType = { ...DUMMY_PLACES.find((p) => placeId === p.id) };
    updatedPlace.title = title;
    updatedPlace.description = description;

    DUMMY_PLACES[updatedPlaceIndex] = updatedPlace;
    res.status(200).json({ place: updatedPlace })
}

export const deletePlaceById = (req: Request, res: Response, _next: NextFunction) => {
    const placeId = req.params.pid;

    console.log(`>>> DELETE request for place: ${placeId}`);

    const deletedPlaceIndex = DUMMY_PLACES.findIndex((p) => placeId === p.id);

    if (deletedPlaceIndex === -1) {
        console.log('>>> Place not found');
        throw new HttpError(`No place found for: ${placeId}`, 404);
    }

    DUMMY_PLACES.splice(deletedPlaceIndex, 1);
    res.status(200).json({ message: 'Place deleted' });
}