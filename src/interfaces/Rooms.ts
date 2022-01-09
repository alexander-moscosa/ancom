export interface Rooms {
    rooms: Room[];
}

export interface Room {
    code:  string;
    users: User[];
}

export interface User {
    username: string;
    id:       string;
}
