<script lang="ts">
    import { goto } from '$app/navigation';
    import { TriangleAlert } from 'lucide-svelte';
</script>

<svelte:head>
    <title>Page Not Found | Zingram</title>
    <meta
        name="description"
        content="The page you are looking for could not be found."
    />
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-[#0D1428] px-6 text-white">
    <div class="w-full max-w-md text-center">

        <!-- Error Icon -->
        <div class="mx-auto flex  items-center justify-center">
            <TriangleAlert
                size={38}
                class="text-red-500"
            />
        </div>

        <!-- Error Code -->
        <h1 class="mt-6 text-7xl font-bold tracking-tight text-white">
            404
        </h1>

        <!-- Title -->
        <h2 class="mt-4 text-2xl font-semibold">
            Page Not Found
        </h2>

        <!-- Description -->
        <p class="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#8A93A8]">
            Sorry, the page you're looking for doesn't exist or may have been
            moved. Let's get you back to Zingram.
        </p>

        <!-- Buttons -->
        <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <button
                type="button"
                onclick={() => goto('/login')}
                class="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
            >
                Go to Login
            </button>

            <button
                type="button"
                onclick={() => goto('/register')}
                class="w-full rounded-xl border border-[#303A55] bg-[#151D32] px-6 py-3 text-sm font-semibold text-white transition hover:border-blue-600 hover:text-blue-500 sm:w-auto"
            >
                Create Account
            </button>

        </div>

        <!-- Footer -->
        <p class="mt-10 text-xs text-[#596278]">
            Zingram · Created by Tetebe Jeffrey
        </p>

    </div>
</div>