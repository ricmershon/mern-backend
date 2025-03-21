import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload }  from 'jsonwebtoken';

import { HttpError } from '../models/http-error.ts';

export interface AuthRequest extends Request {
    userData: {
        userId: string;
    }
    | JwtPayload;
}

interface AuthJwtPayload extends JwtPayload {
    userId: string;
}

export const checkAuth = (req: Request, _res: Response, next: NextFunction) => {
    try {
        let token: string = '';
        const authHeader = req.headers.authorization;
        if (typeof authHeader === 'string') {
            token = authHeader?.split(' ')[1];
        }

        if (!token) {
            throw new Error('Authentication failed: invalid token.');
        }
        
        const decodedToken = <AuthJwtPayload>jwt.verify(token, process.env.SECRET!);
        (req as AuthRequest).userData = { userId: decodedToken.userId };
        next();
    } catch (error) {
        return next(new HttpError(`Authentication failed: ${error}`, 403));
    }
};