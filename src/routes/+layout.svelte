<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { setOffline, startPresenceHeartbeat, stopPresenceHeartbeat } from '$lib/services/presence';
	import { loadCurrentUser } from '$lib/services/auth';

onMount(() => {
   loadCurrentUser();
   startPresenceHeartbeat();

    let offlineTimer: ReturnType<typeof setTimeout> | null = null;

    const handleVisibilityChange = async () => {
        if (document.visibilityState === 'hidden') {
            offlineTimer = setTimeout(async () => {
                await setOffline();
                offlineTimer = null;
            }, 30000);
        } else {
            if (offlineTimer) {
                clearTimeout(offlineTimer);
                offlineTimer = null;
            }

            await loadCurrentUser();
            await startPresenceHeartbeat();
        }
    };

    document.addEventListener(
        'visibilitychange',
        handleVisibilityChange
    );

    return () => {
        if (offlineTimer) {
            clearTimeout(offlineTimer);
        }

        stopPresenceHeartbeat();

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
