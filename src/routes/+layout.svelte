<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/zingram-logo.png';
	import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { auth } from '$lib/firebase/firebase';
	import { setOffline, setOnline} from '$lib/services/presence';
	import { loadCurrentUser, checkAndUpdateEmail } from '$lib/services/auth';
    import { onAuthStateChanged, type User } from "firebase/auth";

    export function waitForAuth(): Promise<User | null> {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                resolve(user);
            });
        });
    }

onMount(() => {

    async function usergoto() {
        const currentUser = await waitForAuth();

        try {
            if (!currentUser) {
                goto('/login');
            }
        } catch (error) {
            console.error(error);
        }
    }

    usergoto();

    async function handleAppStart() {
        // checking Firebase Auth for a possibly changed email
        await checkAndUpdateEmail();
        
        // loading user data
        await loadCurrentUser();


        // User is online
        await setOnline();
    }

    handleAppStart();

    const handleVisibilityChange = async () => {

        if (document.visibilityState === 'hidden') {
            // App left / went into background
            await setOffline();

        } else if (document.visibilityState === 'visible') {
            // App came back

            // Then check if Firebase email changed
            await checkAndUpdateEmail();

            // Load normal user data first
            await loadCurrentUser();

            // User is online again
            await setOnline();
        }
    };

    document.addEventListener(
        'visibilitychange',
        handleVisibilityChange
    );

    return () => {
        document.removeEventListener(
            'visibilitychange',
            handleVisibilityChange
        );
    };
});
let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
