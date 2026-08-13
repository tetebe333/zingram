<script lang="ts">
import { ArrowLeft, ChevronRight, LockKeyhole, Mail, Trash2, TriangleAlert, Send    } from 'lucide-svelte';
import { goto } from '$app/navigation';
import { userStore } from '$lib/stores/user';
import { loadCurrentUser } from '$lib/services/auth';
import { onMount } from 'svelte';

 onMount(async () => {
    await loadCurrentUser()
 })

let showConfirmDeleteAcc = $state(false);
let showDeleteAccModel = $state(false); 
let showChangeEmalModel = $state(false); 
let showChangePasswordModel = $state(false); 
let showForgetPasswordModel = $state(false); 




</script>
<div class="relative py-12 px-4">
    <!-- header -->
    <div class="flex relative text-white items-center justify-center">
        <button class="absolute left-0" onclick={()=>goto(`/myProfile/${$userStore?.uid}`)}>
             <ArrowLeft size="20"/>
        </button>
        <h1 class="font-bold text-xl">Settings</h1>
    </div>
    <p class="text-sm text-gray-500 font-medium text-center my-3">
        Manage your account and security settings
    </p>

    <!-- change password btn -->
    <button onclick={()=> showChangePasswordModel = true}
    class="w-full text-gray-500 relative mt-4 rounded-2xl bg-[#0B1220] p-5 border-2 border-[#1A2742]">
        <div class="flex items-center justify-between">
            <!-- left div -->
             <div class="flex gap-4">
                <div class="p-3 h-12 mt-1.5 bg-blue-500/15 rounded-xl border-2 border-blue-500/10">
                    <LockKeyhole class="text-blue-500" size="20"/>
                </div>
                <div class="flex flex-col text-start">
                    <h1 class="font-bold text-md text-gray-300">Change Password</h1>
                    <p class="text-xs font-medium">
                        Update your password to <br> keep your account secure
                    </p>
                </div>
             </div>
            <!-- right div -->
            <ChevronRight size="20"/>
        </div>
    </button>

    <!-- change email btn -->
    <button  onclick={()=> showChangeEmalModel = true}
    class="text-gray-500 relative mt-4 rounded-2xl w-full bg-[#0B1220] p-5 border-2 border-[#1A2742]">
        <div class="flex items-center justify-between">
            <!-- left div -->
             <div class="flex gap-4">
                <div class="p-3 h-12 mt-1.5 bg-purple-500/15 rounded-xl border-2 border-purple-500/10">
                    <Mail  class="text-purple-500" size="20"/>
                </div>
                <div class="flex flex-col text-start">
                    <h1 class="font-bold text-md text-gray-300">Change Email Address</h1>
                    <p class="text-xs font-medium">
                        Update your email address <br> associated with your account
                    </p>
                </div>
             </div>
            <!-- right div -->
            <ChevronRight size="20"/>
        </div>
    </button>

    <div class="flex items-center gap-6 px-2 mt-7">
        <div class="h-px flex-1 bg-[#1E2A46]"></div>

        <span class="text-[#8A93AA] text-xs font-medium whitespace-nowrap">
            Account Management
        </span>

        <div class="h-px flex-1 bg-[#1E2A46]"></div>
    </div>

    <!-- delete acc box -->
    <div class="text-gray-500 relative mt-5 rounded-2xl bg-[#160F1D] p-5 border-2 border-red-300/10">
        <!-- delete acc btn -->
        <button onclick={()=> showConfirmDeleteAcc = true}
        class="flex items-center justify-between w-full">
            <!-- left div -->
             <div class="flex gap-4">
                <div class="p-3 h-12 mt-1.5 bg-red-500/10 rounded-xl border-2 border-red-300/10">
                    <Trash2   class="text-red-400/70" size="20"/>
                </div>
                <div class="flex flex-col text-start">
                    <h1 class="font-bold text-md text-red-400/70">Delete Account</h1>
                    <p class="text-xs font-medium">
                        Update your email address <br> associated with your account
                    </p>
                </div>
             </div>
            <!-- right div -->
            <ChevronRight class="text-red-400/70" size="20"/>
        </button>

        <div class="text-gray-500 relative mt-5 rounded-2xl bg-[#241525]/80 p-5 border-2 border-red-300/10">
            <div class="flex items-center justify-between">
                <!-- left div -->
                <div class="flex gap-4 items-center">
                     <TriangleAlert  class="text-red-400/70 " size="22"/>
                    <div class="flex flex-col">
                        <h1 class="font-semibold text-sm text-red-400/70 mb-0.5">This action  cannot be undone.</h1>
                        <p class="text-xs font-medium">
                            All your data including messages and <br> profile information will be permanetly <br> deleted.
                        </p>
                    </div>
                </div>
            
            </div>
        </div>
        
    </div>

    <!-- confirm delete acc model -->
    {#if showConfirmDeleteAcc}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div class="w-full max-w-md rounded-2xl border border-[#303A55] bg-[#0D1428] p-6 shadow-2xl">

                <h2 class="text-xl font-bold text-white">
                Delete Account?
                </h2>

                <p class="mt-3 text-sm leading-6 text-[#8A93A8]">
                Are you sure you want to delete your account? This action cannot be undone.
                All your messages and profile information will be permanently deleted.
                </p>

                <div class="mt-6 flex gap-3">
                <button onclick={()=> showConfirmDeleteAcc = false}
                    class="flex-1 rounded-xl border border-[#303A55] bg-[#171F35] py-3 font-semibold text-white transition hover:bg-[#202A43]"
                >
                    Discard
                </button>

                <button onclick={()=>{
                  showDeleteAccModel = true;
                  showConfirmDeleteAcc = false;
                }}
                    class="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-[#E63F5B]"
                >
                    Delete
                </button>
                </div>

            </div>
        </div>
    {/if}


    <!-- delete acc model  -->
    {#if showDeleteAccModel}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div class="w-full max-w-md rounded-2xl border border-[#303A55] bg-[#0D1428] p-6 shadow-2xl">

                <h2 class="text-xl font-bold text-white">
                Enter Password to Continue
                </h2>

                <p class="mt-2 text-sm text-[#8A93A8]">
                Enter your password to confirm that you want to permanently delete your account.
                </p>

                <div class="mt-6">
                <label for="password" class="mb-2 block text-sm font-semibold text-[#A4ABBC]">
                    Password
                </label>

                <input
                    type="password"
                    placeholder="Enter your password"
                    class="w-full rounded-xl border border-[#303A55] bg-[#151D32] px-4 py-3 text-white outline-none placeholder:text-[#596278] focus:border-[#4380FF]"
                />

                <!-- Show this only when password is incorrect -->
                <p class="mt-2 text-sm font-medium text-red-600">
                    Your password is incorrect !
                </p>
                </div>

                <button
                class="mt-6 w-full rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-[#E63F5B]"
                >
                Delete Account
                </button>

                <button  onclick={()=> showDeleteAccModel = false}
                class="mt-3 w-full py-2 text-sm font-semibold text-[#71809D] transition hover:text-white"
                >
                Cancel
                </button>

            </div>
        </div>
    {/if}

    <!-- change email model -->
    {#if showChangeEmalModel} 
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div class="w-full max-w-md rounded-2xl border border-[#303A55] bg-[#0D1428] p-6 shadow-2xl">

                <!-- Header -->
                <h2 class="text-xl font-bold text-white">
                Change Email
                </h2>

                <p class="mt-2 text-sm text-[#8A93A8]">
                Enter your current password and your new email address.
                </p>

                <!-- Current Password -->
                <div class="mt-6">
                <label for="password" class="mb-2 block text-sm font-semibold text-[#A4ABBC]">
                    Current Password
                </label>

                <input
                    type="password"
                    placeholder="Enter your current password"
                    class="w-full rounded-xl border border-[#303A55] bg-[#151D32] px-4 py-3 text-white outline-none placeholder:text-[#596278] focus:border-[#4380FF]"
                />

                <!-- Show only when password is incorrect -->
                <p class="mt-2 text-sm font-medium text-red-600">
                    Your password is incorrect.
                </p>
                </div>

                <!-- New Email -->
                <div class="mt-5">
                <label for="email" class="mb-2 block text-sm font-semibold text-[#A4ABBC]">
                    New Email
                </label>

                <input
                    type="email"
                    placeholder="Enter your new email"
                    class="w-full rounded-xl border border-[#303A55] bg-[#151D32] px-4 py-3 text-white outline-none placeholder:text-[#596278] focus:border-[#4380FF]"
                />
                </div>

                <!-- Change Email Button -->
                <button
                class="mt-6 w-full rounded-xl bg-[#4380FF] py-3 font-semibold text-white transition hover:bg-[#356FE5]"
                >
                Change Email
                </button>

                <!-- Cancel -->
                <button onclick={()=> showChangeEmalModel = false}
                class="mt-3 w-full py-2 text-sm font-semibold text-[#71809D] transition hover:text-white"
                >
                Cancel
                </button>

            </div>
        </div>
    {/if}


    <!-- change password model -->
    {#if showChangePasswordModel}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div class="w-full max-w-md rounded-2xl border border-[#303A55] bg-[#0D1428] p-6 shadow-2xl">

                <!-- Header -->
                <h2 class="text-xl font-bold text-white">
                Change Password
                </h2>

                <p class="mt-2 text-sm text-[#8A93A8]">
                Update your password to keep your account secure.
                </p>

                <!-- Current Password -->
                <div class="mt-6">
                <label for="password" class="mb-2 block text-sm font-semibold text-[#A4ABBC]">
                    Current Password
                </label>

                <input
                    type="password"
                    placeholder="Enter your current password"
                    class="w-full rounded-xl border border-[#303A55] bg-[#151D32] px-4 py-3 text-white outline-none placeholder:text-[#596278] focus:border-[#4380FF]"
                />

                <!-- Error -->
                <p class="mt-2 text-sm font-medium text-red-600">
                    Your password is incorrect.
                </p>
                </div>

                <!-- New Password -->
                <div class="mt-5">
                <label for="password" class="mb-2 block text-sm font-semibold text-[#A4ABBC]">
                    New Password
                </label>

                <input
                    type="password"
                    placeholder="Enter your new password"
                    class="w-full rounded-xl border border-[#303A55] bg-[#151D32] px-4 py-3 text-white outline-none placeholder:text-[#596278] focus:border-[#4380FF]"
                />
                </div>

                <!-- Confirm New Password -->
                <div class="mt-5">
                <label for="password" class="mb-2 block text-sm font-semibold text-[#A4ABBC]">
                    Confirm New Password
                </label>

                <input
                    type="password"
                    placeholder="Confirm your new password"
                    class="w-full rounded-xl border border-[#303A55] bg-[#151D32] px-4 py-3 text-white outline-none placeholder:text-[#596278] focus:border-[#4380FF]"
                />

                <!-- Forgot Password -->
                <div class="mt-2 flex justify-end">
                    <button onclick={()=> showForgetPasswordModel = true}
                    type="button"
                    class="text-sm font-semibold text-blue-600 hover:text-blue-500"
                    >
                    Forgot password?
                    </button>
                </div>
                </div>

                <!-- Buttons -->
                <div class="mt-7 flex items-center justify-start gap-3">

                    <button
                        type="button"
                        class="rounded-xl bg-[#4380FF] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#356FE5]"
                    >
                        Change Password
                    </button>

                    <button onclick={()=> showChangePasswordModel = false}
                        type="button"
                        class="rounded-xl px-5 py-3 text-sm font-semibold text-[#8A93A8] transition hover:text-white"
                    >
                        Cancel
                    </button>

                </div>

            </div>
        </div>
    {/if}

    <!-- forget passord Model -->
    {#if showForgetPasswordModel}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div class="w-full max-w-sm rounded-2xl border border-[#303A55] bg-[#0D1428] p-6 shadow-2xl">

            <!-- Header -->
            <h2 class="text-xl font-bold text-white">
            Forgot Password?
            </h2>

            <!-- Message -->
            <p class="mt-3 text-sm leading-6 text-[#8A93A8]">
            We’ll send you a link to your email to reset your password.
            </p>

            <!-- Actions -->
            <div class="mt-7 flex items-center justify-end gap-3">

            <button onclick={()=> showForgetPasswordModel = false}
                type="button"
                class="rounded-xl px-5 py-3 text-sm font-semibold text-[#8A93A8] transition hover:text-white"
            >
                Cancel
            </button>

            <button
                type="button"
                class="flex items-center gap-2 rounded-xl bg-[#4380FF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#356FE5]"
            >
                Send Reset Link

                <Send size="16" />
            </button>

            </div>

        </div>
    </div>
     {/if}

</div>

