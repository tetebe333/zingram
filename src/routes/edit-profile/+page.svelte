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
        Link
    } from 'lucide-svelte';

    import { userStore } from '$lib/stores/user';
    import { loadCurrentUser } from '$lib/services/auth';
    import { uploadImage } from '$lib/services/cloudinary';
    import { doc, updateDoc } from 'firebase/firestore';
    import { db } from '$lib/firebase/firebase';
    import { userNameExist} from '$lib/services/auth';


    let isLoading = $state(false);
    let isSaving = $state(false);

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

    let usernameTimeout: ReturnType<typeof setTimeout>;
    let usernameMessage = $state('');
    let usernameAvailable = $state(false);
    onMount(async () => {
        try {

                fullName = $userStore?.fullName ?? '';
                username = $userStore?.username ?? '';
                bio = $userStore?.bio ?? '';
                email = $userStore?.email ?? '';
                dateOfBirth = $userStore?.dateOfBirth ?? '';
                gender = $userStore?.gender ?? '';
                language = $userStore?.language ?? '';
                title = $userStore?.title ?? '';
                website = $userStore?.website ?? '';
                facebook = $userStore?.facebook ?? '';
                instagram = $userStore?.instagram ?? '';
                whatsapp = $userStore?.whatsapp ?? '';

                profileImage =
                    $userStore?.profileImage ?? '/male-avatar.PNG';

            await loadCurrentUser();
            if ($userStore) {
                fullName = $userStore.fullName;
                username = $userStore.username;
                bio = $userStore.bio;
                email = $userStore.email;
                dateOfBirth = $userStore.dateOfBirth;
                gender = $userStore.gender;
                language = $userStore.language;
                title = $userStore.title;
                website = $userStore.website;
                facebook = $userStore.facebook;
                instagram = $userStore.instagram;
                whatsapp = $userStore.whatsapp;

                profileImage =
                    $userStore.profileImage ?? '/male-avatar.PNG';
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

        if (previewImage) {
            URL.revokeObjectURL(previewImage);
        }

        previewImage = URL.createObjectURL(file);

        // Allow selecting the same image again later.
        input.value = '';
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

async function checkUsername() {
	usernameMessage = "";
	usernameAvailable = false;

	clearTimeout(usernameTimeout);

	if (username.trim() == '') return;

	usernameTimeout = setTimeout(async () => {
		const exists = await userNameExist(username);

		if (exists && username !== $userStore?.username) {
			usernameMessage = "❌ Username already exists";
		} else {
			usernameMessage = "✅ Username available";
			usernameAvailable = true;
		}
	}, 500);
}


    async function saveProfile() {
        if (!$userStore?.uid || isSaving) return;


        try {
            isSaving = true;
            //checking user name befer registaring the user
            const exists = await userNameExist(username)
            if (exists && username !== $userStore.username) {
            usernameMessage = '❌ Username already existd'
            window.alert('❌ Username already existd');
            isSaving = false;
            return;  
            }
           

            let updatedProfileImage = profileImage;

            // Upload the image only when Save is clicked.
            if (selectedImage) {
                updatedProfileImage = await uploadImage(selectedImage);
            }

            await updateDoc(
                doc(db, 'users', $userStore.uid),
                {
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
                }
            );

            // Update the local user store immediately.
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

            // Clean up preview URL.
            if (previewImage) {
                URL.revokeObjectURL(previewImage);
            }

            previewImage = null;
            selectedImage = null;
            profileImage = updatedProfileImage;

            goto(`/myProfile/${$userStore.uid}`);

        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            isSaving = false;
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
                disabled={isSaving}
                class="flex min-h-10 items-center gap-1 px-2 text-base font-semibold text-blue-500 disabled:opacity-50"
            >
                {#if isSaving}
                    <div
                        class="h-4 w-4 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500"
                    ></div>

                    <span>Saving...</span>
                {:else}
                    <Save size="18" />
                    <span>Save</span>
                {/if}
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
                    class="absolute bottom-0 right-2.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-500 text-white shadow-lg"
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
                        class="absolute left-2.5 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg"
                    >
                        <X size="16" />
                    </button>

                {/if}

            </div>

        </div>


        <!-- Basic information -->
        <div class="mt-8 space-y-5">

            <!-- Full Name -->
            <div>
                <label
                    for="full-name"
                    class="mb-2 block text-xs font-semibold text-gray-400"
                >
                    Full Name
                </label>

                <input
                    id="full-name"
                    bind:value={fullName}
                    type="text"
                    autocomplete="name"
                    class="w-full rounded-xl border border-[#202D46] bg-[#0B1220] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                />
            </div>


            <!-- Bio -->
            <div>
                <div class="mb-2 flex justify-between">

                    <label
                        for="bio"
                        class="text-xs font-semibold text-gray-400"
                    >
                        Bio
                    </label>

                    <span class="text-[10px] text-gray-500">
                        {bio.length}/120
                    </span>

                </div>

                <textarea
                    id="bio"
                    bind:value={bio}
                    maxlength="120"
                    rows="4"
                    placeholder="Add bio"
                    class="w-full resize-none rounded-xl border border-[#202D46] bg-[#0B1220] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                ></textarea>
            </div>


            <!-- Email -->
            <div>
                <label
                    for="email"
                    class="mb-2 block text-xs font-semibold text-gray-400"
                >
                    Email Address
                </label>

                <input
                    id="email"
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


        <!-- Personal Details -->
        <div class="mt-8 rounded-2xl border border-[#202D46] bg-[#0B1220] px-4 pt-5">

            <div class="mb-5 flex items-center gap-3">

                <div
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15"
                >
                    <Globe size="17" class="text-blue-500" />
                </div>

                <p class="text-sm font-semibold">
                    Personal Details
                </p>

            </div>


            <!-- Username -->
            <div class="border-b border-[#202D46] pb-4">

                <label
                    for="user-name"
                    class="mb-2 block text-xs text-gray-500"
                >
                    Username
                </label>

                <input
                    id="user-name"
                    bind:value={username}
                    oninput={checkUsername}
                    type="text"
                    autocomplete="username"
                    class="w-full rounded-xl border border-[#202D46] bg-[#101827] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                />

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


            <!-- Date of birth -->
            <div class="border-b border-[#202D46] py-4">

                <label
                    for="date-of-birth"
                    class="mb-2 flex items-center gap-2 text-xs text-gray-500"
                >
                    <Calendar size="15" />
                    Date Of Birth
                </label>

                <input
                    id="date-of-birth"
                    bind:value={dateOfBirth}
                    type="date"
                    class="w-full rounded-xl border border-[#202D46] bg-[#101827] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                />

            </div>


            <!-- Gender -->
            <div class="border-b border-[#202D46] py-4">

                <label
                    for="gender"
                    class="mb-2 flex items-center gap-2 text-xs text-gray-500"
                >
                    <VenusAndMars size="15" />
                    Gender
                </label>

                <select
                    id="gender"
                    bind:value={gender}
                    class="w-full rounded-xl border border-[#202D46] bg-[#101827] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>

            </div>


            <!-- Language -->
            <div class="border-b border-[#202D46] py-4">

                <label
                    for="language"
                    class="mb-2 flex items-center gap-2 text-xs text-gray-500"
                >
                    <Globe size="15" />
                    Language
                </label>

                <input
                    id="language"
                    bind:value={language}
                    type="text"
                    class="w-full rounded-xl border border-[#202D46] bg-[#101827] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                />

            </div>


            <!-- Title -->
            <div class="border-b border-[#202D46] py-4">

                <label
                    for="title"
                    class="mb-2 flex items-center gap-2 text-xs text-gray-500"
                >
                    <Briefcase size="15" />
                    Title
                </label>

                <input
                    id="title"
                    bind:value={title}
                    placeholder="MR / MRS"
                    type="text"
                    class="w-full rounded-xl border border-[#202D46] bg-[#101827] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                />

            </div>


            <!-- Website -->
            <div class="border-b border-[#202D46] py-4">

                <label
                    for="website"
                    class="mb-2 flex items-center gap-2 text-xs text-gray-500"
                >
                    <Link size="15" />
                    Website
                </label>

                <input
                    id="website"
                    bind:value={website}
                    type="url"
                    inputmode="url"
                    placeholder="https://..."
                    class="w-full rounded-xl border border-[#202D46] bg-[#101827] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                />

            </div>


            <!-- Facebook -->
            <div class="border-b border-[#202D46] py-4">

                <label
                    for="facebook"
                    class="mb-2 flex items-center gap-2 text-xs text-gray-500"
                >
                    <p class="text-xl font-bold text-blue-600">
                        <i>F</i>
                    </p>

                    Facebook
                </label>

                <input
                    id="facebook"
                    bind:value={facebook}
                    type="url"
                    inputmode="url"
                    placeholder="Add Facebook profile URL"
                    class="w-full rounded-xl border border-[#202D46] bg-[#101827] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                />

            </div>


            <!-- Instagram -->
            <div class="border-b border-[#202D46] py-4">

                <label
                    for="instagram"
                    class="mb-2 flex items-center gap-2 text-xs text-gray-500"
                >
                    <img
                        src="/icons8-instagram-logo-94.png"
                        alt="Instagram"
                        class="h-5 w-5"
                    />

                    Instagram
                </label>

                <input
                    id="instagram"
                    bind:value={instagram}
                    type="url"
                    inputmode="url"
                    placeholder="Add Instagram profile URL"
                    class="w-full rounded-xl border border-[#202D46] bg-[#101827] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                />

            </div>


            <!-- WhatsApp -->
            <div class="py-4">

                <label
                    for="whatsapp"
                    class="mb-2 flex items-center gap-2 text-xs text-gray-500"
                >
                    <img
                        src="/icons8-whatsapp-logo-94.png"
                        alt="WhatsApp"
                        class="h-5 w-5"
                    />

                    WhatsApp
                </label>

                <input
                    id="whatsapp"
                    bind:value={whatsapp}
                    type="tel"
                    inputmode="tel"
                    placeholder="+234..."
                    class="w-full rounded-xl border border-[#202D46] bg-[#101827] px-4 py-3 text-base text-white outline-none focus:border-blue-500"
                />

            </div>

        </div>


        <!-- Bottom Save -->
        <button
            type="button"
            onclick={saveProfile}
            disabled={isSaving}
            class="log-btn font-semibold w-full mt-3 flex items-center justify-center gap-2"
        >
            {#if isSaving}

                <div
                    class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                ></div>

                <span>Saving...</span>

            {:else}

                <Save size="18" />
                <span>Save Changes</span>

            {/if}
        </button>

    {/if}

</div>

<style>
    input[type="date"] {
        width: 100%;
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
    }

    input[type="date"]::-webkit-date-and-time-value {
        width: 100%;
        text-align: left;
    }

    input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(60%);
        width: 20px;
        height: 20px;
    }
</style>