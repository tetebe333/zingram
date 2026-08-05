import { writable } from "svelte/store";

export interface UserState {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  profileImage: string;

  bio: string;
  gender: string;
  dateOfBirth: string;
  title: string;
  language: string;

  facebook: string;
  instagram: string;
  whatsapp: string;

  online: boolean;
  lastSeen: number;
  updatedAt: string,
  createdAt: string,
}

export const userStore  = writable<UserState | null> (null);
