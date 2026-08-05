import { writable } from 'svelte/store';
import type { UserState } from './user';

type UsersStore = {
    users: UserState[];
    loading: boolean;
};

export const usersStore = writable<UsersStore>({
    users: [],
    loading: false
});