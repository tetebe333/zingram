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

				if (!currentUser) {
					return;
				}

				if (typeof Notification === 'undefined') {
					return;
				}

				// Do not request permission here.
				// Login/register handles that.
				if (Notification.permission !== 'granted') {
					return;
				}

				await registerFCM(currentUser.uid);

				console.log(
					'Zingram notification registration refreshed.'
				);
			} catch (error) {
				console.error(
					'Notification registration refresh failed:',
					error
				);
			}
		}

		function startForegroundNotifications() {
			try {
				listenForForegroundMessages();

				console.log(
					'Zingram foreground notification listener started.'
				);
			} catch (error) {
				console.error(
					'Foreground notification listener failed:',
					error
				);
			}
		}

		async function handleAppStart() {
			await checkAndUpdateEmail();

			await loadCurrentUser();

			await setOnline();

			await refreshNotificationRegistration();

			startForegroundNotifications();
		}

		handleAppStart();

		const handleVisibilityChange = async () => {
			if (document.visibilityState === 'hidden') {
				await setOffline();
			} else if (document.visibilityState === 'visible') {
				await checkAndUpdateEmail();

				await loadCurrentUser();

				await setOnline();

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