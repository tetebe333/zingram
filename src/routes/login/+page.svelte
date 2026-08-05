<script lang="ts"> 
import AuthBackground from '$lib/components/layout/AuthBackground.svelte';
import zingramLogo from '$lib/assets/zingram-logo.png';
import { goto } from '$app/navigation';
import { fade } from 'svelte/transition';
import {loginUser} from '$lib/services/auth'

// All icons combined into one clean statement
import { 
  ChevronRight, ChevronLeft, Eye, EyeOff, Mail, LockKeyhole 
} from 'lucide-svelte';
import type { form } from '$app/server';

let errorTimeout: ReturnType<typeof setTimeout>; 
let isLoading = $state(false);
let errorMessage = $state('');
let showPassword = $state(false);
let loginInfo: { email: string; password: string } = $state({ email: '', password: '' });

// login form submission handler
async function handleLogin(event: Event) {
    event.preventDefault();

    try {
        isLoading = true;

       

        // Direct call to Firebase Auth SDK entirely bypassing auth.ts module caching
        await loginUser(loginInfo.email, loginInfo.password);
        
        // Redirect to dashboard or home page after successful login
        goto('/home');
    } catch (error) {
        console.error('Login failed:', error);

        // Check if the error is a real Error object with a message property
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = 'Registration failed. Please try again.';
        }
 
        // 1. Cancel any previous 3-second timer that is still running
        clearTimeout(errorTimeout);

        // 2. Start a fresh 3-second timer
        errorTimeout = setTimeout(() => {
            errorMessage = '';
        }, 3000);
    } finally{
        // Stop loading state
        isLoading = false;
    }
}
</script>

<AuthBackground>
    <div class="relative flex min-h-screen flex-col items-center justify-center gap-1 px-4 pb-8 text-center text-white">
        <div class="absolute z-10 top-11 left-4 border border-slate-600 rounded-full p-1 hover:bg-slate-700 transition duration-300 ease-in-out">
            <a href="/">
            <ChevronLeft class="text-white" size="22"/>
            </a>
       </div>

        <div class="relative flex items-center top-6 ">
            <img width="100" height="100" src={zingramLogo} alt="Zingram Logo"/>
        </div>
        <h1 class="text-3xl font-extrabold mb-4"><span class="text-blue-500">Z</span>ingram</h1>

        <h1 class="text-3xl font-bold">Welcome Back</h1>
        <p class="text-sm font-semibold text-gray-500">Sign in to continue</p>

        <div class="mt-4 w-full max-w-sm">
            <form method="POST" onsubmit={handleLogin} class="flex flex-col gap-2">
                <!-- Email -->
                <div class="relative">
                     <Mail class="input-icon" size="18"/>

                    <input type="email" bind:value={loginInfo.email} placeholder="Email" class="input-field w-full" required />
                </div>
    
                <!-- Password -->
                <div class="relative">
                    <LockKeyhole class="input-icon" size="18"/>
                    <input 
                    type={showPassword ? 'text' : 'password'} 
                    bind:value={loginInfo.password} placeholder="Password" class="input-field w-full" required />
                    <button type="button" class="absolute right-3 top-3 text-gray-500" onclick={() => showPassword = !showPassword}>
                        {#if showPassword}
                            <Eye size="18"/>
                        {:else}
                            <EyeOff size="18"/>
                        {/if}
                    </button>
                </div>

                <!-- Forgot Password -->
                <div class="text-sm font-semibold text-blue-500 cursor-pointer hover:underline text-right">
                    <a href="/forgot-password">Forgot Password?</a>
                </div>

                 <!-- Login Button -->
                <button disabled={isLoading} type="submit" class="log-btn font-semibold mt-3 flex items-center justify-center gap-2">
                  
                    {#if isLoading}
                        <!-- SVG Loading Spinner -->
                        <svg class="animate-spin h-5 w-full max-w-5 text-white" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loging Account...</span>
                    {:else}
                        <span>login</span>
                    {/if}
                </button>
            </form>

            {#if errorMessage}
                <div transition:fade class="mt-4 p-2 bg-red-500 text-white text-center">
                    {errorMessage}
                </div>
            {/if}
        </div>

        <p class="text-sm text-gray-500 mt-4">Don't have an account? </p>
        <a href="/register"  class="text-blue-500 hover:underline">
            Register
            <ChevronRight class="inline text-blue-500" size="18"/>
        </a>
    </div>
</AuthBackground>