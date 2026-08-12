<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { setOffline, setOnline} from '$lib/services/presence';
	import { loadCurrentUser } from '$lib/services/auth';

onMount(() => {
    // User is online when the app starts
    loadCurrentUser();
    setOnline();

    const handleVisibilityChange = async () => {

        if (document.visibilityState === 'hidden') {
            // App left / went into background
            await setOffline();

        } else if (document.visibilityState === 'visible') {
            // App came back
            await loadCurrentUser();
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
