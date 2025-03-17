import 'dotenv/config';
import fs from 'fs';
import path from 'path';

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import { router as placeRouter } from './routes/place-routes.ts';
import { router as userRouter } from './routes/user-routes.ts';
import { HttpError } from './models/http-error.ts';

const app = express();

app.use(bodyParser.json());

// app.use((_req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader(
//         'Access-Control-Allow-Headers',
//         'Origin, X-Requested-With, Content-Type, Accept, Authorization'
//     );
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
//     next();
// });

app.use(cors());

app.use('/uploads/images/places', express.static(path.join('uploads', 'images', 'places')));
app.use('/uploads/images/users', express.static(path.join('uploads', 'images', 'users')));

app.use('/api/places', placeRouter);
app.use('/api/users', userRouter);

app.use("/", (req: Request, res: Response, next: NextFunction): void => {
    res.json({ message: "Allo! Catch-all route." });
});
  

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((_req, _res, _next) => {
    throw new HttpError('Route not found', 404);
});

app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
        fs.unlink(req.file.path, (error) => {
            console.log('>>> ERROR DELETING FILE: ', error);
        });
    }
    if (res.headersSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'Unknown error occurred' });
});

export default app;