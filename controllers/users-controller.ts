import { Request, Response, NextFunction } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { HttpError } from "../models/http-error.ts";
import { User } from "../models/user-model.ts";

/**
 * @returns array of user objects.
 */
export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
    console.log('>>> getUsers:');

    let users;
    try {
        users = await User.find({}, '-password');
    } catch (error) {
        console.log(`>>> Error finding users: ${error}.`)
        return next(new HttpError(`Error finding users: ${error}.`, 500));
    }

     res.json({ users: users.map((user) => user.toObject({ getters: true })) });
}

/**
 * Creates a new user.
 * @returns object containing userId, email and token.
 */
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    console.log('>>> createUser:');

    const { name, email, password } = req.body;

    try {
        if (await User.findOne({ email: email })) {
            return next(new HttpError(`A user with this email is already registered: ${email}.`, 422));
        }
    } catch(error) {
        console.log(`>>> Error finding user: ${error}.`)
        return next(new HttpError(`Error finding user: ${error}.`, 500));
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (error) {
        console.log(`>>> Error creating user: ${error}.`)
        return next(new HttpError(`Error creating user: ${error}.`, 500));
    }

    const newUser = new User ({
        name,
        email,
        image: req.file!.path,
        password: hashedPassword,
        places: []
    });

    try {
        await newUser.save();
    } catch (error) {
        console.log(`>>> Error creating user: ${error}.`)
        return next(new HttpError(`Error creating user: ${error}.`, 500));
    }

    let token;
    try {
        token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.JWT_KEY!,
            { expiresIn: '1h' }
        );
    } catch (error) {
        console.log(`>>> Error creating user: ${error}.`)
        return next(new HttpError(`Error creating user: ${error}.`, 500));
    }

    res.status(201).json({
        userId: newUser.id,
        email: newUser.email,
        token: token
    });
}

/**
 * Logs in a user.
 * @returns object containing userId, email and token.
 */
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    console.log('>>> loginUser:');

    let user;
    try {
        user = await User.findOne({ email: email });
    } catch (error) {
        console.log(`>>> Error finding user: ${error}.`)
        return next(new HttpError(`Error finding user: ${error}.`, 500));
    }

    if (!user) {
        return next(new HttpError('Invalid credentials', 403));
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, user.password);
    } catch (error) {
        console.log(`>>> Error logging in user: ${error}.`);
        return next(new HttpError(`Could not log you in: ${error}. Please check your credentials and try again.`, 500));
    }

    if (!isValidPassword) {
        return next(new HttpError('Invalid credentials.', 403));
    }

    let token;
    try {
        token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_KEY!,
            { expiresIn: '1h' }
        );
    } catch (error) {
        console.log(`>>> Error logging in user: ${error}.`);
        return next(new HttpError(`Error logging in user: ${error}.`, 500));
    }
    
    res.status(201).json({
        userId: user.id,
        email: user.email,
        token: token
    });
}