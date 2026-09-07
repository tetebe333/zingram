<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';

	import { setOffline, setOnline } from '$lib/services/presence';

	import {
		loadCurrentUser,
		checkAndUpdateEmail,
		waitForAuth
	} from '$lib/services/auth';

	import {
		registerFCM,
		listenForForegroundMessages
	} from '$lib/firebase/messaging';

	onMount(() => {
    async function refreshNotificationRegistration() {
        try {
            const currentUser = await waitForAuth();

            if (!currentUser) return;

            await registerFCM(currentUser.uid);
        } catch (error) {
            console.warn(
                'Notification registration skipped:',
                error
            );
        }
    }

    async function handleAppStart() {
        try {
            await checkAndUpdateEmail();
            await loadCurrentUser();
            await setOnline();
            await refreshNotificationRegistration();

            listenForForegroundMessages();
        } catch (error) {
            console.error(
                'Failed to initialize Zingram:',
                error
            );
        }
    }

    // Start initialization without making onMount itself async.
    handleAppStart();

    const handleVisibilityChange = async () => {
        if (document.visibilityState === 'hidden') {
            await setOffline();
            return;
        }

        if (document.visibilityState === 'visible') {
            try {
                await checkAndUpdateEmail();
                await loadCurrentUser();
                await setOnline();
                await refreshNotificationRegistration();
            } catch (error) {
                console.error(
                    'Failed to restore Zingram state:',
                    error
                );
            }
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
	<link
		rel="icon"
		type="image/png"
		sizes="32x32"
		href="/zingram-32x32.png.PNG"
	/>

	<link
		rel="icon"
		type="image/png"
		sizes="48x48"
		href="/zingram-48x48.png.PNG"
	/>

	<link
		rel="icon"
		type="image/png"
		sizes="96x96"
		href="/zingram-96x96.png.PNG"
	/>

	<link
		rel="apple-touch-icon"
		sizes="180x180"
		href="/zingram-180x180.png.PNG"
	/>

	<link
		rel="apple-touch-icon-sm"
		sizes="16x16"
		href="/zingram-16x16.png.png"
	/>

	<link
		rel="apple-touch-icon-xs"
		sizes="8x8"
		href="/zingram-8x8.png.png"
	/>
</svelte:head>

{@render children()}