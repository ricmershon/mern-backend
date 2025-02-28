import express from 'express';
import { check, checkSchema } from 'express-validator';

export const router = express.Router();

import { getUsers, createUser, loginUser } from '../controllers/users-controller.ts'
import { createUserSchema } from '../shemas/users-validation-schemas.ts';

router.get('/', getUsers);

router.post('/signup', checkSchema(createUserSchema), createUser);

router.post('/login', loginUser);