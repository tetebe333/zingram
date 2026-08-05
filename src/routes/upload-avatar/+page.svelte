<script lang="ts">
import { Image } from 'lucide-svelte';
import { ArrowRight, ArrowLeft, Camera  } from 'lucide-svelte';
import { updateUserAvatar } from '$lib/services/auth';
import {goto} from '$app/navigation';
import { loadCurrentUser } from '$lib/services/auth';
import { userStore } from '$lib/stores/user'; 
import {get } from 'svelte/store'

let isLoading = $state(false)

let avatarFile: any = null
const user = get(userStore);
let avatarPreview = $state(
    user?.gender === 'male'
        ? '/male-avatar.PNG'
        : '/female-avatar.PNG'
)
let fileInput: HTMLInputElement;

//image picker
function openFilePicker() {
    fileInput.click();
}

function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    avatarFile = input.files[0];
    avatarPreview = URL.createObjectURL(avatarFile);
    console.log(avatarPreview);
}
async function uploadAvatar() {
    if (!avatarFile) return avatarPreview;

    const formData = new FormData();

    formData.append("file", avatarFile);
    formData.append("upload_preset", "zingram_avatar");

    const response = await fetch(
        "https://api.cloudinary.com/v1_1/k72a60mm/image/upload",
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    return data.secure_url;
}
</script>

<div class="relative flex min-h-screen flex-col items-center justify-center gap-1 px-4 pb-8 text-center text-white">

    <div class="absolute z-10 top-18 left-4 border border-slate-600 rounded-full p-1 hover:bg-slate-700 transition duration-300 ease-in-out">
            <a href="/register">
            <ArrowLeft class="text-white" size="22"/>
            </a>
    </div>
    <h1 class="text-3xl font-extrabold mb-10"><span class="text-blue-500">Z</span>ingram</h1>

    <div class="relative" >
        <button  class="absolute bg-linear-to-r from-blue-600 to-blue-500 z-10 top-30 right-2 border border-white rounded-full p-1 hover:bg-slate-700 transition duration-300 ease-in-out hover:from-blue-500 hover:to-blue-600" onclick={openFilePicker}>
           <Camera /> 
        </button>
        <img class="w-44 h-44 rounded-full border-2 border-[#414663]" src={avatarPreview} alt="" >
        <input type="file" accept="image/*" class="hidden" bind:this={fileInput} onchange={handleFileChange}/>
    </div>

    <h1 class="text-2xl font-bold mt-5">Upload <span class="text-blue-500">Profile Photo</span></h1>

    <div>
        <p class="text-sm font-semibold text-gray-500">Add a profile picture so your</p>
        <p class="text-sm font-semibold text-gray-500">friends can recognize you.</p>
    </div>

    <button onclick={openFilePicker} class="uploadAvataBtn px-20">
        <Image class="inline mb-1 me-1" size="19"/>
        Choose Photo
    </button>

    <button onclick={ async()=>{
        await loadCurrentUser();
        await goto('/home');
    }}  class="text-sm mt-4 font-semibold text-blue-500 hover:underline">
        Skip for now
    </button>

        
    <button 
        onclick={async ()=>{
        
            if (avatarFile){
                isLoading = true;
                const url = await uploadAvatar();
                if (!url) {
                  isLoading = false; 
                  return; 
                }
                await updateUserAvatar(url);
            }

            await loadCurrentUser();
            goto('/home');
            isLoading = false;
        }}
        
        class="uploadAvataBtn px-25">
        {#if isLoading}
            <!-- SVG Loading Spinner -->
            <svg class=" me-2 animate-spin h-5 w-full max-w-5 text-white inline" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="inline">Uploading...</span>
        {:else}
            <span>Continue</span>
            <ArrowRight class="inline ms-1 me-1" size="19" />
        {/if}
        
    </button>

    
</div>
