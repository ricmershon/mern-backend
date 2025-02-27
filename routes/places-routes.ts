import express from 'express';
import { check } from 'express-validator';

export const router = express.Router();

import {
    getPlacesByUserId,
    getPlacesById,
    createPlace,
    updatePlaceById,
    deletePlaceById
} from '../controllers/places-controller.ts';

router.get('/:pid', getPlacesById);

router.get('/user/:uid', getPlacesByUserId);

router.post(
    '/',
    [
        check('title').not().isEmpty().withMessage('A title must be provided'),
        check('description').isLength({ min: 5 }).withMessage('A description of at least 5 characters must be provided'),
        check('address').not().isEmpty().withMessage('An address must be provided')
    ],
    createPlace
);

router.patch(
    '/:pid',
    [
        check('title').not().isEmpty().withMessage('A title must be provided'),
        check('description').isLength({ min: 5 }).withMessage('A description of at least 5 characters must be provided')
    ],
    updatePlaceById);

router.delete('/:pid', deletePlaceById);