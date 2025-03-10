import { Request, Response, NextFunction } from "express";

import { HttpError } from "../models/http-error.ts";
import { User } from "../models/user-model.ts";

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
    console.log('>>> GET request for users');

    let users;
    try {
        users = await User.find({}, '-password');
    } catch (error) {
        return next(new HttpError(`Error getting users: ${error}`, 500));
    }

     res.json({ users: users.map((user) => user.toObject({ getters: true })) });
}

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    console.log('>>> POST request for create user');

    const { name, email, password, imageUrl } = req.body;

    try {
        if (await User.findOne({ email: email })) {
            return next(new HttpError(`A user with this email is already registered: ${email}.`, 422));
        }
    } catch(error) {
        return next(new HttpError(`There was an error finding user: ${error}`, 500));
    }

    const newUser = new User ({ name, email, imageUrl, password, places: [] });

    try {
        await newUser.save();
    } catch (error) {
        return next(new HttpError(`Error creating user: ${error}`, 500));
    }

    res.status(201).json({ user: newUser.toObject({ getters: true }) })
}

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    console.log(`>>> POST login request for: ${email}`);

    let user;
    try {
        user = await User.findOne({ email: email });
    } catch (error) {
        return next(new HttpError(`Error finding user: ${error}`, 500));
    }

    if (!user || user.password !== password) {
        return next(new HttpError('Invalid credentials', 401));
    }

    res.json({ user: user.toObject({ getters: true }) });
}