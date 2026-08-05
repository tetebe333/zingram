<script lang="ts">
//svelte-ignore non_reactive_update
let messageContainer: HTMLDivElement;
import { 
ArrowLeft ,
MessageCircleMore, Plus, Camera, Mic , Image , Video, FileText, Send, X, Trash2,Square , Play,

ToyBrick

} from 'lucide-svelte';
import { page }  from '$app/state' 
import {onMount, onDestroy, tick}  from 'svelte'
import { loadConversation, sendMessage} from '$lib/services/chat'
import {chatUserStore} from '$lib/stores/chatUser'
import { auth } from '$lib/firebase/firebase';
import { loadChatUser } from '$lib/services/auth';
import { loadMessages } from '$lib/services/messages';
import { messagesStore } from '$lib/stores/messages';
import { userStore } from '$lib/stores/user';
  import { uploadAudio, uploadImage, uploadVideo, uploadDocument} from '$lib/services/cloudinary';
let loadingProfile = $state(false);
let unsubscribe: (() => void) | undefined

const conversationId: any = $derived(page.params.conversationId);

function scrollToBottom() {
    if (!messageContainer) return;

    requestAnimationFrame(() => {
        messageContainer.scrollTop = messageContainer.scrollHeight;
    })
    
    
}

$effect(() =>{
    $messagesStore;

    tick().then(()=> {
        scrollToBottom();
    })
})

onMount(async ()=> {
    loadingProfile = true;
   const conversation = await loadConversation(conversationId);

   //load all message
    unsubscribe = loadMessages(conversationId);
    const currentUid = auth.currentUser?.uid;
 

    //getting chat user info
    const otherUserUid = conversation.participants.find(
        uid => uid !== currentUid
    );

    if (otherUserUid) {
        await loadChatUser(otherUserUid);
    }
    loadingProfile = false;

    await tick();
    scrollToBottom();
})

onDestroy(() => {
    // Stop Firestore listener
    unsubscribe?.();

    // Stop message audio completely
    if (messageAudio) {
        messageAudio.pause();
        messageAudio.currentTime = 0;

        // Remove audio source
        messageAudio.src = '';

        // Remove event listeners
        messageAudio.onended = null;
        messageAudio.ontimeupdate = null;
        messageAudio.onloadedmetadata = null;

        // Clear audio reference
        messageAudio = null;
    }

    // Stop message audio progress interval
    if (messageAudioInterval) {
        clearInterval(messageAudioInterval);
        messageAudioInterval = undefined;
    }

    // Reset playback state
    playingMessageId = null;
    messageAudioPlaying = false;
    messageAudioCurrentTime = 0;
    messageAudioProgress = 0;
});

//recording timer let
let recordingSecond = $state(0);
let recordingTimer: ReturnType<typeof setInterval> | undefined;
let recordedDuration = $state<number | null>(null);

let audioBlob: Blob | null = null;
let audioUrl = $state('')

//preview play let
let previewAudio: HTMLAudioElement | null = null;
let isPlayingPreview = $state(false);

//preview Progress
let previewProgress = $state(0);
let previewCurrentTime = $state(0);
let previewInterval: ReturnType<typeof setInterval> | undefined;

// normal chat audio player
let messageAudio: HTMLAudioElement | null = null;
let playingMessageId = $state<string | null>(null);
let messageAudioPlaying = $state(false);
let messageAudioCurrentTime = $state(0);
let messageAudioProgress = $state(0);
let messageAudioInterval: ReturnType<typeof setInterval> | undefined;
let messagePlaybackSpeed = $state(1);

//recording lets
let mediaRecorder: MediaRecorder;
let audioChunks: Blob[] = [];
let inputMode = $state<'normal' | 'recording' |'preview'>('normal');

//video lets
//svelte-ignore non_reactive_update
let videoInput: HTMLInputElement;
let selectedVideo = $state<File | null>(null);
let videoPreviewUrl = $state('');
let sendingMessage = $state(false)

const bars = [4,6,5,7,4,8,5,9,6,5,7,4,6,8,5,7,4,6,5,8];
let online = true;
let messageText = $state('');
//svelte-ignore non_reactive_update
let textareaRef: HTMLTextAreaElement;
let showAttachmentMenu = $state(false)
const sdbars = [
		4,6,5,7,4,8,5,9,6,5,
		7,4,6,8,5,7,4,6,5,8,
		6,5,7,8,5,6,4,7,5,6,
		5,7,6,4,5,6,5,4
	];

let progress = 18; // bars already played

//document lets
const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024;
//svelte-ignore non_reactive_update
let documentInput: HTMLInputElement;
let selectedDocument = $state<File | null>(null);
let documentName = $state('');
let documentSize = $state(0);



//image lets
//svelte-ignore non_reactive_update
let imageInput: HTMLInputElement;
let selectedImage = $state<File | null>(null);
let imagePreviewUrl = $state('');
const hasSomethingToSend = $derived(
    messageText.trim().length > 0 || 
    selectedImage !== null ||
    selectedVideo !== null ||
    selectedDocument !== null
);



// Automatically grow the textarea to fit long text up to a maximum height
  function autoGrow() {
    if (!textareaRef) return;

    // Reset height to calculate accurately
    textareaRef.style.height = 'auto';
    
    // Calculate new height based on scroll bounds (max out at 160px)
    const newHeight = Math.min(textareaRef.scrollHeight, 160);
    textareaRef.style.height = `${newHeight}px`;
  }

  async function handleSendMessage() {
    sendingMessage = true;
    try {

        // IMAGE MESSAGE
        if (selectedImage) {

            try {
                // Upload image to Cloudinary
                const fileUrl = await uploadImage(selectedImage);

                console.log("🖼️ Image uploaded:", fileUrl);

                // Send image message
                await sendMessage(
                    conversationId,
                    messageText.trim() || null,
                    'image',
                    fileUrl
                );

                // Clear image preview
                if (imagePreviewUrl) {
                    URL.revokeObjectURL(imagePreviewUrl);
                }

                imagePreviewUrl = '';
                selectedImage = null;

                // Clear file input
                if (imageInput) {
                    imageInput.value = '';
                }

                // Clear caption
                messageText = '';
                autoGrow();

            } catch (error) {
                console.error("❌ Image upload failed:", error);
            }

            return;
        }

        // VIDEO MESSAGE
        if (selectedVideo) {

            try {
            
                // Upload video to Cloudinary
                const fileUrl = await uploadVideo(selectedVideo);

                console.log("🎥 Video uploaded:", fileUrl);

                // Send video message
                await sendMessage(
                    conversationId,
                    messageText.trim() || null,
                    "video",
                    fileUrl
                );

                // Clear preview
                if (videoPreviewUrl) {
                    URL.revokeObjectURL(videoPreviewUrl);
                }

                videoPreviewUrl = "";
                selectedVideo = null;

                // Clear file input
                if (videoInput) {
                    videoInput.value = "";
                }

                // Clear caption
                messageText = "";
                autoGrow();

            } catch (error) {

                console.error("❌ Video upload failed:", error);

            } 
            return;
        }

        // DOCUMENT MESSAGE
        if (selectedDocument) {

            try {

                // Upload document to Cloudinary
                const fileUrl = await uploadDocument(selectedDocument);

                // Send document message
                await sendMessage(
                    conversationId,
                    messageText.trim() || null,
                    "document",
                    fileUrl
                );

                // Clear document preview
                selectedDocument = null;
                documentName = "";
                documentSize = 0;

                // Clear file input
                if (documentInput) {
                    documentInput.value = "";
                }

                // Clear caption
                messageText = "";
                autoGrow();

            } catch (error) {

                console.error("❌ Document upload failed:", error);

            }

            return;
        }

        // NORMAL TEXT MESSAGE
        if (!messageText.trim()) return;

        
        await sendMessage(
            conversationId,
            messageText
        );

        messageText = '';
        autoGrow();
    }finally{
        sendingMessage = false;
    }
}

  //start recording function
  async function startRecording() {
    previewProgress = 0;
    previewCurrentTime = 0;
    isPlayingPreview = false
    recordingSecond = 0;
    recordedDuration = null;
    //ask for adio permission
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
    });

    audioChunks = [];

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunks.push(event.data);
        }
    };

    mediaRecorder.onstart = () => {
        inputMode = 'recording'
    };

    mediaRecorder.onstop = () => {
        inputMode = 'preview'

        stream.getTracks().forEach(track => track.stop());

        audioBlob = new Blob(audioChunks, {
            type: mediaRecorder.mimeType
        });

        audioUrl = URL.createObjectURL(audioBlob);

        console.log("🎙️ Recording finished:", audioBlob);
    };

    mediaRecorder.start();
    recordingTimer = setInterval(() => {
        recordingSecond +=1;
    }, 1000);
}


function stopRecording() {
    mediaRecorder?.stop();

    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = undefined;
    }
    inputMode = 'preview';
    recordedDuration = recordingSecond;
}

function deletRecording() {
    // Stop timer
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = undefined;
    }

    // Stop preview interval
    if (previewInterval) {
        clearInterval(previewInterval);
        previewInterval = undefined;
    }

    // Stop preview audio if it's playing
    if (previewAudio) {
        previewAudio.pause();
        previewAudio.currentTime = 0;
        previewAudio = null;
    }

    // Release browser memory for the local URL
    if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        audioUrl = '';
    }

    // Clear recording data
    audioBlob = null;
    audioChunks = [];

    // Reset preview state
    previewProgress = 0;
    previewCurrentTime = 0;
    isPlayingPreview = false;

    // Reset UI
    inputMode = 'normal';
    recordingSecond = 0;
    recordedDuration = null;
}

async function sendRecording() {

    if(!audioBlob) return;
    if (recordedDuration === null) return

    try{
         //retun to normal input
        inputMode = 'normal';

        //stop preview playback immediatly
        if (previewAudio) {
            previewAudio.pause();
            previewAudio.currentTime = 0;
            previewAudio = null;
        }

        // Stop preview interval
        if (previewInterval) {
            clearInterval(previewInterval);
            previewInterval = undefined;
        }

        //upload audio to Cloudinary
        const fileUrl = await uploadAudio(audioBlob);
        console.log('🎙️ Audio uploaded:', fileUrl);

        //save audio message to firestore
        await sendMessage(
            conversationId,
            null,
            'audio',
            fileUrl,
            recordedDuration
        );

        //clear the local recording
        audioBlob = null;
        audioChunks = [];

        //reset preview
        recordingSecond = 0;
        recordedDuration = null;


    } catch (error){
        console.log('❌ Audio upload failed :', error);
    }
    
    
}

//play audio preview
function playPreview() {
    if (!audioUrl) return;

    if (!previewAudio) {
        previewAudio = new Audio(audioUrl);

        previewAudio.onended = () => {
            isPlayingPreview = false;

            if (previewInterval) {
                clearInterval(previewInterval);
                previewInterval = undefined;
            }

            previewCurrentTime = 0;
            previewProgress = 0;
        };
    }

    if (isPlayingPreview) {
        previewAudio.pause();

        if (previewInterval) {
            clearInterval(previewInterval);
            previewInterval = undefined;
        }

        isPlayingPreview = false;
    } else {
        previewAudio.play();
        isPlayingPreview = true;

        previewInterval = setInterval(() => {

            previewCurrentTime = Math.floor(previewAudio!.currentTime);

            const percentage =
                previewAudio!.currentTime / previewAudio!.duration;

                previewProgress = Math.floor(
                    percentage * sdbars.length
                );

        }, 100);
    }
}

//start Message Audio Timer
function startMessageAudioTimer() {

    if (!messageAudio) return;

    if (messageAudioInterval) {
        clearInterval(messageAudioInterval);
    }

    messageAudioInterval = setInterval(() => {

        if (!messageAudio) return;

        messageAudioCurrentTime = Math.floor(
            messageAudio.currentTime
        );

        const duration = messageAudio.duration;

        if (duration && Number.isFinite(duration)) {

            const percentage =
                messageAudio.currentTime / duration;

            messageAudioProgress = Math.floor(
                percentage * sdbars.length
            );
        }

    }, 100);
}

//play normal chat audio
function toggleMessageAudio(message: any) {

    if (!message.fileUrl) return;

    // Same audio was clicked
    if (
        messageAudio &&
        playingMessageId === message.id
    ) {

        if (messageAudioPlaying) {

            // Pause current audio
            messageAudio.pause();

            if (messageAudioInterval) {
                clearInterval(messageAudioInterval);
                messageAudioInterval = undefined;
            }

            messageAudioPlaying = false;

        } else {

            // Resume current audio
            messageAudio.play();
            messageAudioPlaying = true;

            startMessageAudioTimer();
        }

        return;
    }


    // A different audio was clicked
    if (messageAudio) {
        messageAudio.pause();
        messageAudio.currentTime = 0;
    }

    if (messageAudioInterval) {
        clearInterval(messageAudioInterval);
        messageAudioInterval = undefined;
    }


    // Create the new audio
    messageAudio = new Audio(message.fileUrl);
    messageAudio.playbackRate = messagePlaybackSpeed;

    playingMessageId = message.id;
    messageAudioCurrentTime = 0;
    messageAudioProgress = 0;
    messageAudioPlaying = true;


    messageAudio.onended = () => {

        messageAudioPlaying = false;
        messageAudioCurrentTime = 0;
        messageAudioProgress = 0;
        playingMessageId = null;

        if (messageAudioInterval) {
            clearInterval(messageAudioInterval);
            messageAudioInterval = undefined;
        }

    };


    messageAudio.play();

    startMessageAudioTimer();
}

function changePlaybackSpeed() {
    if (messagePlaybackSpeed === 1) {
        messagePlaybackSpeed = 1.5;
    } else if (messagePlaybackSpeed === 1.5) {
         messagePlaybackSpeed = 2
    } else {
        messagePlaybackSpeed = 1;
    }

    if (messageAudio) {
        messageAudio.playbackRate = messagePlaybackSpeed;
    }
}

//open image picker
function openImagePicker() {
    imageInput.click();
}

//open video picker
function openVideoPicker() {
    videoInput.click();
}

//open document picker
function openDocumentPicker() {
    documentInput.click();
}

function handleImageChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    selectedImage = input.files[0];

    imagePreviewUrl = URL.createObjectURL(selectedImage);
}

function handleVideoChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";

    tempVideo.onloadedmetadata = () => {

        URL.revokeObjectURL(tempVideo.src);

        // Maximum 1 minute
        if (tempVideo.duration > 60) {

            alert("Please upload a video that is 1 minute or less.");

            selectedVideo = null;
            videoPreviewUrl = "";

            if (videoInput) {
                videoInput.value = "";
            }

            return;
        }

        selectedVideo = file;
        videoPreviewUrl = URL.createObjectURL(file);
    };

    tempVideo.src = URL.createObjectURL(file);
}

function handleDocumentChange(event: Event) {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // 50 MB limit
    if (file.size > MAX_DOCUMENT_SIZE) {

        alert("Please select a document smaller than 50 MB.");

        if (documentInput) {
            documentInput.value = "";
        }

        return;
    }

    selectedDocument = file;

    documentName = file.name;

    documentSize = file.size;
}




</script>





<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="relative" onclick={()=> showAttachmentMenu = false}>
    <div class="pt-6 fixed z-40 w-full justify-between border-b border-b-white/5 pb-2 bg-[#010713] flex px-4">

        {#if loadingProfile}
            <p class="text-gray-400 mb-2">Loading profile</p>
        {:else}
         <div class="flex gap-4 ">
                <a class="text-white mt-4" href="/home">
                    <ArrowLeft   size="22"/>
                </a>
            <img class="w-12 h-12 rounded-full" src={$chatUserStore?.profileImage ?? '/male-avatar.PNG'} alt="avata">
            <div>
                <p class="text-sm font-semibold text-gray-300">{$chatUserStore?.fullName}</p>
                <p class="text-xs font-semibold text-gray-500">{$chatUserStore?.username}</p>
                {#if $chatUserStore?.online}
                <p class="text-xs font-semibold text-green-500">online</p>
                {:else}
                <p class="text-xs font-semibold text-gray-500">Last seen today at 2:35 AM</p>
                {/if}

            </div>
            {#if $chatUserStore?.online}
            <div class="h-3 w-3 bg-green-500 rounded-full absolute top-15 left-22"></div>
            {/if}
        </div>
        {/if}
        
        
    </div>

    {#if loadingProfile}
       <p class="text-gray-400 flex justify-center items-center text-center  pt-60">Loading Measages...</p>
    {:else}
    {#if $messagesStore.length === 0}
        <div class="flex-col justify-center items-center text-center gap-2 pt-60">
                <p class="flex justify-center items-center text-center mb-12"><span><MessageCircleMore class="text-[#2f3e69] "  size="100"/></span></p>
                <h1 class="text-2xl font-bold text-white -mt-10">No conversations yet</h1>
                <h1 class="text-sm font-semibold text-gray-500">Start your first conversation by</h1>
                <h1 class="text-sm font-semibold text-gray-500">sending your first message.</h1> 
        </div>
    {:else} 
  <div
    bind:this={messageContainer}
    class="fixed top-0 bottom-0 left-0 py-25 px-4 right-0 overflow-y-auto
    [&::-webkit-scrollbar]:hidden
    [-ms-overflow-style:none]
    scrollbar-none"
>
        {#each $messagesStore as message}

            {#if message.senderId === auth.currentUser?.uid}

                <!-- MY MESSAGE -->
                <div class="flex justify-end mb-3 w-full min-w-0">

                    <div
                        class="bg-blue-700 px-4 py-2 text-white  rounded-2xl w-fit max-w-[85%] min-w-0 rounded-br-none"
                    >

                        {#if message.type === 'text'}

                            <!-- TEXT -->
                            <p>{message.text}</p>

                        {:else if message.type === 'audio'}

                            <!-- AUDIO -->
                            <div class="flex items-center gap-2 w-full min-w-0">

                                <button
                                    onclick={() => toggleMessageAudio(message)}
                                    class="px-1.5 py-1.5 rounded-full border border-blue-300 flex items-center justify-center shrink-0"
                                >
                                    {#if playingMessageId === message.id && messageAudioPlaying}
                                        <Square size="15" strokeWidth="2.5"/>
                                    {:else}
                                        <Play size="15" strokeWidth="2.5"/>
                                    {/if}
                                </button>

                                <p class="text-xs whitespace-nowrap shrink-0">
                                    {#if playingMessageId === message.id}
                                        {String(Math.floor(messageAudioCurrentTime / 60)).padStart(2, '0')}:{String(messageAudioCurrentTime % 60).padStart(2, '0')}
                                    {:else}
                                        {String(Math.floor((message.duration ?? 0) / 60)).padStart(2, '0')}:{String((message.duration ?? 0) % 60).padStart(2, '0')}
                                    {/if}
                                </p>

                                <div class="flex items-center gap-[2px] flex-1 min-w-0 overflow-hidden">
                                    {#each sdbars as bar, i}
                                        <div
                                            class={`w-0.5 shrink-0 rounded-full ${
                                                playingMessageId === message.id &&
                                                i <= messageAudioProgress
                                                    ? 'bg-white'
                                                    : 'bg-blue-300/60'
                                            }`}
                                            style={`height:${bar * 2.5}px`}
                                        ></div>
                                    {/each}
                                </div>

                                <button
                                    onclick={changePlaybackSpeed}
                                    class="text-[10px] font-bold text-white px-1.5 py-1 rounded-md bg-white/15"
                                >
                                    {messagePlaybackSpeed}×
                                </button>

                            </div>

                        {:else if message.type === 'image'}

                            <!-- IMAGE -->
                            <div class="space-y-2 -mx-3 -mt-1 w-fit max-w-60 block">

                                <img
                                    src={message.fileUrl}
                                    alt="phtot"
                                    class="rounded-xl w-60 max-w-full object-cover"
                                />

                                {#if message.text}
                                    <p class="text-sm rap-break-word px-1">
                                        {message.text}
                                    </p>
                                {/if}

                            </div>

                        {:else if message.type === 'video'}

                            <!-- VIDEO -->
                            <div class="space-y-2 -mx-3 -mt-1 w-fit max-w-60 block">

                                <!-- svelte-ignore a11y_media_has_caption -->
                                <video
                                    src={message.fileUrl}
                                    controls
                                    preload="metadata"
                                    class="rounded-xl w-60 max-w-full object-cover"
                                ></video>

                                {#if message.text}
                                    <p class="text-sm wrap-break-word px-1">
                                        {message.text}
                                    </p>
                                {/if}

                            </div>    

                            {:else if message.type === 'document'}

                            <!-- DOCUMENT -->
                            <a
                                href={message.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="flex items-center gap-3 bg-blue-800/30 rounded-xl p-3 w-60 hover:bg-blue-800/50 transition -mx-3 -mt-1"
                            >

                                <div class="bg-blue-600 p-2 rounded-lg">
                                    <FileText size="24" />
                                </div>

                                <div class="flex-1 min-w-0">

                                    <p class="text-sm font-medium truncate">
                                        Document
                                    </p>

                                    <p class="text-xs text-blue-200">
                                        Tap to open
                                    </p>

                                </div>

                            </a>

                            {#if message.text}
                                <p class="text-sm wrap-break-word mt-2">
                                    {message.text}
                                </p>
                            {/if}

                        {/if}

                        

                        <p class="text-[10px] mt-1 text-right opacity-70">
                            {message.createdAt?.toDate().toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit"
                            })}
                        </p>

                    </div>

                </div>

            {:else}

                <!-- THEIR MESSAGE -->
                <div class="flex justify-start mb-3 w-full min-w-0">

                    <div
                        class="bg-[#1F2937] text-white px-4 py-2 rounded-2xl w-fit max-w-[85%] min-w-0 rounded-bl-none"
                    >

                        {#if message.type === 'text'}

                            <!-- TEXT -->
                            <p>{message.text}</p>

                        {:else if message.type === 'audio'}

                            <!-- AUDIO -->
                            <div class="flex items-center gap-2 w-full min-w-0">

                                <button
                                    onclick={() => toggleMessageAudio(message)}
                                    class="px-1.5 py-1.5 rounded-full border border-[#2A4B9A] flex items-center justify-center text-[#2F80FF]"
                                >
                                    {#if playingMessageId === message.id && messageAudioPlaying}
                                        <Square size="15" strokeWidth="2.5"/>
                                    {:else}
                                        <Play size="15" strokeWidth="2.5"/>
                                    {/if}
                                </button>

                                <p class="text-xs text-gray-400 whitespace-nowrap shrink-0">
                                    {#if playingMessageId === message.id}
                                        {String(Math.floor(messageAudioCurrentTime / 60)).padStart(2, '0')}:{String(messageAudioCurrentTime % 60).padStart(2, '0')}
                                    {:else}
                                        {String(Math.floor((message.duration ?? 0) / 60)).padStart(2, '0')}:{String((message.duration ?? 0) % 60).padStart(2, '0')}
                                    {/if}
                                </p>

                                <div class="flex items-center gap-[2px] flex-1 min-w-0 overflow-hidden">
                                    {#each sdbars as bar, i}
                                        <div
                                            class={`w-0.5 shrink-0 rounded-full ${
                                                playingMessageId === message.id &&
                                                i <= messageAudioProgress
                                                    ? 'bg-[#2F80FF]'
                                                    : 'bg-[#7D8698]'
                                            }`}
                                            style={`height:${bar * 2.5}px`}
                                        ></div>
                                    {/each}
                                </div>

                                <button
                                    onclick={changePlaybackSpeed}
                                    class="text-[10px] font-bold text-white px-1.5 py-1 rounded-md bg-white/10"
                                >
                                    {messagePlaybackSpeed}×
                                </button>

                            </div>

                        {:else if message.type === 'image'}

                            <!-- IMAGE -->
                            <div class="space-y-2 -mx-3 -mt-1 w-fit max-w-60 block">

                                <img
                                    src={message.fileUrl}
                                    alt="photot"
                                    class="rounded-xl w-60 max-w-full object-cover"
                                />

                                {#if message.text}
                                    <p class="text-sm wrap-break-word px-1">
                                        {message.text}
                                    </p>
                                {/if}

                            </div>

                        {:else if message.type === 'video'}

                            <!-- VIDEO -->
                            <div class="space-y-2 -mx-3 -mt-1 w-fit max-w-60 block">

                                <!-- svelte-ignore a11y_media_has_caption -->
                                <video
                                    src={message.fileUrl}
                                    controls
                                    preload="metadata"
                                    class="rounded-xl w-60 max-w-full object-cover"
                                ></video>

                                {#if message.text}
                                    <p class="text-sm wrap-break-word px-1">
                                        {message.text}
                                    </p>
                                {/if}

                            </div>   
                            
                            {:else if message.type === 'document'}

                            <!-- DOCUMENT -->
                            <a
                                href={message.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="flex items-center gap-3 bg-[#2B3548] rounded-xl p-3 w-60 hover:bg-[#36445c] transition -mx-3 -mt-1"
                            >

                                <div class="bg-blue-700 p-2 rounded-lg">
                                    <FileText size="24" />
                                </div>

                                <div class="flex-1 min-w-0">

                                    <p class="text-sm font-medium truncate">
                                        Document
                                    </p>

                                    <p class="text-xs text-gray-400">
                                        Tap to open
                                    </p>

                                </div>

                            </a>

                            {#if message.text}
                                <p class="text-sm wrap-break-word mt-2">
                                    {message.text}
                                </p>
                            {/if}

                        {/if}

                         <p class="text-[10px] mt-1 text-right opacity-70">
                            {message.createdAt?.toDate().toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit"
                            })}
                        </p>

                    </div>

                </div>

            {/if}

        {/each}
</div>
            
    {/if} 


     <!-- image input -->
     <input type="file" onchange={handleImageChange} bind:this={imageInput} accept="image/*" class="hidded" />
     <input type="file" onchange={handleVideoChange} bind:this={videoInput} accept="video/*" class="hidded" />
    <input type="file" bind:this={documentInput} onchange={handleDocumentChange} accept=".pdf,.doc,.docx,.txt,.zip,.rar,.html,.css,.js,.dart,text/html,text/css,application/javascript" class="hidden"/>
        


    {/if}
    <!-- Attachment Menu -->
    {#if showAttachmentMenu}
    <div class="fixed py-3 bottom-31 z-50 left-5 w-42 rounded-3xl border border-[#202D46] bg-[#0B1220] shadow-[0_20px_60px_rgba(0,0,0,0.45)] text-white flex flex-col"  onclick={(e:any) => e.stopPropagation()}>
        <button class="py-2.5 px-4 flex items-center gap-3">
            <span class="inline shrink-0 bg-blue-800 p-1 rounded-lg" ><Camera size="19"/></span>
            Camera
        </button>
        <button onclick={openImagePicker}
        class="py-2.5 px-4 flex items-center gap-3">
            <span class="inline shrink-0 bg-blue-700 p-1 rounded-lg" ><Image  size="19"/></span>
            Image
        </button>
        <button onclick={openVideoPicker}
        class="py-2.5 px-4 flex items-center gap-3">
            <span class="inline shrink-0 bg-purple-800 p-1 rounded-lg" ><Video   size="19"/></span>
            Video
        </button>
        <button onclick={openDocumentPicker}
        class="py-2.5 px-4 flex items-center gap-3">
            <span class="inline shrink-0 bg-green-700 p-1 rounded-lg" ><FileText    size="19"/></span>
            Document
        </button>
        <!-- Triangle -->
        <div class="fixed bottom-29 left-9 w-4 h-4 bg-[#0B1220] rotate-45 border-r border-b border-white/5"></div>
    </div>
    {/if}

    <!-- file preview -->
     <!-- image -->
    {#if selectedImage && imagePreviewUrl}
        <div class="fixed bottom-26 left-6 z-30">

            <div class="relative  rounded-xl border-4 border-slate-900 ">

                <!-- Remove image -->
                <button
                    onclick={() => {
                        URL.revokeObjectURL(imagePreviewUrl);
                        imagePreviewUrl = '';
                        selectedImage = null;

                        if (imageInput) {
                            imageInput.value = '';
                        }
                    }}
                    class="absolute right-2 top-2 z-10 text-white bg-gray-600/80 backdrop-blur-xl border border-slate-600 rounded-full p-1 "
                >
                    <X size="20"/>
                </button>

                {#if imagePreviewUrl}
                    <img
                        src={imagePreviewUrl}
                        alt="Selected preview"
                        class="block h-70 w-60 rounded-lg "
                        onload={() => console.log("✅ IMAGE LOADED")}
                        onerror={() => console.log("❌ IMAGE FAILED TO LOAD")}
                    />
   
                {/if}

            </div>

         </div>
    {/if}

    
   {#if selectedVideo && videoPreviewUrl}

    <div class="fixed bottom-26 left-6 z-30">

        <div class="relative rounded-xl border-4 border-slate-900">

            <!-- Remove video-->
            <button
                onclick={() => {
                    URL.revokeObjectURL(videoPreviewUrl);

                    videoPreviewUrl = '';
                    selectedVideo = null;

                    if (videoInput) {
                        videoInput.value = '';
                    }
                }}
                class="absolute right-2 top-2 z-20 text-white bg-gray-600/80 backdrop-blur-xl border border-slate-600 rounded-full p-1"
            >
                <X size="20"/>
            </button>

            <!-- svelte-ignore a11y_media_has_caption -->
            <video
                src={videoPreviewUrl}
                controls
                class="block h-70 w-60 rounded-lg object-cover"
            ></video>

        </div>

    </div>

  {/if}

  {#if selectedDocument}

        <div class="fixed bottom-26 left-6 z-30">

            <div class="relative w-60 rounded-xl border-4 border-slate-900 bg-[#1A2438] p-4">

                <!-- Remove -->
                <button
                    onclick={() => {

                        selectedDocument = null;
                        documentName = "";
                        documentSize = 0;

                        if (documentInput) {
                            documentInput.value = "";
                        }

                    }}
                    class="absolute right-2 top-2 z-20 text-white bg-gray-600/80 backdrop-blur-xl border border-slate-600 rounded-full p-1"
                >
                    <X size="20"/>
                </button>

                <div class="flex items-center gap-3">

                    <div class="bg-blue-700 p-3 rounded-xl">
                        <FileText size="26"/>
                    </div>

                    <div class="flex-1">

                        <p class="text-white font-medium break-all">
                            {documentName}
                        </p>

                        <p class="text-gray-400 text-sm">
                            {(documentSize / 1024 / 1024).toFixed(2)} MB
                        </p>

                    </div>

                </div>

            </div>

        </div>
    {/if}



    

    {#if inputMode === 'normal'}
        <!-- we will do video preview here later -->
        <!-- we will do doc preview here later -->
        <div class="fixed  w-full bottom-10 z-10 left-0">
        <!-- 
            1. items-end keeps icons locked to the bottom without stretching vertically
            2. bg-slate-900/60 combined with backdrop-blur ensures contrast on light/dark themes
        -->
            <div class="flex items-end justify-between bg-slate-900/60 border border-white/10 backdrop-blur-xl mx-5 py-3 px-3 rounded-2xl gap-2">
            
                <!-- Plus Button: Remains static at the bottom-left -->
                <button onclick={(e)=> { e.stopPropagation(); showAttachmentMenu = !showAttachmentMenu}} class="w-8 h-8 flex items-center justify-center border-2 border-blue-600 text-blue-500 rounded-full shrink-0 mb-05">
                    <Plus size="20"/>
                </button>

                
                <!-- Textarea: Auto-grows dynamically, hides static scrollbars, handles internal scrolling perfectly  -->
                <textarea 
                bind:this={textareaRef}
                bind:value={messageText}
                oninput={autoGrow}
                rows="1"
                placeholder="Type a message..."
                class="w-full bg-transparent text-gray-200 outline-none resize-none px-2 py-1 max-h-40 text-sm overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none"
                ></textarea>
                
                <!-- Right Action Group: Stays anchored side-by-side at the bottom-right -->
                <div class="flex items-center gap-1 shrink-0 mb-0.5">
                    <button class:hidden={hasSomethingToSend}
                    class="text-blue-500 p-1 rounded-full hover:bg-white/5 transition">
                        <Camera size="22"/>
                    </button>
                    <button onclick={startRecording}
                    class:hidden={hasSomethingToSend}
                    class="text-blue-500 p-1 rounded-full hover:bg-white/5 transition">
                        <Mic size="22"/>
                    </button>

                    <button onclick={handleSendMessage}
                    class:hidden={!hasSomethingToSend}
                    class="text-white bg-blue-700  px-2 py-1 rounded-lg">

                        {#if  sendingMessage}
                        <!-- spinner -->
                         <div class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                          Sending... 

                        {:else}
                            <Send class="inline" size="18"/>
                        send
                        {/if}
                        
                    </button>

                </div>
            </div>

        </div>




    {:else if inputMode === 'recording'}


        <!-- recording -->
        <div class="fixed  w-full bottom-10 z-30 left-0">
        
            <div class="flex-col items-end justify-between bg-slate-900/60 border border-white/10 backdrop-blur-xl mx-5 py-3 px-3 rounded-2xl">
            
                <div class="flex items-center justify-center gap-6 mb-3">
                    <div class=" animate-blink h-2.5 w-2.5 bg-red-500 rounded-full"></div>
                    <p class="text-white">Recording... </p>
                    <p class="text-gray-500 font-medium text-sm ms-1 mt-1">
                        {String(Math.floor(recordingSecond / 60)).padStart(2, '0')}:{String(recordingSecond % 60).padStart(2, '0')}
                    </p>
                    <div class="flex items-end gap-1 h-5">
                        {#each bars as bar, i}
                            <div
                            class="w-0.5 rounded-full bg-red-500"
                            style={`height:${bar * 2}px`}
                            ></div>
                        {/each}
                    </div>
                </div>

                <div class="flex justify-evenly gap-4">
                    <!--delete recording btn-->
                    <button  onclick={deletRecording}
                    class="w-8 h-8 flex items-center justify-center border border-white/10  text-red-500 rounded-lg shrink-0 -mb-1">
                        <Trash2  size="18"/>
                    </button>

                    
                    <!-- Right Action Group: Stays anchored side-by-side at the bottom-right -->
                    <div class="flex items-center gap-1 shrink-0 -mb-1">
                        
                        <button onclick={stopRecording}
                        class="px-3 py-2 text-center text-xs gap-2 flex items-center justify-center border border-white/10  text-white rounded-lg shrink-0 ">
                            <div  class="inline h-3.5 w-3.5 rounded-sm  bg-red-600"></div>
                            Stop
                        </button>

                    </div>
                </div>
            
            </div>

         </div>



    {:else if inputMode === 'preview'}  
         <!-- after recording -->
         <div class="fixed w-full bottom-10 z-30 left-0">
        
            <div class="flex-col items-end justify-between bg-slate-900/60 border border-white/10 backdrop-blur-xl mx-5 py-3 px-3 rounded-2xl">
            
                        
                <div
                    class="flex  relative justify-center items-center gap-2 mb-3 mx-10"
                >

        
                    <!-- Play Button -->
                    <button onclick={playPreview}
                        class="px-1.5 me-3 py-1.5 rounded-full border border-[#2A4B9A] flex items-center justify-center text-[#2F80FF] hover:bg-[#17233B]"
                    >
                        {#if isPlayingPreview}
                            <Square size="16" strokeWidth="2.5" />
                        {:else}
                            <Play size="16" strokeWidth="2.5" />
                        {/if}
                    </button>

                    <!-- Duration -->
                    <p class="text-gray-500 text-sm font-medium whitespace-nowrap">
                        {String(Math.floor(previewCurrentTime / 60)).padStart(2, '0')}:{String(previewCurrentTime % 60).padStart(2, '0')}

                    </p>

                    <!-- Waveform -->
                    <div class="flex-1 flex items-center gap-[3px]">
                        {#each sdbars as bar, i}
                            <div
                                class={`w-0.5 rounded-full transition-all ${
                                    i <= previewProgress ? "bg-[#2F80FF]" : "bg-[#7D8698]"
                                }`}
                                style={`height:${bar * 3}px`}
                            ></div>
                        {/each}
                    </div>

                
                    
                </div>

                <div class="flex justify-evenly gap-4">
                    <!--delete recording btn-->
                    <button  onclick={deletRecording}
                    class="px-2 py-1 flex items-center gap-1.5 justify-center border border-white/10  text-red-500 rounded-lg shrink-0 -mb-1">
                        <Trash2  size="19"/>
                        Delete
                    </button>

                    
                    <button onclick={sendRecording}
                    class="text-white bg-blue-700  px-2  rounded-lg">
                        <Send class="inline me-1" size="19"/>
                        send
                    </button>
                </div>
            
            </div>

         </div>
    {/if}


    
   

    
    

    

</div>
