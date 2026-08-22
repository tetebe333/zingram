<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
    import { auth } from '$lib/firebase/firebase';
	import { setOffline, setOnline } from '$lib/services/presence';
	import {
        loadCurrentUser,
        checkAndUpdateEmail,
        waitForAuth
    } from '$lib/services/auth';
    import { registerFCM } from '$lib/firebase/messaging';
	onMount(() => {
        async function refreshNotificationRegistration() {
            try {
                const currentUser = await waitForAuth();
                // No logged-in user
                if (!currentUser) {
                    return;
                }
                // Notifications are not supported
                if (typeof Notification === 'undefined') {
                    return;
                }
                // Don't ask for permission here.
                // Login/register handles the initial permission request.
                if (Notification.permission !== 'granted') {
                    return;
                }
                // Refresh/register the current browser's
                // Firebase notification installation.
                await registerFCM(currentUser.uid);
                console.log(
                    'Zingram notification registration refreshed.'
                );
            } catch (error) {
                // Notification registration should NEVER
                // stop the rest of the app from loading.
                console.error(
                    'Notification registration refresh failed:',
                    error
                );
            }
        }
        async function handleAppStart() {
            // Checking Firebase Auth for a possibly changed email
            await checkAndUpdateEmail();
            // Loading user data
            await loadCurrentUser();
            // User is online
            await setOnline();
            // Refresh notification registration
            await refreshNotificationRegistration();
        }
        handleAppStart();
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'hidden') {
                // App left / went into background
                await setOffline();
            } else if (document.visibilityState === 'visible') {
                // App came back
                // Check if Firebase email changed
                await checkAndUpdateEmail();
                // Load normal user data
                await loadCurrentUser();
                // User is online again
                await setOnline();
                // Refresh notification registration
                await refreshNotificationRegistration();
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
    <!-- Larger icon -->
    <link
        rel="icon"
        type="image/png"
        sizes="96x96"
        href="/zingram-96x96.png.PNG"
    />
    <!-- iPhone / iOS -->
    <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/zingram-180x180.png.PNG"
    />
    <!-- iPhone / iOS sm -->
    <link
        rel="apple-touch-icon-sm"
        sizes="16x16"
        href="/zingram-16x16.png.png"
    />
    <!-- iPhone / iOS xs -->
    <link
        rel="apple-touch-icon-xs"
        sizes="8x8"
        href="/zingram-8x8.png.png"
    />
</svelte:head>
{@render children()}