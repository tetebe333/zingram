<script lang="ts">
import lock from '$lib/assets/lock.png';
import {
    Mail,
    Send,
    ChevronLeft,
    ChevronRight
} from 'lucide-svelte';

import { sendResetPasswordEmail } from '$lib/services/auth';

let email = $state('');
let loading = $state(false);

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

async function handleForgotPassword() {
    if (!email.trim()) {
        return;
    }

    loading = true;

    try {
        await sendResetPasswordEmail(email.trim());

        showNotificationMessage(
            'We sent a password reset link to your email. If you don’t see it shortly, please check your Spam/Junk email folder.',
            'success',
            'Password Reset Link Sent'
        );

        email = '';

    } catch (error: any) {
        console.error('Forgot password error:', error);

        if (error?.code === 'auth/user-not-found') {
            showNotificationMessage(
                'We couldn’t find an account with this email address.',
                'error',
                'Invalid Email'
            );
            return;
        }

        showNotificationMessage(
            'Unable to send the password reset link right now. Please check your connection and try again.',
            'error',
            'Reset Link Failed'
        );

    } finally {
        loading = false;
    }
}
</script>

<div class="relative" style="padding-top: 100px;">
     <div class="absolute z-10 top-11 left-4 border border-slate-600 rounded-full p-1 hover:bg-slate-700 transition duration-300 ease-in-out">
            <a href="/login">
            <ChevronLeft class="text-white" size="22"/>
            </a>
       </div>   
     <div class="z-10 text-white text-center " style=";">
        <h1 style="margin-bottom: -120px;" class="text-2xl  font-semibold"><span class="text-blue-500">Z</span>ingram</h1>
        <div class="flex justify-center">
        <img style="width: 280px; height: 420px;" src={lock} alt="lock icon" >        </div>

        <h1 style="margin-top: -140px;" class="text-2xl  font-semibold mt-10">Forgot Password?</h1>
    </div>

    <div class="text-center mb-6">
        <h1 class="text-sm font-semibold text-gray-500">Eenter your email address and we'll</h1>
        <h1 class="text-sm font-semibold text-gray-500">send you a link to reset your password.</h1>
    </div>

    <form
    onsubmit={(event) => {
        event.preventDefault();
        handleForgotPassword();
    }}
    style="padding:0 35px; 0 35px"
    class="text-gray-500"
    >
        <!-- Email -->
        <label class="text-start font-semibold text-sm" for="email">Email address:</label>
        <div class="relative">
            <Mail class="fogInput-icon" size="18"/>
            <input bind:value={email} type="email" name="email" placeholder="Enter your email" class="fogInput-field w-full" required />
        </div>
            <button type="submit" disabled={loading} class="log-btn w-full  font-semibold mt-4 flex items-center justify-center gap-2">
                {#if loading}
                    <!-- SVG Loading Spinner -->
                    <svg class="animate-spin h-5 w-full max-w-5 text-white" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending...</span>
                {:else}
                    <span>Send Reset Link</span>
                    <Send size="14" />
                {/if}
            </button>
    </form> 

    <div class="mt-8 text-center">
        <h1 class="text-sm font-semibold text-gray-500">Remember your password?</h1>
        <a href="/login" class="text-blue-500 hover:underline font-semibold">
            Back to Login
            <ChevronRight class="inline-block" size="16"/>
        </a>
    </div>

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

