import axios from 'axios';

import { HttpError } from '../models/http-error.ts';

export const getCoordsForAddress = async (address: string) => {
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${
            encodeURIComponent(address)
        }&key=${process.env.GOOGLE_API_KEY}`);
    
        const data = response.data;
    
        if (!data || data.status === 'ZERO_RESULTS') {
            console.log('>>> Could not find location for address');
            throw new HttpError('could not find location for address', 422);
        }
        return data.results[0].geometry.location;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.response) {
            const { data, status, headers } = error.response;
            console.log(`>>> Google geocode API called but received errors\n${data}\n${status}\n${headers}`);
        } else if (error.request) {
            console.log(`>>> Google geocode API called but no response received\n${error.request}`);
        } else {
            console.log(`>>> Unknown error with Google geocode API request\n${error}`);
        }
        throw new HttpError(error, 422)
    }
}