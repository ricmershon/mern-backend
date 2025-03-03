import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';;
import 'dotenv/config';

import { router as placesRoutes } from './routes/places-routes.ts';
import { router as usersRoutes } from './routes/users-routes.ts';
import { HttpError } from './models/http-error.ts';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((_req, _res, _next) => {
    throw new HttpError('Route not found', 404);
});

app.use((error: HttpError, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(error);
    }

    if (error.code && error.message) {
        res.status(error.code || 500).json({
            message: error.message || 'Unknown error occurred'
        });
    }
});

// mongoose
//     .connect(mongodbURI!)
//     .then(() => {
//         app.listen(port, () => {
//             console.log(`Listening on port ${port}`)
//         });
//     })
//     .catch((error) => {
//         console.log('Error connecting to database', error)
//     });

const mongodbURI = process.env.MONGODB_URI!;
const port = process.env.PORT || 5001;

async function run() {
    try {
        await mongoose.connect(mongodbURI);
        app.listen(port, () => {
            console.log(`Listening on port ${port}`);
        });
    } catch(error) {
        console.log('Error connecting to server', error);
    }
}

run();