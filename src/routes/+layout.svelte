<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { auth } from '$lib/firebase/firebase';
	import { setOffline, setOnline} from '$lib/services/presence';
	import { loadCurrentUser, checkAndUpdateEmail } from '$lib/services/auth';

onMount(() => {
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

<svelte:head>
    <!-- Browser favicon -->
    <link rel="icon" type="image/png" sizes="32x32" href="/zingram-32x32.png.PNG" />
    <link rel="icon" type="image/png" sizes="48x48" href="/zingram-48x48.png.PNG" />

    <!-- Larger icon -->
    <link rel="icon" type="image/png" sizes="96x96" href="/zingram-96x96.png.PNG" />

    <!-- iPhone / iOS -->
    <link rel="apple-touch-icon" sizes="180x180" href="/zingram-180x180.png.PNG" />

    <!-- iPhone / iOS sm -->
    <link rel="apple-touch-icon-sm" sizes="16x16" href="/zingram-16x16.png.png" />

    <!-- iPhone / iOS xs-->
    <link rel="apple-touch-icon-xs" sizes="8x8" href="/zingram-8x8.png.png" />
</svelte:head>
{@render children()}
