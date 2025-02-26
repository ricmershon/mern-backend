import express from 'express';

export const router = express.Router();

import { getPlacesByUserId, getPlaceById, createPlace } from '../controllers/places-controller.ts';

router.get('/:pid', getPlaceById);
router.get('/user/:uid', getPlacesByUserId);
router.post('/', createPlace);