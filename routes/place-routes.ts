import { Router } from 'express';

export const router = Router();

import {
    getPlacesByUserId,
    getPlaceById,
    createPlace,
    updatePlaceById,
    deletePlaceById
} from '../controllers/place-controller.ts';
import { placeImageUpload } from '../middleware/file-upload.ts';
import { checkAuth } from '../middleware/check-auth.ts';

router.get('/:pid', getPlaceById);
router.get('/user/:uid', getPlacesByUserId);

router.use(checkAuth);

router.post('/', placeImageUpload.single('image'), createPlace);

router.patch('/:pid', updatePlaceById);
router.delete('/:pid', deletePlaceById);