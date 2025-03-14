import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import 'dotenv/config';

import { router as placesRouter } from './routes/places-router.ts';
import { router as usersRouter } from './routes/users-router.ts';
import { HttpError } from './models/http-error.ts';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/places', placesRouter);
app.use('/api/users', usersRouter);

app.use((_req, _res, _next) => {
    console.log('^^^ REQUEST ^^^', _res);
    throw new HttpError('Route not found', 404);
});

app.use((error: HttpError, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(error);
    }

    if (error.code || error.message) {
        res.status(error.code || 500).json({
            message: error.message || 'Unknown error occurred'
        });
    }
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