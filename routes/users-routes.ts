import express from 'express';
import { checkSchema } from 'express-validator';

export const router = express.Router();

import { createUserSchema } from '../shemas/users-validation-schemas.ts';
import { getUsers, createUser, loginUser } from '../controllers/users-controller.ts'

router.get('/', getUsers);

router.post('/signup', checkSchema(createUserSchema), createUser);

router.post('/login', loginUser);