import { Router } from 'express';

export const router = Router();

import { getUsers, createUser, loginUser } from '../controllers/user-controller.ts'
import { userImageUpload } from '../middleware/file-upload.ts';

router.get('/', getUsers);

router.post('/signup', userImageUpload.single('image'), createUser);

router.post('/login', loginUser);