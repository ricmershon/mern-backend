import { Schema } from "express-validator";

export const createUserSchema: Schema = {
    name: {
        notEmpty: true,
        errorMessage: 'A name must be provided',
    },
    email: {
        normalizeEmail: true,
        isEmail: true,
        errorMessage: 'A valid email must be provided'
    },
    password: {
        isLength: { options: { min: 6, max: 16 } },
        errorMessage: 'Password must be between 6 and 16 characters'
    }
}