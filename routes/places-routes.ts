import express from 'express';
import { checkSchema } from 'express-validator';

export const router = express.Router();

import { createPlaceSchema, updatePlaceByIdSchema } from '../shemas/places-validation-schemas.ts';
import {
    getPlacesByUserId,
    getPlaceById,
    createPlace,
    updatePlaceById,
    deletePlaceById
} from '../controllers/places-controller.ts';

router.get('/:pid', getPlaceById);

router.get('/user/:uid', getPlacesByUserId);

router.post('/', checkSchema(createPlaceSchema), createPlace);

router.patch('/:pid', checkSchema(updatePlaceByIdSchema), updatePlaceById);

router.delete('/:pid', deletePlaceById);