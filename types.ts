interface Location {
    lat: number,
    lng: number
}

export interface PlaceType {
    id?: string,
    title?: string,
    description?: string,
    imageUrl?: string,
    address?: string,
    location?: Location,
    creator?: string;
}

export interface UserType {
    id?: string,
    name?: string,
    email?: string,
    password?: string,
    imageUrl?: string,
    placeCount?: number
}