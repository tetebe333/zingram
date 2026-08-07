<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { setOffline } from '$lib/services/presence';
	import { setOnline } from '$lib/services/presence';
	import { loadCurrentUser } from '$lib/services/auth';

	onMount(() => {

    loadCurrentUser();

    setOnline()
       

    let offlineTimer: ReturnType<typeof setTimeout> | null = null;


    const handleVisibilityChange = async () => {


        if (document.visibilityState === "hidden") {


            offlineTimer = setTimeout(async () => {

                await setOffline();

            }, 30000);



        } else {


            if (offlineTimer) {

                clearTimeout(offlineTimer);
                offlineTimer = null;

            }


            await loadCurrentUser();


            await setOnline();
        }

    };


    document.addEventListener(
        "visibilitychange",
        handleVisibilityChange
    );


    return () => {


        if (offlineTimer) {

            clearTimeout(offlineTimer);

        }


        document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange
        );


    };

});
	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
