<script lang="ts">
import {
    Search,
    Plus,
    UserRound,
    MessageCircleMore,
    MessageSquare
} from 'lucide-svelte';
import messageIcon from '$lib/assets/message-icon.png';
import { goto } from '$app/navigation';
import { onMount, onDestroy, tick } from 'svelte';
import { userStore,  type UserState } from '$lib/stores/user';
import { usersStore } from '$lib/stores/users';
import { ConversationsStore } from '$lib/stores/conversation';
import { loadCurrentUser, loadUsers, checkAndUpdateEmail, usergoto} from '$lib/services/auth';
import { loadConversations} from '$lib/services/chat';
import { loadMessages } from '$lib/services/messages';
import { loadUsersPresence } from "$lib/services/presence";
import { presenceMapStore } from '$lib/stores/presenceUsers';
import { formatLastSeen, formatLastTime} from '$lib/utils/lastSeen';

let unsubscribePresenceMap: (() => void) | undefined;
let unsubscribeConversations: (() => void) | undefined;
let unsubscribeMessages: (() => void) [] = [];

let isLoading = $state(false);
//right click
let selectedUserID = $state<string | null>(null);
let showContextMenu = $state(false);
let longPressTimer: ReturnType<typeof setTimeout> | undefined;
let longPressTriggered = false;
let selctedConversationId = $state<string | null>(null);
let search = $state('')


function startLongPress(event: TouchEvent, userId: string, selctedConversationIdP: string ) {
    longPressTriggered = false;

    longPressTimer = setTimeout(() => {
        longPressTriggered = true;

        event.preventDefault();

        openContextMenu(userId, selctedConversationIdP);
    }, 500);
}

function cancelLongPress() {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = undefined;
    }
}

function openContextMenu(userId: string, selctedConversationIdP: string){
    selctedConversationId = selctedConversationIdP
    selectedUserID = userId;
    showContextMenu = true;
}

function closeContextMenu() {
    showContextMenu = false;
    selctedConversationId = null;
    selectedUserID = null;
}


const filteredConversations = $derived(
    $ConversationsStore.filter((conversation) => {
        const conversationUser = $usersStore.users.find(
            (user) =>
                conversation.participants.includes(user.uid) &&
                user.uid !== $userStore?.uid
        );

        if (!conversationUser) return false;

        const query = search.trim().toLowerCase();

        if (!query) return true;

        return conversationUser.fullName
            .toLowerCase()
            .includes(query);
    })
);
onMount(async () => {
    isLoading = true;
    await usergoto();
    try {
        // Load current user
        if (!$userStore?.uid) {
            await checkAndUpdateEmail()
            await loadCurrentUser();
        }

        // Load users
        if ($usersStore.users.length === 0) {
            await loadUsers();
        }

        const users = $usersStore.users;

        // Start presence listener
        unsubscribePresenceMap = loadUsersPresence(
            users.map((u) => u.uid)
        );

        
        // Start conversations listener
        unsubscribeConversations = await loadConversations();

        // Start loading messages for existing conversations in the background
        unsubscribeMessages = $ConversationsStore.map((conversation) =>
            loadMessages(conversation.id)
        );

    } catch (error) {
        console.error(
            'Failed to initialize home screen:',
            error
        );
    } finally {
        isLoading = false;
    }
});
onDestroy(() => {
    unsubscribeConversations?.();
    unsubscribePresenceMap?.();

    unsubscribeMessages.forEach((unsubscribe) => {
        unsubscribe();
    });
});
function openMyProfile() {
    if (!$userStore?.uid) return;
    goto(`/myProfile/${$userStore.uid}`);
}


</script>


<div class="relative"> 

    {#if isLoading}

    <div class="fixed inset-0 flex items-center justify-center bg-[#010713] z-50 gap-2">
        <div class="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
        <p class="text-gray-400 text-center">loading conversations...</p>
    </div>

{:else}
    <div class="fixed z-20 w-full">
        <div class="flex justify-between px-7 pt-8">
            <h1 class="text-2xl font-bold text-white"><span class="text-blue-500">C</span>hats</h1>
                <button onclick={openMyProfile}>
                    <img
                        class="w-10 h-10 rounded-full border object-cover"
                        src={$userStore?.profileImage ?? '/male-avatar.PNG'}
                        alt={$userStore?.fullName ?? 'Profile'}
                    >
                </button>        
            </div>

        <div class="relative px-5 pt-4 text-gray-400 ">
            <Search class="search-input-icon" size="18"/>
            <input class="Search-input" bind:value={search} type="text" name="" placeholder="Search conversations by name...">
        </div>
    </div>
    
   
       {#if !$ConversationsStore.some((conversation) => conversation.lastMessage)}
            <div class="flex-col justify-center gap-1 py-50 text-center">

                <div class="flex justify-center">
                    <img
                        class="w-50 h-50"
                        src={messageIcon}
                        alt="message icon"
                    >
                </div>

                <h1 class="text-2xl font-bold text-white -mt-10">
                    No conversations yet
                </h1>

                <p class="text-sm font-semibold text-gray-500">
                    Start your first conversation
                </p>

                <p class="text-sm font-semibold text-gray-500">
                    by tapping the + button below
                </p>

            </div>

        {:else}

           <div class="pt-40 px-5">

            {#each filteredConversations as conversation}

                {@const conversationUser = $usersStore.users.find(
                    (user) =>
                        conversation.participants.includes(user.uid) &&
                        user.uid !== $userStore?.uid
                )}
                {@const unreadCount = conversation.unread?.[$userStore?.uid ?? ''] ?? 0}
                {#if conversation.lastMessage}
                     <button 
                    onclick={()=>{ 
                        if (longPressTriggered) {
                                return;
                            }
                        goto(`/chat/${conversation.id}`);
                        }}
                    oncontextmenu={(e) => {
                            e.preventDefault();
                            openContextMenu(conversationUser!.uid, conversation.id);
                        }}
                        ontouchstart={(e) => startLongPress(e, conversationUser!.uid, conversation.id)}
                        ontouchend={cancelLongPress}
                        ontouchmove={cancelLongPress}
                        ontouchcancel={cancelLongPress}
                    class="flex w-full items-center justify-between gap-3 text-white border-b border-gray-800 py-4">
                        <!-- Left side -->
                        <div class="flex flex-1 min-w-0 relative justify-start items-start gap-3">
                            <img
                                class="w-12 h-12 rounded-full object-cover shrink-0"
                                src={conversationUser?.profileImage ?? '/male-avatar.PNG'}
                                alt={conversationUser?.fullName ?? 'User'}
                            >

                            {#if $presenceMapStore[conversationUser!.uid]?.online}
                                <div class="h-3 w-3 bg-green-500 rounded-full absolute top-8 left-9"></div>
                            {/if}

                            <div class="flex flex-col justify-start items-start min-w-0 text-start">

                                <p class="font-semibold truncate capitalize w-full">
                                    {conversationUser?.fullName ?? 'Unknown user'}
                                </p>

                                {#if $presenceMapStore[conversationUser!.uid]?.online}
                                    <p class="inline-flex items-center rounded-full text-green-400 text-[11px] font-medium">
                                        Online
                                    </p>
                                {:else}
                                    <p class="text-xs font-semibold text-gray-500">
                                        Last seen {formatLastSeen($presenceMapStore[conversationUser!.uid]?.lastSeen)}
                                    </p>
                                {/if}

                                <p class="text-xs text-gray-500 truncate w-full">
                                    {conversation.lastMessage ?? 'No message'}
                                </p>

                            </div>
                        </div>
                        <!-- Right side -->
                        <div class="flex flex-col items-end justify-between self-stretch shrink-0">

                            <!-- Last message time -->
                            <span
                                class:text-green-400={unreadCount > 0}
                                class:text-gray-500={unreadCount === 0}
                                class="text-[11px]"
                            >
                                {formatLastTime(conversation.lastMessageTime)}
                            </span>

                            <!-- Unread counter -->
                            {#if unreadCount > 0}
                                <span class="flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-green-500 text-white text-[10px] font-bold">
                                    {unreadCount}
                                </span>
                            {/if}

                        </div>
                    </button>
                {/if}
            {/each}

        </div>
        {/if}
    


    <div class="fixed right-5 z-10 bottom-38">
        <button onclick={()=>{
             goto('/new-chat');
        }} class="text-white bg-blue-500 px-3 py-3 rounded-full  shadow-[0_0_35px_rgba(37,99,235,.45)]">
            <Plus size="22"/>
        </button>
    </div>

    <div class="bg-slate-900/60 items-center backdrop-blur-xl py-4 left-5 right-5 fixed bottom-8 rounded-4xl flex justify-evenly shadow-xl">

        <!-- Chats -->
        <button class="flex flex-col items-center text-blue-500">

            <span 
            class="material-symbols-rounded text-[30px"
            style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 24;">
                chat_bubble
            </span>

            <span class="text-sm font-semibold">
                Chats
            </span>

            <div class="mt-1 h-0.5 w-12 rounded-full bg-blue-500"></div>
            
        </button>

        <!-- You -->
        <button onclick={openMyProfile}
        class="flex flex-col items-center text-gray-500">

            <span 
            class="material-symbols-rounded text-[30px"
            style="font-variation-settings:'FILL' 0,'wght' 500,'GRAD' 0,'opsz' 24;">
                person
            </span>

            <span class="text-sm font-semibold">
                You
            </span>

            <!-- <div class="mt-1 h-0.5 w-12 rounded-full bg-blue-500"></div> -->
            
        </button>

        
    </div>

    {#if showContextMenu && selectedUserID}
         <!-- svelte-ignore a11y_click_events_have_key_events -->
         <!-- svelte-ignore a11y_interactive_supports_focus -->
        <div role="button" onclick={closeContextMenu}
        class="fixed inset-0 z-45 w-full h-full bg-black/30 backdrop-blur-sm"></div>   
        <biv role="button"
            class="fixed z-50 bottom-10 left-5 w-52 rounded-2xl border border-[#202D46] bg-[#0B1220] text-white shadow-xl"
        >

            <button
                class="w-full px-4 py-3 text-left hover:bg-white/5"
                onclick={async () => {

                    if(selctedConversationId){

                        goto(`/chat/${selctedConversationId}`);

                    }

                    closeContextMenu()
                }}
            >
                💬 Open Chat
            </button>

            <button
                class="w-full px-4 py-3 text-left hover:bg-white/5"
                onclick={() => {
                    goto(`/user/${selectedUserID}`)
                    closeContextMenu()
                }}
            >
                👤 View Profile
            </button>

        </biv>
    {/if}
{/if}
</div>



