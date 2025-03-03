import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

import { HttpError } from "../models/http-error.ts";
import { User } from "../models/user.ts";
import { UserType } from "../types";
import { getValidationMessages } from "../utilities/validation.ts";

const USERS: Array<UserType> = [
    {
        id: 'u1',
        name: 'Ric Mershon',
        email: 'ricmershon@gmail.com',
        password: 'MyPassword',
        placeCount: 3
    },
    {
        id: 'u2',
        name: 'Wendy Widis',
        placeCount: 3
    },
    {
        id: 'u3',
        name: 'Jake Mershon',
        placeCount: 3
    },
    {
        id: 'u4',
        name: 'Mara Mershon',
        placeCount: 3
    },
];

export const getUsers = (_req: Request, res: Response, _next: NextFunction) => {
    console.log('>>> GET request for users');

    if (USERS.length === 0) {
        console.log('>>> No users found');
        throw new HttpError('No users found', 404);
    }
     res.json({ users: USERS });
}

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    console.log('>>> POST request for create user');

    const { name, email, password, imageUrl, places } = req.body;

    const newUser = new User ({ name, email, imageUrl, password, places });

    try {
        await newUser.save();
    } catch (error) {
        console.log('>>> Error creating user\n', error);
        return next(new HttpError(`Error creating user: ${error}`, 500));
    }

    res.status(201).json({ user: newUser.toObject({ getters: true }) })
}

export const loginUser = (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;

    const user: UserType = {
        email: email,
        password: password
    }

    console.log(`>>> POST login request for: ${user.email}`)

    const identifiedUser = USERS.find((u) => u.email === user.email);

    if (!identifiedUser) {
        console.log('>>> No user found');
        throw new HttpError(`User not found: ${email}`, 401);
    }

    if (identifiedUser.password !== user.password) {
        console.log('>>> Password incorrect');
        throw new HttpError(`Password incorrect for: ${email}`, 401);
    }

    console.log(identifiedUser);
    res.json({ message: `Logged in: ${email}` });
}