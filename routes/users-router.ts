import express from 'express';

export const router = express.Router();

import { getUsers, createUser, loginUser } from '../controllers/users-controller.ts'
import fileUpload from '../middleware/file-upload.ts';

router.get('/', getUsers);

router.post('/signup', fileUpload.single('image'), createUser);

router.post('/login', loginUser);