<script lang="ts">
import AuthBackground from '$lib/components/layout/AuthBackground.svelte';
import { UserRoundPlus } from 'lucide-svelte';
import { LogIn } from 'lucide-svelte';
import zingramLogo from '$lib/assets/zingram-logo.png';
import { onMount } from 'svelte';
import { auth } from '$lib/firebase/firebase';
import { goto } from '$app/navigation';
import { loadCurrentUser } from '$lib/services/auth';


//checking if there is current user
onMount(async () => {
    try {
        if (auth.currentUser) {
            await loadCurrentUser();
            goto('/home');
        }
    } catch (error) {
        console.error(error);
    }
});

</script>

<AuthBackground>
<div class="relative flex min-h-screen flex-col items-center justify-center gap-4 px-4 pb-8 text-center text-white">
    <div class="relative flex items-center gap-2 top-11 ">
        <img width="200" height="200" src={zingramLogo} alt="Zingram Logo"/>   
    </div>

    <div class="flex flex-col items-center gap-2">
        <h1 class="text-4xl font-extrabold"><span class="text-blue-500">Z</span>ingram</h1>
        <p class="text-lg">Simple. <span class="text-blue-500">Fast.</span> Connected.</p>
    </div>
        
   
    <div class="mb-8">
        <p class="text-gray-500 font-medium text-sm">Connect with friends</p>
        <p class="text-gray-500 font-medium text-sm">anytime, anywhere.</p>
    </div>

    
    <div>
        <a href="/login" class="log-btn">
            <LogIn class="inline mb-1 me-1 text-white" size="20"/>
            Login
        </a>
    </div>

    <div class="mt-5">
        <a href="/register"  class="reg-btn group">
             <UserRoundPlus class="inline mb-1 me-1 text-blue-500 group-hover:text-white" size="20"/>
            Register
        </a>
    </div>

    <div class="mt-8">
        <p class="text-gray-500 font-medium text-sm">By continuing, you agree to our</p>
        <p class="text-gray-500 font-medium text-sm"> <a href="/" class="text-blue-500 hover:underline">Terms</a> & <a href="/privacy" class="text-blue-500 hover:underline">Privacy Policy</a></p>
</div>
</div>

</AuthBackground>

