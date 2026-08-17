<script lang="ts">
import { ArrowLeft, ChevronRight, LockKeyhole, Mail, Trash2, TriangleAlert, Send , Eye, EyeOff   } from 'lucide-svelte';
import { goto } from '$app/navigation';
import { userStore } from '$lib/stores/user';
import { onMount } from 'svelte';
import { loadCurrentUser, emailExist, sendResetPasswordEmail, changePassword, changeEmail, verifyCurrentPassword, deleteAccount, usergoto } from '$lib/services/auth';
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from '$lib/firebase/firebase';

 onMount(async () => {
    await usergoto();
    await loadCurrentUser()
 })

let showConfirmDeleteAcc = $state(false);
let showDeleteAccModel = $state(false); 
let showChangeEmalModel = $state(false); 
let showChangePasswordModel = $state(false); 
let showForgetPasswordModel = $state(false); 
let showPassword = $state(false);
let loading = $state(false);

let ForgotPassWordloading = $state(false);

//notification lets
let showNotification = $state(false);
let notificationTitle = $state('');
let notificationMessage = $state('');
let notificationType = $state<'success' | 'error'>('error');

//chane password lets
let currentPassword = $state('');
let newPassword = $state('');
let confirmNewPassword = $state('');
let confirmpasswordIsValid = $state(true);
let passwordIncorrect = $state(false)

//change email lets
let currentEmailPassword = $state('');
let newEmail = $state('');

let deletePassword = $state('')


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
    const email = $userStore?.email;

    if (!email) {
        showNotificationMessage(
            'No email address found.',
            'error',
            'Email Not Found'
        );
        return;
    }

    ForgotPassWordloading = true;

    try {
        await sendResetPasswordEmail(email);

        showNotificationMessage(
            'We sent a password reset link to your email. If you don’t see it shortly, please check your Spam/Junk email folder.',
            'success',
            'Password Reset Link Sent'
        );

        showForgetPasswordModel = false;

    } catch (error) {
        console.error('Failed to send reset password email:', error);

        showNotificationMessage(
            'Unable to send the reset link. Please try again.',
            'error',
            'Reset Link Failed'
        );

    } finally {
        ForgotPassWordloading = false;
    }
}
async function handleChangePassword() {
     passwordIncorrect = false

    if (!currentPassword) {
        showNotificationMessage(
            'Please enter your current password.',
            'error',
            'Missing Password'
        
        );
        return;
    }

    if (!newPassword) {
        showNotificationMessage(
            'Please enter your new password.',
             'error',
            'Missing Password'
        );
        return;
    }

    if (!confirmNewPassword) {
        showNotificationMessage(
            'Please confirm your new password.',
            'error',
            'confirm password'
        );
        return;
    }

    if (newPassword !== confirmNewPassword) {
         confirmpasswordIsValid = false;
        return;
    }

    loading = true;

    try {
        const user = $userStore;

        if (!user?.email) {
            showNotificationMessage(
                'Unable to find your account email.',
                'error',
                'Account not found'
            );
            return;
        }

        // We verify the CURRENT password with Firebase.
        const credential = EmailAuthProvider.credential(
            user.email,
            currentPassword
        );

        const firebaseUser = auth.currentUser;

        if (!firebaseUser) {
            showNotificationMessage(
                'No authenticated user found.',
                'error',
                'User not found'
            );
            return;
        }

        await reauthenticateWithCredential(
            firebaseUser,
            credential
        );

        // Current password is correct.
        // Now change to the new password.
        await changePassword(newPassword);

        showNotificationMessage(
            'Password changed successfully.',
            'success',
            'password changed'
        );

        showChangePasswordModel = false;
        currentPassword = '';
        newPassword = '';
        confirmNewPassword = '';
        confirmpasswordIsValid = true;
        passwordIncorrect = false;
        showPassword = false;
        passwordIncorrect = false
    } catch (error: any) {
        console.error('Change password error:', error);

        if (
            error?.code === 'auth/wrong-password' ||
            error?.code === 'auth/invalid-credential'
        ) {
            passwordIncorrect = true
            return;
        }

        showNotificationMessage(
            'Unable to change password. Please try again.',
            'error',
            'password Change Failed'
        );

    } finally {
        loading = false;
    }
}


//handle change email password
async function handleChangeEmail() {
    passwordIncorrect = false;

    const user = $userStore;

    if (!user?.email) {
        showNotificationMessage(
            'Unable to find your current email address.',
            'error',
            'Account not found'
        );
        return;
    }

    if (!currentEmailPassword) {
        showNotificationMessage(
            'Please enter your current password.',
            'error',
            'Missing Password'
        );
        return;
    }

    if (!newEmail) {
        showNotificationMessage(
            'Please enter your new email address.',
            'error',
            'Missing Email'
        );
        return;
    }

    if (newEmail === user.email) {
        showNotificationMessage(
            'Please enter a different email address.',
            'error',
            'Same Email'
        );
        return;
    }

    loading = true;

    try {
        // Check if the new email already belongs to another account
        const emailAlreadyUsed = await emailExist(newEmail);

        if (emailAlreadyUsed) {
            showNotificationMessage(
                'This email address is already being used by another account.',
                'error',
                'Email Already In Use'
            );
            return;
        }

        // Verify the user's current password
        await verifyCurrentPassword(currentEmailPassword);

        // Send Firebase verification link
        await changeEmail(newEmail);

        showNotificationMessage(
            'We sent a verification link to your new email address. Click the link to complete the change.',
            'success',
            'Verification Link Sent'
        );

        passwordIncorrect = false
        showChangeEmalModel = false;
        currentEmailPassword = '';
        newEmail = '';
        passwordIncorrect = false;

    } catch (error: any) {
        console.error('Change email error:', error);

        // Wrong current password
        if (
            error?.code === 'auth/wrong-password' ||
            error?.code === 'auth/invalid-credential'
        ) {
            passwordIncorrect = true;
            return;
        }

        // Invalid email format
        if (error?.code === 'auth/invalid-email') {
            showNotificationMessage(
                'Please enter a valid email address.',
                'error',
                'Invalid Email'
            );
            return;
        }

        showNotificationMessage(
            'Unable to send the verification link. Please try again.',
            'error',
            'Email Change Failed'
        );

    } finally {
        loading = false;
    }
}


function validateConfirmPassword() {
    if (confirmNewPassword && newPassword !== confirmNewPassword) {
        confirmpasswordIsValid = false;
    } else {
        confirmpasswordIsValid = true;
    }
}

// handle delete user
async function handleDeleteAccount() {
    passwordIncorrect = false;
    loading = true;

    if (!deletePassword) {
        showNotificationMessage(
            'Please enter your current password.',
            'error',
            'Missing Password'
        );
        loading = false;
        return;
    }

    try {
        const currentUser = auth.currentUser;

        if (!currentUser || !currentUser.email) {
            return;
        }

        const credential = EmailAuthProvider.credential(
            currentUser.email,
            deletePassword
        );

        await reauthenticateWithCredential(currentUser, credential);

        
        await deleteAccount();

        deletePassword = '';
        passwordIncorrect = false;
        showDeleteAccModel = false;
        showPassword = false;
        // No success notification.
        goto('/login');

    } catch (error: any) {
        if (
            error.code === 'auth/wrong-password' ||
            error.code === 'auth/invalid-credential'
        ) {
            passwordIncorrect = true;
            return;
        }

        console.error('Delete account error:', error);

    } finally {
        loading = false;
    }
}
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
    <button onclick={()=> showChangePasswordModel = true }
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
    <button  onclick={()=> showChangeEmalModel = true }
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
        <button onclick={()=> showConfirmDeleteAcc = true }
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
                    class="flex-1 rounded-xl bg-red-500 py-3 font-semibold text-white transition hover:bg-[#E63F5B]"
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

                    <div class="relative">
                        <input
                        bind:value={deletePassword}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            class="w-full rounded-xl border border-[#303A55] bg-[#151D32] px-4 py-3 text-white outline-none placeholder:text-[#596278] focus:border-[#4380FF]"
                        />
                        <button type="button" class="absolute right-3 top-3 text-gray-500" onclick={() => showPassword = !showPassword}>
                                    {#if showPassword}
                                <Eye size="18"/>
                            {:else}
                                <EyeOff size="18"/>
                            {/if}
                        </button>
                    </div>   

                    {#if passwordIncorrect}
                        <p class="mt-2 text-sm font-medium text-red-600">
                            Your password is incorrect !
                        </p>
                    {/if}
                </div>

                <button disabled={loading} onclick={handleDeleteAccount}
                class="mt-6 w-full rounded-xl bg-red-500 py-3 font-semibold text-white transition hover:bg-[#E63F5B] flex justify-center items-center gap-2"
                >
                    {#if loading}
                        <!-- SVG Loading Spinner -->
                        <svg class="animate-spin h-5 w-full max-w-5 text-white" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Deleting...</span>
                    {:else}
                        <span>Delete Account</span>
                    {/if}
                </button>

                <button  onclick={()=>{
                    deletePassword = '';
                    passwordIncorrect = false;
                    showDeleteAccModel = false;
                    showPassword = false;
                }}
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

                <p class="mt-3 text-sm leading-6 text-[#8A93A8]">
                  Enter your current password and your new email address. And We’ll send a verification link to your new email address. Click the link to confirm and complete the email change.
                </p>

                <!-- Current Password -->
                <div class="mt-6">
                    <label for="password" class="mb-2 block text-sm font-semibold text-[#A4ABBC]">
                        Current Password
                    </label>

                    <div class="relative">
                        <input
                        bind:value={currentEmailPassword}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your current password"
                            class="w-full rounded-xl border border-[#303A55] bg-[#151D32] px-4 py-3 text-white outline-none placeholder:text-[#596278] focus:border-[#4380FF]"
                        />
                        <button type="button" class="absolute right-3 top-3 text-gray-500" onclick={() => showPassword = !showPassword}>
                                        {#if showPassword}
                                    <Eye size="18"/>
                                {:else}
                                    <EyeOff size="18"/>
                                {/if}
                        </button>
                    </div>   

                      <!-- Error -->
                    {#if passwordIncorrect}
                        <p class="mt-2 text-sm font-medium text-red-600">
                            Your password is incorrect !
                        </p>
                    {/if}
              
                </div>

                <!-- New Email -->
                <div class="mt-5">
                    <label for="email" class="mb-2 block text-sm font-semibold text-[#A4ABBC]">
                        New Email
                    </label>

                    <input
                        bind:value={newEmail}
                        type="email"
                        placeholder="Enter your new email"
                        class="w-full rounded-xl border border-[#303A55] bg-[#151D32] px-4 py-3 text-white outline-none placeholder:text-[#596278] focus:border-[#4380FF]"
                    />
                </div>

                <!-- Change Email Button -->
                <button onclick={handleChangeEmail}
                class="mt-6 w-full rounded-xl bg-[#4380FF] py-3 font-semibold text-white transition hover:bg-[#356FE5] flex justify-center items-center gap-2"
                >
                  {#if loading}
                    <!-- SVG Loading Spinner -->
                    <svg class="animate-spin h-5 w-full max-w-5 text-white" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending...</span>
                    {:else}
                        <span>Send Verification Link</span>
                        <Send size="16" />
                    {/if}
                </button>

                <!-- Cancel -->
                <button onclick={()=>{
                    passwordIncorrect = false;
                    showChangeEmalModel = false;
                    currentEmailPassword = '';
                    newEmail = '';
                    loading = false;
                    showPassword = false;
                }}
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
                    <div class="relative">
                        <input
                            bind:value={currentPassword}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your current password"
                            class="fInput"
                        />
                        <button type="button" class="absolute right-3 top-3 text-gray-500" onclick={() => showPassword = !showPassword}>
                                    {#if showPassword}
                                    <Eye size="18"/>
                                {:else}
                                    <EyeOff size="18"/>
                                {/if}
                        </button>
                    </div>    

                    <!-- Error -->
                    {#if passwordIncorrect}
                        <p class="mt-2 text-sm font-medium text-red-600">
                            Your password is incorrect !
                        </p>
                    {/if}
                </div>

                <!-- New Password -->
                <div class="mt-5">
                    <label for="password" class="mb-2 block text-sm font-semibold text-[#A4ABBC]">
                        New Password
                    </label>

                    <div class="relative">
                        <input
                            bind:value={newPassword}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your new password"
                            class="fInput"
                        />
                        <button type="button" class="absolute right-3 top-3 text-gray-500" onclick={() => showPassword = !showPassword}>
                            {#if showPassword}
                                <Eye size="18"/>
                            {:else}
                                <EyeOff size="18"/>
                            {/if}
                        </button>
                    </div>    
                </div>
               

                <!-- Confirm New Password -->
                <div class="mt-5">
                <label for="password" class="mb-2 block text-sm font-semibold text-[#A4ABBC]">
                    Confirm New Password
                </label>

                <div class="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        bind:value={confirmNewPassword}
                        oninput={validateConfirmPassword}
                        placeholder="Confirm your new password"
                        class="{confirmNewPassword && !confirmpasswordIsValid ? 'finput-fieldInvalid' : 'fInput'} w-full"
                    />
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
                        type="button" onclick={handleChangePassword}
                        class="rounded-xl bg-[#4380FF] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#356FE5] flex justify-center items-center gap-2"
                    >
                        {#if loading}
                            <!-- SVG Loading Spinner -->
                            <svg class="animate-spin h-5 w-full max-w-5 text-white" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Changing...</span>
                        {:else}
                            <span>Change Password</span>
                        {/if}
                    </button>

                    <button onclick={()=>{
                        showPassword = false;
                        showChangePasswordModel = false;
                        currentPassword = '';
                        newPassword = '';
                        confirmNewPassword = '';
                        confirmpasswordIsValid = true;
                        passwordIncorrect = false
                    }}
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

            <button onclick={handleForgotPassword}
                type="button"
                class="flex justify-center items-center gap-2 rounded-xl bg-[#4380FF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#356FE5]"
            >

                {#if ForgotPassWordloading}
                    <!-- SVG Loading Spinner -->
                    <svg class="animate-spin h-5 w-full max-w-5 text-white" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending...</span>
                {:else}
                    <span>Send Reset Link</span>
                    <Send size="16" />
                {/if}

            </button>

            </div>

        </div>
    </div>
     {/if}

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


<style>
    @keyframes slideDown {
    from {
        opacity: 0;
        transform: translate(-50%, -20px);
    }

    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}
</style>
