import express from 'express';

export const router = express.Router();

import { getUsers, createUser, loginUser } from '../controllers/users-controller.ts'

router.get('/', getUsers);

router.post('/signup', createUser);

router.post('/login', loginUser);