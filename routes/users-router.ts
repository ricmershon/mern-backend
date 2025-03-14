import express from 'express';

export const router = express.Router();

import { getUsers, createUser, loginUser } from '../controllers/users-controller.ts'
import { userImageUpload } from '../middleware/file-upload.ts';

router.get('/', getUsers);

router.post('/signup', userImageUpload.single('image'), createUser);

router.post('/login', loginUser);