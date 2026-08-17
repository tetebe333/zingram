<script lang="ts">
import AuthBackground from '$lib/components/layout/AuthBackground.svelte';
import zingramLogo from '$lib/assets/zingram-logo.png';
import { UserRoundPlus } from 'lucide-svelte';
import { CalendarDays } from 'lucide-svelte';
import { AtSign } from 'lucide-svelte';
import { Mail } from 'lucide-svelte';
import { LockKeyhole } from 'lucide-svelte';
import { Eye } from 'lucide-svelte';
import { EyeOff } from 'lucide-svelte';
import { ChevronRight } from 'lucide-svelte';
import { ChevronLeft } from 'lucide-svelte';
import { NonBinary } from 'lucide-svelte';
import { ChevronDown } from 'lucide-svelte';
import { type Gender } from '$lib/types/user';
import {goto} from '$app/navigation';
import { fade } from 'svelte/transition';
import { registerUser, userNameExist} from '$lib/services/auth';

//user infor
const user = $state({
    fullName: '',
    username: '',
    dob: '2006-12-24',
    email: '',
    password: '',
    avatar: '',
    gender: '' as Gender,
});
let maleAvatar = '/male-avatar.PNG';
let femaleAvatar = '/female-avatar.PNG';
let usernameTimeout: ReturnType<typeof setTimeout>;
let usernameMessage = $state('');
let usernameAvailable = $state(false);

// Keeps track of the active timer
let isLoading = $state(false);
let confirmPassword = $state('');
let showPassword = $state(false);
let confirmpasswordIsValid = $state(true);

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
// Function to open the date picker

function validateConfirmPassword() {
    if (confirmPassword && user.password !== confirmPassword) {
        confirmpasswordIsValid = false;
    } else {
        confirmpasswordIsValid = true;
    }
}

async function checkUsername() {
	usernameMessage = "";
	usernameAvailable = false;

	clearTimeout(usernameTimeout);

	if (!user.username.trim()) return;

	usernameTimeout = setTimeout(async () => {
		const exists = await userNameExist(user.username);

		if (exists) {
			usernameMessage = "❌ Username already exists";
		} else {
			usernameMessage = "✅ Username available";
			usernameAvailable = true;
		}
	}, 500);
}

async function handleRegister(event: Event) {
    event.preventDefault(); 
    
    try {

        validateConfirmPassword();
        if (!confirmpasswordIsValid) {
            return;
        }

        // Start loading state
        isLoading = true;
        //checking user name befer registaring the user
        const exists = await userNameExist(user.username)
        if (exists) {
           usernameMessage = '❌ Username already existd';
            showNotificationMessage(
                'User name already exist, try using a different one',
                'error',
                'Username Exists'
            );
           return;  
        }


         //setting user avatar
        user.avatar = user.gender === 'male' ? maleAvatar : femaleAvatar;
        

        //registring user
        await registerUser(user);
        // Redirect to login page after successful registration
        goto('/upload-avatar');
        user.avatar = '';
    } catch (error: any) {
        console.error('Registration failed:', error);
       
        if (error?.code === 'auth/email-already-in-use') {
            showNotificationMessage(
                'This email address is already being used by another account.',
                'error',
                'Email Already In Use'
            );
            return;
        }

        if (error?.code === 'auth/weak-password') {
            showNotificationMessage(
                'Password should be at least 6 characters.',
                'error',
                'Weak Password'
            );
            return;
        }
         
        showNotificationMessage(
            'Registration failed. Please try again..',
            'error',
            'Registration failed'
        );
         
        }finally {
            // Stop loading state
            isLoading = false;
        }
   
}

</script>

<AuthBackground>    
    <div class="relative flex min-h-screen flex-col items-center justify-center gap-0 px-4 pb-15 text-center text-white">
       <div class="absolute z-10 top-11 left-4 border border-slate-600 rounded-full p-1 hover:bg-slate-700 transition duration-300 ease-in-out">
            <a href="/">
            <ChevronLeft class="text-white" size="22"/>
            </a>
       </div>
        
        <div class="relative flex items-center top-5 ">
            <img width="100" height="100" src={zingramLogo} alt="Zingram Logo"/>
        </div>
        <h1 class="text-3xl font-bold"><span class="text-blue-500">Z</span>ingram</h1>
        <h1 class="text-2xl font-bold">Create Account</h1>
        <p class="text-sm font-bold text-gray-500">Join Zingram today and</p>
        <p class="text-sm font-bold text-gray-500">start connecting!</p>

        <div class="mt-4 w-full max-w-sm">
            <!-- form -->
            <form method="POST" action="/register" class="flex flex-col gap-2" onsubmit={handleRegister}>
                <!-- Full name -->
                 <div class="relative">
                    <UserRoundPlus class="input-icon" size="18"/>
                    <input type="text" bind:value={user.fullName} name="full_name" placeholder="Full Name" class="input-field w-full" required />
                 </div>

                <!-- Username -->
                <div class="relative">
                <AtSign class="input-icon" size="18"/>
                <input type="text" oninput={checkUsername} bind:value={user.username} name="username" placeholder="Username" class="input-field w-full" required />
                </div>

                {#if usernameMessage}
                    <p
                        class="mt-1 text-left text-xs font-medium"
                        class:text-green-500={usernameAvailable}
                        class:text-red-500={!usernameAvailable}
                    >
                      {usernameMessage}
                    </p>
                {/if}

                 <!-- Email -->
                <div class="relative">
                    <Mail class="input-icon" size="18"/>
                    <input type="email" bind:value={user.email} name="email" placeholder="Email" class="input-field w-full" required />
                </div>

                <div class="flex gap-2 justify-between min-w-0">
                    <!-- Date of Birth -->
                    <div class="relative w-94 min-w-0">
                        <CalendarDays class="input-icon" size="18"/>

                        <input
                            type="date"
                            bind:value={user.dob}
                            name="dob"
                            class="input-field  text-gray-500 font-semibold"
                            required
                        />
                    </div>

                     <!-- Gender -->
                    <div class="relative w-full min-w-0">
                        <NonBinary class="input-icon" size="18"/>
                        <ChevronDown class="absolute right-3 top-3 text-gray-500" size="18"/>
                        <select  name="gender" bind:value={user.gender} class="appearance-none input-field w-full text-gray-500" required>
                             <ChevronDown class="absolute right-3 top-3 text-gray-500" size="18"/>
                            <option value="" disabled selected hidden><span>Select Gender</span></option>
                            <option class="text-gray-500" value="male">Male</option>
                            <option class="text-gray-500" value="female">Female</option>
                        </select>
                    </div>
                </div>

                <!-- Password -->
                <div class="relative">
                    <LockKeyhole class="input-icon" size="18"/>
                    <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password" bind:value={user.password} placeholder="Password" class="input-field w-full" required />
                    <button type="button" class="absolute right-3 top-3 text-gray-500" onclick={() => showPassword = !showPassword}>
                        {#if showPassword}
                            <Eye size="18"/>
                        {:else}
                            <EyeOff size="18"/>
                        {/if}
                    </button>
                </div>

                <!-- Confirm Password -->
                <div class="relative">
                    <LockKeyhole class="input-icon" size="18"/>
                    <input 
                         oninput={validateConfirmPassword}
                        type={showPassword ? 'text' : 'password'}
                        name="confirm_password" bind:value={confirmPassword} placeholder="Confirm Password" class="{confirmPassword && !confirmpasswordIsValid ? 'input-fieldInvalid' : 'input-field'} w-full" required />

                    <button type="button" class="absolute right-3 top-3 text-gray-500" onclick={() => showPassword = !showPassword}>
                        {#if showPassword}
                            <Eye size="18"/>
                        {:else}
                            <EyeOff size="18"/>
                        {/if}
                    </button>    
                </div>
                <!-- Password Mismatch Error -->
                <p class="text-red-500 text-sm text-start">
                    {#if !confirmpasswordIsValid}
                    Passwords do not match
                    {/if}
                </p>

                <!-- Register Button -->
                <button disabled={isLoading} type="submit" class="log-btn font-semibold mt-3 flex items-center justify-center gap-2">
                  
                    {#if isLoading}
                        <!-- SVG Loading Spinner -->
                        <svg class="animate-spin h-5 w-full max-w-5 text-white" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Creating Account...</span>
                    {:else}
                        <span>Create Account</span>
                    {/if}
                </button>
            </form>
        </div>

        <div class="mt-4 flex items-center gap-2 ">
            <div class="border-b border-slate-700 w-40"></div>
            <p class="text-sm text-gray-500 font-semibold inline">OR</p> 
            <div class="border-b border-slate-700 w-40"></div>
        </div>

        <p class="text-sm text-gray-500 font-semibold">Already have an account? </p>
        <a href="/login" class="text-blue-500 hover:underline font-semibold">
            Login
            <ChevronRight class="inline-block" size="16"/>
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

<style>
   input[type="date"] {
    -webkit-appearance: none;
    appearance: none;
    display: block;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
    font-size: 16px;
}

input[type="date"]::-webkit-date-and-time-value {
    width: 100%;
    text-align: left;
}

input[type="date"]::-webkit-calendar-picker-indicator {
    width: 20px;
    height: 20px;
    filter: invert(60%);
}

    input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(60%);
        width: 20px;
        height: 20px;
    }
</style>