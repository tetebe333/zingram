<script lang="ts">
import { goto } from "$app/navigation";
import { Pencil, Camera, Mail, User, Calendar, VenusAndMars, Globe, BriefcaseBusiness, Link, LogOut, ShieldCheck } from "lucide-svelte";
import { userStore } from "$lib/stores/user";
import { signOut } from 'firebase/auth';
import { auth } from '$lib/firebase/firebase';
import { setOffline } from "$lib/services/presence";

async function logout() {
    try {

        await setOffline()
        await signOut(auth);
        goto('/login');
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

function openEditProfile() {
    goto("/edit-profile");
}

function openHome() {
    goto("/home");
}
</script>


<div class="min-h-screen bg-[#03081A] text-white px-5 pb-32">

    <!-- Header -->
    <div class="flex justify-between items-center pt-6">

        <button
            onclick={openHome}
            class="flex items-center gap-1 text-white"
        >
            <span class="text-xl">←</span>
            <span class="text-sm font-semibold">Home</span>
        </button>

        <button
            onclick={openEditProfile}
            class="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#101A30] border border-[#1C2942] text-white"
        >
            <Pencil size="17" />
            <span class="text-sm font-semibold">Edit</span>
        </button>

    </div>


    <!-- Profile Header -->
    <div class="relative mt-4 rounded-2xl bg-linear-to-br from-[#162443] via-[#0B1730] to-[#03081A] p-5">

        <div class="flex items-center gap-5">

            <!-- Profile Picture -->
            <div class="relative shrink-0">

                <img
                    src={$userStore?.profileImage ?? "/male-avatar.PNG"}
                    alt={$userStore?.fullName ?? "Profile"}
                    class="w-32 h-32 rounded-full object-cover"
                />

                <!-- Camera opens edit profile -->
                <button
                    onclick={openEditProfile}
                    class="absolute bottom-0 right-0 flex items-center justify-center w-11 h-11 rounded-full bg-white text-[#07132A] border-4 border-[#0B1730] shadow-lg"
                >
                    <Camera size="20" />
                </button>

            </div>


            <!-- User Info -->
            <div class="flex flex-col gap-2 min-w-0">

                <p class="text-xl font-bold capitalize truncate">
                    {$userStore?.fullName ?? "Unknown user"}
                </p>

                <p class="text-sm text-gray-300 font-medium">
                    @{$userStore?.username ?? "username"}
                </p>

                {#if $userStore?.bio}
                    <p class="text-xs text-gray-400 font-medium">
                        {$userStore.bio}
                    </p>
                {/if}

            </div>

        </div>


        <!-- Email -->
        <div class="mt-5 rounded-xl bg-[#101B31] border border-[#202D46] p-4 flex items-center gap-4">

            <div class="flex items-center justify-center w-11 h-11 rounded-full bg-[#123A83]">
                <Mail size="20" class="text-blue-300" />
            </div>

            <div class="flex flex-col">
                <p class="text-white text-sm font-medium">
                    {$userStore?.email ?? "ftbjf@gmail.com"}
                </p>

                <p class="text-xs text-gray-400 mt-1">
                    Email address
                </p>
            </div>

        </div>

    </div>


    <!-- Details -->
    <div class="bg-[#0B1220] rounded-2xl px-4 pt-5 border border-[#202D46] mt-4">

        <!-- Section title -->
        <div class="flex gap-3 items-center mb-4">

            <div class="flex items-center justify-center">
                <ShieldCheck size="22" class="text-blue-400" />
            </div>

            <p class="text-white text-sm font-semibold">
                Details
            </p>

        </div>


        <!-- Username -->
        <div class="flex justify-between pb-4 pt-1 items-center border-b border-[#202D46]">

            <div class="flex gap-3 items-center text-gray-300">
                <User size="19" />
                <span>Username</span>
            </div>

            <p class="text-gray-200">
                @{$userStore?.username ?? "username"}
            </p>

        </div>


        <!-- Full Name -->
        <div class="flex justify-between py-4 items-center border-b border-[#202D46]">

            <div class="flex gap-3 items-center text-gray-300">
                <User size="19" />
                <span>Full Name</span>
            </div>

            <p class="text-gray-200 capitalize">
                {$userStore?.fullName ?? "Unknown"}
            </p>

        </div>


        <!-- Date Of Birth -->
        <div class="flex justify-between py-4 items-center border-b border-[#202D46]">

            <div class="flex gap-3 items-center text-gray-300">
                <Calendar size="19" />
                <span>Date Of Birth</span>
            </div>

            <p class="text-gray-200">
                {#if $userStore?.dateOfBirth}
                    {new Date($userStore.dateOfBirth + "T00:00:00").toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                    }).replace(",", "")}
                {:else}
                    —
                {/if}
            </p>

        </div>


        <!-- Gender -->
        <div class="flex justify-between py-4 items-center border-b border-[#202D46]">

            <div class="flex gap-3 items-center text-gray-300">
                <VenusAndMars size="19" />
                <span>Gender</span>
            </div>

            <p class="text-gray-200 capitalize">
                {$userStore?.gender ?? "—"}
            </p>

        </div>


        <!-- Language -->
        <div class="flex justify-between py-4 items-center border-b border-[#202D46]">

            <div class="flex gap-3 items-center text-gray-300">
                <Globe size="19" />
                <span>Language</span>
            </div>

            <p class="text-gray-200">
                {$userStore?.language ?? "English"}
            </p>

        </div>


        <!-- Title -->
        <div class="flex justify-between py-4 items-center border-b border-[#202D46]">

            <div class="flex gap-3 items-center text-gray-300">
                <BriefcaseBusiness size="19" />
                <span>Title</span>
            </div>

             {#if $userStore?.website}
                <p class="text-gray-200">
                    {$userStore?.title ?? "—"}
                </p>
            {:else}
                <button onclick={openEditProfile}
                class="text-gray-400 underline">
                     Add title
                 </button>
            {/if}

        </div>


        <!-- Website -->

            <div class="flex justify-between py-4 items-center border-b border-[#202D46]">

                <div class="flex gap-3 items-center text-gray-300">
                    <Link size="19" />
                    <span>Website</span>
                </div>

                {#if $userStore?.website}
                    <a
                        href={$userStore.website}
                        target="_blank"
                        class="text-blue-400 hover:underline max-w-[55%] truncate underline sm:no-underline"
                    >
                        {$userStore.website}
                    </a>
                {:else}
                  <button onclick={openEditProfile} class="text-blue-400 underline max-w-[55%] truncate">Add website</button>
                {/if}

            </div>



        <!-- Facebook -->
       

            <div class="flex justify-between py-4 items-center border-b border-[#202D46]">

                <div class="flex gap-3 items-center text-gray-300">
                    <img
                        src="/icons8-facebook-48.png"
                        alt="Facebook"
                        class="h-5 w-5"
                    />
                    <span>Facebook</span>
                </div>

                 {#if $userStore?.facebook}
                    <a
                        href={$userStore.facebook}
                        target="_blank"
                        class="text-blue-400 hover:underline max-w-[55%] truncate underline sm:no-underline"
                    >
                        www.{$userStore.username}.facebook.com
                    </a>
                {:else}
                    <button onclick={openEditProfile} class="text-blue-400 underline max-w-[55%] truncate">Add facebook</button>
                {/if}

            </div>



        <!-- Instagram -->
            <div class="flex justify-between py-4 items-center border-b border-[#202D46]">

                <div class="flex gap-3 items-center text-gray-300">
                    <img
                        src="/icons8-instagram-logo-94.png"
                        alt="Instagram"
                        class="h-5 w-5"
                    />
                    <span>Instagram</span>
                </div>
                {#if $userStore?.instagram}
                    <a
                        href={$userStore.instagram}
                        target="_blank"
                        class="text-blue-400 hover:underline max-w-[55%] truncate underline sm:no-underline"
                    >
                        www.{$userStore.username}.instagram.com
                    </a>
                {:else}
                    <button onclick={openEditProfile} class="text-blue-400 underline max-w-[55%] truncate">Add instagram</button>

                {/if}

            </div>



        <!-- WhatsApp -->
            <div class="flex justify-between py-4 items-center border-b border-[#202D46]">

                <div class="flex gap-3 items-center text-gray-300">
                    <img
                        src="/icons8-whatsapp-logo-94.png"
                        alt="WhatsApp"
                        class="h-5 w-5"
                    />
                    <span>WhatsApp</span>
                </div>

                {#if $userStore?.whatsapp}
                    <a
                        href={`https://wa.me/${$userStore.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-blue-400 hover:underline max-w-[55%] truncate underline sm:no-underline"
                    >
                        {$userStore.whatsapp}
                    </a>
                {:else}
                    <button onclick={openEditProfile} class="text-blue-400 underline max-w-[55%] truncate">Add whatsapp</button>

                {/if}
            </div>


        <!-- Member Since -->
        <div class="flex justify-between py-4 items-center">

            <div class="flex gap-3 items-center text-gray-300">
                <Calendar size="19" />
                <span>Member Since</span>
            </div>

          
          <p class="text-gray-200 capitalize">
            {#if $userStore?.createdAt}
                {$userStore.createdAt.toDate().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }).replace(",", "")}
            {:else}
                —
            {/if}
        </p>

             

        </div>

    </div>


    <!-- Settings & Privacy -->
    <button
        class="w-full mt-4 bg-[#0B1220] rounded-2xl px-4 py-5 border border-[#202D46] flex items-center justify-between"
    >

        <div class="flex flex-col items-start">
            <p class="text-white font-semibold">
                Settings & Privacy
            </p>

            <p class="text-xs text-gray-500 mt-1">
                Manage your account, privacy, and preferences
            </p>
        </div>

        <span class="text-gray-400 text-xl">
            ›
        </span>

    </button>


    <!-- Logout -->
    <button onclick={logout}
        class="w-full mt-4 rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-5 flex items-center gap-4 text-left"
    >

        <div class="text-red-400">
            <LogOut size="22" />
        </div>

        <div>
            <p class="text-red-400 font-semibold">
                Log Out
            </p>

            <p class="text-xs text-gray-500 mt-1">
                Log out of your account on this device
            </p>
        </div>

    </button>

</div>