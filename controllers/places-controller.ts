import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

console.log(uuidv4());

import { HttpError } from "../models/http-error.ts";
import { Place } from '../types';

const DUMMY_PLACES: Array<Place> = [
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

export const getPlaceById = (req: Request, res: Response, _next: NextFunction) => {
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find((p) => placeId === p.id);

    console.log(`GET request for place: ${placeId}`);

    if (!place) {
        console.log('No place found')
        throw new HttpError(`No place found for: ${placeId}`, 404);
    }
        console.log(place)
        res.json({ place: place });
}

export const getPlacesByUserId = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.uid;
    const userPlaces = DUMMY_PLACES.filter((place) => userId === place.creator);

    console.log(`GET request for user places: ${userId}`);

    if (userPlaces.length === 0) {
        console.log('No places found');
        return next(new HttpError(`No user places found for: ${userId}`, 404));
    }

    console.log(userPlaces);
    res.json({ places: userPlaces });
}

export const createPlace = (req: Request, res: Response, next: NextFunction) => {
    const { title, description, coordinates, address, creator } = req.body;
    const createdPlace = {
        id: uuidv4(),
        title: title,
        description: description,
        location: coordinates,
        address: address,
        creator: creator
    }

    DUMMY_PLACES.push(createdPlace);

    console.log(DUMMY_PLACES);

    res.status(201).json({ place: createdPlace });
}