import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';

import { router as placesRoutes } from './routes/places-routes.ts';
import { router as usersRoutes } from './routes/users-routes.ts';
import { HttpError } from './models/http-error.ts';

const port = 5001;
const app = express();

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
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})