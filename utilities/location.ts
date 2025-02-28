import axios from 'axios';

import { HttpError } from '../models/http-error.ts';

const API_KEY = process.env.GOOGLE_API_KEY;

export const getCoordsForAddress = async (address: string) => {
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${
            encodeURIComponent(address)
        }&key=${API_KEY}`);
    
        const data = response.data;
    
        if (!data || data.status === 'ZERO_RESULTS') {
            console.log('>>> Could not find address for location');
            throw new HttpError('Could not find location for address', 422);
        }

        return data.results[0].geometry.location;
    } catch (error: any) {
        if (error.response) {
            console.log('>>> Google geocode API called but received errors');
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        } else if (error.request) {
            console.log('>>> Google geocode API called but no response received');
            console.log(error.request);
        } else {
            console.log('>>> Unknown error with Google geocode API request')
        }
        throw new HttpError(error, 422)
    }
}