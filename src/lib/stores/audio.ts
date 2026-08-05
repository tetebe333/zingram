import { writable } from "svelte/store";

export const audioStore = writable({
    playbackSpeed: 1 
});
