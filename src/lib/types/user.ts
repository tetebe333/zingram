export type Gender = 'male' | 'female';

export interface RegisterUser {
    fullName: string;
    dob: string;
    email: string;
    password: string;
    username: string;
    avatar: string;
    gender: Gender;
}