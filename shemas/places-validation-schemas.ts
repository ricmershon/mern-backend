import { Schema } from "express-validator";

export const createPlaceSchema: Schema = {
    title: {
        notEmpty: true,
        errorMessage: 'A title must be provided'
    },
    description: {
        isLength: { options: { min: 10 } },
        errorMessage: 'A description of at least 10 characters must be provided'
    },
    address: {
        notEmpty: true,
        errorMessage: 'An address must be provided'
    }
}

export const updatePlaceByIdSchema: Schema = {
    title: {
        notEmpty: true,
        errorMessage: 'A title must be provided'
    },
    description: {
        isLength: { options: { min: 10 } },
        errorMessage: 'A description of at least 10 characters must be provided'
    },
}