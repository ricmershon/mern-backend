import express from 'express';
import { checkSchema } from 'express-validator';

export const router = express.Router();

import {
    getPlacesByUserId,
    getPlacesById,
    createPlace,
    updatePlaceById,
    deletePlaceById
} from '../controllers/places-controller.ts';
import { createPlaceSchema, updatePlaceByIdSchema } from '../shemas/places-validation-schemas.ts';

router.get('/:pid', getPlacesById);

router.get('/user/:uid', getPlacesByUserId);

router.post('/', checkSchema(createPlaceSchema), createPlace);

router.patch('/:pid', checkSchema(updatePlaceByIdSchema), updatePlaceById);

router.delete('/:pid', deletePlaceById);