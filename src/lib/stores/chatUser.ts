import { writable } from "svelte/store";
import {type UserState } from "./user";

export const chatUserStore = writable<UserState | null>(null);