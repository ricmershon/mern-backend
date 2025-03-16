import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload }  from 'jsonwebtoken';

import { HttpError } from '../models/http-error.ts';

interface CheckAuthRequest extends Request {
    userData: {
        userId: string;
    }
    | JwtPayload;
}

interface CheckAuthJwtPayload extends JwtPayload {
    userId: string;
}

export const checkAuth = (req: Request, _res: Response, next: NextFunction) => {
    // This if check can be removed when using cors
    if (req.method === 'OPTIONS') {
        next();
    }

    try {
        let token: string = '';
        const authHeader = req.headers.authorization;
        if (typeof authHeader === 'string') {
            token = authHeader?.split(' ')[1];
        }
        if (!token) {
            return next(new HttpError('Authentication failed.', 401));
        }
        const decodedToken = <CheckAuthJwtPayload>jwt.verify(token, process.env.SECRET!);
        (req as CheckAuthRequest).userData = { userId: decodedToken.userId };
        next();
    } catch (error) {
        return next(new HttpError(`Authentication failed: ${error}`, 401));
    }
};