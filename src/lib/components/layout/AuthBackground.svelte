<script lang="ts">
    // No script needed for now
     let { children } = $props();
</script>

<div class="relative min-h-screen overflow-hidden bg-[#03081A]">

    <!-- Background Gradient -->
    <div
        class="absolute inset-0 bg-linear-to-br from-[#050A1F] via-[#030816] to-black"
    ></div>

    <!-- Top Right Glow -->
    <div
        class="absolute top-0 -right-40 h-70 w-70 rounded-full bg-blue-400/5 opacity-70 blur-[2px]"
    ></div>

    <!-- Bottom Left Glow -->
    <div
        class="absolute  top-150 -left-45 h-70 w-70 rounded-full bg-blue-400/5 opacity-70 blur-[2px]"
    ></div>

    <!-- Top Right Outline Circle -->
    <div
        class="absolute top-12 right-40 h-72 w-72 rounded-full border border-blue-500/20"
    ></div>

    <!-- Bottom Left Outline Circle -->
    <div
        class="absolute bottom-24 left-24 h-72 w-72 rounded-full border border-blue-500/20"
    ></div>

    <!-- Top Left Dot Grid -->
    <div class="absolute left-14 top-20 grid grid-cols-4 gap-5 opacity-40">
        {#each Array(16) as _}
            <div class="h-1 w-1 rounded-full bg-blue-500"></div>
        {/each}
    </div>

    <!-- Bottom Right Dot Grid -->
    <div class="absolute right-14 bottom-36 grid grid-cols-4 gap-5 opacity-40">
        {#each Array(16) as _}
            <div class="h-1 w-1 rounded-full bg-blue-500"></div>
        {/each}
    </div>

    <!-- Large Faded Circle Top Right -->
   

    <!-- Page Content -->
    <div class=" z-10 min-h-screen">
         {#if children}
             {@render children()}
         {/if}
    </div>

</div>