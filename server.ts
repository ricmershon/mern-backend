import mongoose from 'mongoose';

import app from "./app.ts";

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