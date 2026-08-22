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

let isLoading = $state(false);
let showPassword = $state(false);
let loginInfo: { email: string; password: string } = $state({ email: '', password: '' });


let showNotification = $state(false);
let notificationTitle = $state('');
let notificationMessage = $state('');
let notificationType = $state<'success' | 'error'>('success');

function showNotificationMessage(
    message: string,
    type: 'success' | 'error' = 'error',
    title?: string
) {
    notificationMessage = message;
    notificationType = type;

    notificationTitle =
        title ?? (type === 'success' ? 'Success' : 'Something went wrong');

    showNotification = true;
}

function closeNotification() {
    showNotification = false;
    notificationTitle = '';
    notificationMessage = '';
}

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
        console.log(error);
        showNotificationMessage(
            'Your Email or password is incorrect, If you think you forgot your passwor click forgot password to reset your password.',
            'error',
            'Invalid Account'
        );
        return;      

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
        </div>

        <p class="text-sm text-gray-500 mt-4">Don't have an account? </p>
        <a href="/register"  class="text-blue-500 hover:underline">
            Register
            <ChevronRight class="inline text-blue-500" size="18"/>
        </a>


    {#if showNotification}
        <div
            class="fixed inset-0 z-100 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
        >
            <div
                class="w-full max-w-sm rounded-2xl  bg-[#0B1220] border border-[#1A2742] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            >
                <!-- Icon -->
                <div
                    class={`flex h-12 w-12 items-center justify-center rounded-full ${
                        notificationType === 'success'
                            ? 'bg-green-200'
                            : 'bg-red-100'
                    }`}
                >
                    {#if notificationType === 'success'}
                        <svg
                            class="h-6 w-6 text-green-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    {:else}
                        <svg
                            class="h-6 w-6 text-red-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M12 9v4m0 4h.01M10.3 3.6l-7.1 12.3A2 2 0 005 19h14a2 2 0 001.8-3.1L13.7 3.6a2 2 0 00-3.4 0z"
                            />
                        </svg>
                    {/if}
                </div>

                <!-- Text -->
                <div class="mt-4">
                    <h2 class="text-lg font-bold text-gray-200">
                        {notificationTitle}
                    </h2>

                    <p class="mt-2 text-sm leading-6 text-gray-200">
                        {notificationMessage}
                    </p>
                </div>

                <!-- OK -->
                <button
                    type="button"
                    onclick={closeNotification}
                    class={`mt-6 w-full rounded-xl py-3 text-sm font-semibold text-white transition ${
                        notificationType === 'success'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                    OK
                </button>
            </div>
        </div>
    {/if} 
    </div>
</AuthBackground>