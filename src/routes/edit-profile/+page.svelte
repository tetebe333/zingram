<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import {
        X,
        Camera,
        Save,
        Calendar,
        VenusAndMars,
        Globe,
        Briefcase,
        Link,
       
        MessageCircle
    } from 'lucide-svelte';

    import { userStore } from '$lib/stores/user';
    import { loadCurrentUser } from '$lib/services/auth';
    import { uploadImage } from '$lib/services/cloudinary';
    import { doc, updateDoc } from 'firebase/firestore';
    import { db } from '$lib/firebase/firebase';

    let isLoading = $state(true);

    let fullName = $state('');
    let username = $state('');
    let bio = $state('');
    let email = $state('');
    let dateOfBirth = $state('');
    let gender = $state('');
    let language = $state('');
    let title = $state('');
    let website = $state('');
    let facebook = $state('');
    let instagram = $state('');
    let whatsapp = $state('');

    let profileImage = $state('');
    let selectedImage = $state<File | null>(null);
    let previewImage = $state<string | null>(null);

    onMount(async () => {
        try {
            await loadCurrentUser();

            if ($userStore) {
                fullName = $userStore.fullName ?? '';
                username = $userStore.username ?? '';
                bio = $userStore.bio ?? '';
                email = $userStore.email ?? '';
                dateOfBirth = $userStore.dateOfBirth ?? '';
                gender = $userStore.gender ?? '';
                language = $userStore.language ?? '';
                title = $userStore.title ?? '';
                website = $userStore.website ?? '';
                facebook = $userStore.facebook ?? '';
                instagram = $userStore.instagram ?? '';
                whatsapp = $userStore.whatsapp ?? '';

                profileImage =
                    $userStore.profileImage ?? '/icons8-user-64.png';
            }
        } catch (error) {
            console.error('Failed to load current user:', error);
        } finally {
            isLoading = false;
        }
    });

    function handleImageChange(event: Event) {
        const input = event.currentTarget as HTMLInputElement;

        const file = input.files?.[0];

        if (!file) return;

        selectedImage = file;

        // Remove previous preview URL
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
        }

        // Only preview locally.
        // Nothing is uploaded yet.
        previewImage = URL.createObjectURL(file);
    }

    function cancelSelectedImage() {
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
        }

        previewImage = null;
        selectedImage = null;
    }

    function goBack() {
        if (!$userStore?.uid) return;

        goto(`/myProfile/${$userStore.uid}`);
    }

   async function saveProfile() {
    if (!$userStore?.uid) return;

    try {
        isLoading = true;

        let updatedProfileImage = profileImage;

        // Upload new profile picture only when Save is clicked
        if (selectedImage) {
            updatedProfileImage = await uploadImage(selectedImage);
        }

        await updateDoc(doc(db, 'users', $userStore.uid), {
            fullName,
            username,
            bio,
            dateOfBirth,
            gender,
            language,
            title,
            website,
            facebook,
            instagram,
            whatsapp,
            profileImage: updatedProfileImage
        });

        // Update local store so the new information is immediately available
        userStore.set({
            ...$userStore,
            fullName,
            username,
            bio,
            dateOfBirth,
            gender,
            language,
            title,
            website,
            facebook,
            instagram,
            whatsapp,
            profileImage: updatedProfileImage
        });

        // Clean up local preview
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
        }

        previewImage = null;
        selectedImage = null;
        profileImage = updatedProfileImage;

        goto(`/myProfile/${$userStore.uid}`);

    } catch (error) {
        console.error('Failed to update profile:', error);
        alert('Failed to update profile: try again')
    } finally {
        isLoading = false;
    }
}

    
</script>


<div class="min-h-screen bg-[#03081A] px-5 pb-10 text-white">

    {#if isLoading}

        <div class="flex min-h-screen items-center justify-center gap-2">
            <div
                class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            ></div>

            <p class="text-sm text-gray-400">
                Loading Edit...
            </p>
        </div>

    {:else}

        <!-- Header -->
        <div class="flex items-center justify-between pt-7">

            <button
                type="button"
                onclick={goBack}
                class="flex h-10 w-10 items-center justify-center rounded-full bg-white/5"
            >
                <X size="22" />
            </button>

            <h1 class="text-lg font-bold">
                Edit Profile
            </h1>

            <button
                type="button"
                onclick={saveProfile}
                class="flex items-center gap-1 text-blue-500"
            >
                <Save size="18" />

                <span class="text-sm font-semibold">
                    Save
                </span>
            </button>

        </div>


        <!-- Profile picture -->
        <div class="mt-8 flex justify-center">

            <div class="relative">

                <img
                    src={previewImage ?? profileImage}
                    alt="Profile"
                    class="h-32 w-32 rounded-full object-cover ring-2 ring-[#202D46]"
                />

                <!-- Camera -->
                <label
                    for="profile-image"
                    class="absolute bottom-0 right-2.5 flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-full bg-blue-500 text-white shadow-lg"
                >
                    <Camera size="19" />

                    <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        class="hidden"
                        onchange={handleImageChange}
                    />
                </label>


                <!-- Cancel selected image -->
                {#if previewImage}

                    <button
                        type="button"
                        onclick={cancelSelectedImage}
                        class="absolute left-2.5 top-0 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-red-500 text-white shadow-lg"
                    >
                        <X size="16" />
                    </button>

                {/if}

            </div>

        </div>


        <!-- Basic information -->
        <div class="mt-8 space-y-5">

            <!-- Full name -->
            <div>
                <label for="full-name" class="mb-2 block text-xs font-semibold text-gray-400">
                    Full Name
                </label>

                <input
                    bind:value={fullName}
                    type="text"
                    class="w-full rounded-xl border border-[#202D46] bg-[#0B1220] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                />
            </div>


            <!-- Bio -->
            <div>
                <div class="mb-2 flex justify-between">
                    <label for="bio" class="text-xs font-semibold text-gray-400">
                        Bio
                    </label>

                    <span class="text-[10px] text-gray-500">
                        {bio.length}/120
                    </span>
                </div>

                <textarea
                    bind:value={bio}
                    maxlength="120"
                    rows="4"
                    class="w-full resize-none rounded-xl border border-[#202D46] bg-[#0B1220] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                ></textarea>
            </div>


            <!-- Email -->
            <div>
                <label for="email" class="mb-2 block text-xs font-semibold text-gray-400">
                    Email Address
                </label>

                <input
                    value={email}
                    type="email"
                    disabled
                    class="w-full cursor-not-allowed rounded-xl border border-[#202D46] bg-[#111827] px-4 py-3 text-base text-gray-500"
                />

                <p class="mt-2 text-[11px] text-gray-600">
                    Email address cannot be changed
                </p>
            </div>

        </div>


        <!-- Account / personal details -->
        <div class="mt-8 rounded-2xl border border-[#202D46] bg-[#0B1220] px-4 pt-5">

            <div class="mb-5 flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15">
                    <Globe size="17" class="text-blue-500" />
                </div>

                <p class="text-sm font-semibold">
                    Personal Details
                </p>
            </div>


            <!-- Username -->
            <div class="border-b border-[#202D46] pb-4">
                <labe for="user-name" class="mb-2 block text-xs text-gray-500">
                    Username
                </labe>

                <input
                    bind:value={username}
                    type="text"
                    class="w-full rounded-xl border border-[#202D46] bg-[#101827] px-4 py-3 text-base outline-none focus:border-blue-500"
                />
            </div>


            <!-- Date of birth -->
            <div class="border-b border-[#202D46] py-4">

                <label for="date-of -birth" class="mb-2 flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size="15" />
                    Date Of Birth
                </label>

                <input
                    bind:value={dateOfBirth}
                    type="date"
                    class="w-full rounded-xl border border-[#202D46] bg-[#101827] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                />

            </div>


            <!-- Gender -->
            <div class="border-b border-[#202D46] py-4">

                <label for="gender" class="mb-2 flex items-center gap-2 text-xs text-gray-500">
                    <VenusAndMars size="15" />
                    Gender
                </label>

                <select
                    bind:value={gender}
                    class="w-full rounded-xl border border-[#202D46] bg-[#101827] px-4 py-3 text-sm text-white outline-none"
                >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>

            </div>


            <!-- Language -->
            <div class="border-b border-[#202D46] py-4">

                <labe for="language" class="mb-2 flex items-center gap-2 text-xs text-gray-500">
                    <Globe size="15" />
                    Language
                </labe>

                <input
                    bind:value={language}
                    type="text"
                    class="w-full rounded-xl border border-[#202D46] bg-[#101827] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                />

            </div>


            <!-- Title -->
            <div class="border-b border-[#202D46] py-4">

                <label for="title" class="mb-2 flex items-center gap-2 text-xs text-gray-500">
                    <Briefcase size="15" />
                    Title
                </label>

                <input
                    bind:value={title}
                    placeholder="MR / MRS"
                    type="text"
                    class="w-full rounded-xl border border-[#202D46] bg-[#101827] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                />

            </div>


            <!-- Website -->
            <div class="border-b border-[#202D46] py-4">

                <label for="website" class="mb-2 flex items-center gap-2 text-xs text-gray-500">
                    <Link size="15" />
                    Website
                </label>

                <input
                    bind:value={website}
                    type="url"
                    placeholder="https://..."
                    class="w-full rounded-xl border border-[#202D46] bg-[#101827] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                />

            </div>


            <!-- Facebook -->
            <div class="border-b border-[#202D46] py-4">

                <label for="facebook" class="mb-2 flex items-center gap-2 text-xs text-gray-500">
                    <!-- <Facebook size="15" /> -->
                     <p class="font-bold text-xl text-blue-600"><i>F</i></p>
                    Facebook
                </label>

                <input
                    bind:value={facebook}
                    type="url"
                    placeholder="Add Facebook profile URL"
                    class="w-full rounded-xl border border-[#202D46] bg-[#101827] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                />

            </div>


            <!-- Instagram -->
            <div class="border-b border-[#202D46] py-4">

                <label for="instagram" class="mb-2 flex items-center gap-2 text-xs text-gray-500">
                    <!-- <Instagram size="15" /> -->
                    <img
                        src="/icons8-instagram-logo-94.png"
                        alt="Instagram"
                        class="h-5 w-5"
                    />
                    Instagram
                </label>

                <input
                    bind:value={instagram}
                    type="url"
                    placeholder="Add Instagram profile URL"
                    class="w-full rounded-xl border border-[#202D46] bg-[#101827] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                />

            </div>


            <!-- WhatsApp -->
            <div class="py-4">

                <label for="whatsapp" class="mb-2 flex items-center gap-2 text-xs text-gray-500">
                    <img
                        src="/icons8-whatsapp-logo-94.png"
                        alt="WhatsApp"
                        class="h-5 w-5"
                    />
                    WhatsApp
                </label>

                <input
                    bind:value={whatsapp}
                    type="text"
                    placeholder="+234..."
                    class="w-full rounded-xl border border-[#202D46] bg-[#101827] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                />

            </div>

        </div>


        <!-- Bottom save -->
        <button
            type="button"
            onclick={saveProfile}
            class="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-4 text-sm font-bold text-white shadow-[0_0_30px_rgba(37,99,235,.25)]"
        >
            <Save size="18" />
            Save Changes
        </button>

    {/if}

</div>