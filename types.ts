interface Location {
    lat: number,
    lng: number
}

export interface UserType {
    id?: string,
    name?: string,
    email?: string,
    password?: string,
    imageUrl?: string,
    placeCount?: number
}