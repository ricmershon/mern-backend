import 'dotenv/config';
import fs from 'fs';
import path from 'path';

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import { router as placesRouter } from './routes/places-router.ts';
import { router as usersRouter } from './routes/users-router.ts';
import { HttpError } from './models/http-error.ts';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use('/api/places', placesRouter);
app.use('/api/users', usersRouter);

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

const db = mongoose.connection;
db.on('error', (error) => console.log('MongoDB Daemon: not running', error));
db.on('disconnected', () => console.log('MongoDB Daemon: disconnected'));
db.on('connected', () => console.log('MongoDB Daemon: connected'));

const port = process.env.PORT || 5001;

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        app.listen(port, () => {
            console.log(`Listening on port ${port}`);
        });
    } catch(error) {
        console.log('Error connecting to server', error);
    }
}

run();