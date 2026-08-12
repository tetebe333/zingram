<script lang="ts">
    import { 
ChevronLeft, Search, MessageSquare, Plus 
} from 'lucide-svelte';
import { onMount, onDestroy, tick } from 'svelte';
import { loadUsers } from '$lib/services/auth';
import { usersStore } from '$lib/stores/users';
import {goto} from '$app/navigation';
import { type UserState } from '$lib/stores/user';
import { findOrCreateConversation } from '$lib/services/auth';
import { loadUsersPresence } from "$lib/services/presence";
import { presenceMapStore } from '$lib/stores/presenceUsers';

let unsubscribePresenceMap: (() => void) | undefined;
let istLoading = $state(false)

 onMount(async () => {
    istLoading = true;

    try {
       
        if ($usersStore.users.length === 0) {
            await loadUsers();
        }

        const users = $usersStore.users;

        // Start presence listener
        unsubscribePresenceMap = loadUsersPresence(
            users.map((u) => u.uid)
        );

    } catch (error) {
        console.error(
            'Failed to initialize new chat screen:',
            error
        );
    } finally {
        istLoading = false;
    }
});

onDestroy(() => {
    unsubscribePresenceMap?.();
});

async function startChat(uid:string) {
    const conversation = await findOrCreateConversation(uid);
    goto(`/chat/${conversation.id}`);
}

const filteredUsers = $derived(
    $usersStore.users.filter((user) => {
        const query = search.trim().toLowerCase();
        return(
           user.fullName.toLowerCase().includes(query) ||
           user.username.toLowerCase().includes(query)
        );
    })
);

let search = $state('')

//right click
let selectedUser = $state<UserState | null>(null);
let showContextMenu = $state(false);

function openContextMenu(user: UserState){
    selectedUser = user;
    showContextMenu = true;
}

let longPressTimer: ReturnType<typeof setTimeout> | undefined;
let longPressTriggered = false;

function startLongPress(event: TouchEvent, user: UserState) {
    longPressTriggered = false;

    longPressTimer = setTimeout(() => {
        longPressTriggered = true;

        event.preventDefault();

        openContextMenu(user);
    }, 500);
}

function cancelLongPress() {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = undefined;
    }
}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="relative" onclick={() => showContextMenu = false}>
    <div class="fixed w-full z-30">
        <div class=" relative flex justify-center items-center  text-white pt-10">
            <div  class="bg-white/10 backdrop-blur-md absolute left-6  top-11 border border-slate-600 rounded-full p-1 hover:bg-slate-700 transition duration-300 ease-in-out">
                <a href="/home">
                    <ChevronLeft size="22"/>
                </a>
            </div>   
            <h1   class="text-2xl text-white font-semibold "> New <span class="text-blue-500">Chat <Plus class="inline mb-1" size="20" /></span></h1>

        </div>



        <div class="relative px-5 pt-4 mt-1 text-gray-400 ">
            <Search class="search-input-icon" size="18"/>
            <input bind:value={search} class="Search-input" type="text" name="" placeholder="Search by username or name...">
        </div>
    </div>

    <div class="px-5 pb-5 pt-40">
        <h1 class="text-lg text-gray-300 font-semibold ">All Users</h1>

        {#if istLoading}
            <div class="flex mt-50 justify-center items-center gap-2">
                <div class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                <p class="text-gray-400 text-center">loading Users...</p>
            </div>
        {:else}
            {#each filteredUsers as user}
                <div
                    role="button"
                    tabindex="0"
                    onclick={() => {
                        if (longPressTriggered) {
                            return;
                        }

                        startChat(user.uid);
                    }}
                    oncontextmenu={(e) => {
                        e.preventDefault();
                        openContextMenu(user);
                    }}
                    ontouchstart={(e) => startLongPress(e, user)}
                    ontouchend={cancelLongPress}
                    ontouchmove={cancelLongPress}
                    ontouchcancel={cancelLongPress}
                >
                    <div class="mt-5 flex justify-between border-b border-b-white/5 pb-2">
                        <div class="flex gap-3 relative">
                            <img
                                class="w-12 h-12 rounded-full"
                                src={user.profileImage ?? '/male-avatar.PNG'}
                                alt="avatar"
                            />

                            <div>
                                <p class="text-sm font-semibold text-gray-400">
                                    {user.fullName}
                                </p>

                                <p class="text-xs font-semibold text-gray-500">
                                    {user.username}
                                </p>
                            </div>

                            {#if $presenceMapStore[user.uid]?.online}
                                <div class="h-3 w-3 bg-green-500 rounded-full absolute top-8 left-9"></div>
                            {/if}
                        </div>

                        <div class="text-blue-500">
                            <MessageSquare size="18" />
                        </div>
                    </div>
                </div>
            {/each}

            {#if showContextMenu && selectedUser}
                  <div class="fixed inset-0 z-45 w-full h-full bg-black/30 backdrop-blur-sm"></div>
                <div
                    class="fixed z-50 bottom-10 left-5 w-52 rounded-2xl border border-[#202D46] bg-[#0B1220] text-white shadow-xl"
                    onclick={(e) => e.stopPropagation()}
                >

                    <button
                        class="w-full px-4 py-3 text-left hover:bg-white/5"
                        onclick={async () => {

                            if(selectedUser){

                                await startChat(selectedUser.uid);

                            }

                            showContextMenu = false;
                        }}
                    >
                        💬 Open Chat
                    </button>

                    <button
                        class="w-full px-4 py-3 text-left hover:bg-white/5"
                        onclick={() => {
                            goto(`/user/${selectedUser?.uid}`)
                            showContextMenu = false;
                        }}
                    >
                        👤 View Profile
                    </button>

                </div>
            {/if}
            {#if filteredUsers.length === 0}
                    <p class="mt-50 text-center text-gray-400">
                        No users found.
                    </p>
                {/if}
            {/if}
    </div>

    
</div>