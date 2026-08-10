<script lang="ts">
import { auth } from '$lib/firebase/firebase';
import { page } from '$app/state';
import { goto } from '$app/navigation';
import { ArrowLeft, Ban, Clock, MessageCircle, SquareArrowOutUpRight, VenusAndMars, Calendar, Globe} from 'lucide-svelte';
import { onMount, onDestroy } from 'svelte';
import { loadCurrentUser } from '$lib/services/auth';
import { usersStore } from '$lib/stores/users';
import { loadUsers } from '$lib/services/auth';
import { findOrCreateConversation } from '$lib/services/auth';
import { type UserState, userStore } from '$lib/stores/user'; 
import { presenceMapStore } from '$lib/stores/presenceUsers';
import { loadUsersPresence } from '$lib/services/presence';
import { formatLastSeen } from '$lib/utils/lastSeen';
import { loadMessages } from '$lib/services/messages';
import { messagesStore } from '$lib/stores/messages';

let unsubscribePresenceMap: (() => void) | undefined;
let lastMessage = $derived($messagesStore.at(-1) ?? null);
let unsubscribeMessages: (() => void) | undefined;

onMount(async () => {
    loadingUser = true;
   

    try {
        await loadUsers();
        await loadCurrentUser()
        // Start listening for presence
        const users = $usersStore.users;

        unsubscribePresenceMap = loadUsersPresence(
            users.map((u) => u.uid)
        );

        // Get the conversation
        const conversation = await findOrCreateConversation(UserUid);

        // Listen for messages in that conversation
        unsubscribeMessages = loadMessages(conversation.id);

    } catch (error) {
        console.error('Failed to load profile:', error);
    } finally {
        loadingUser = false;
    }
});

onDestroy(() => {
    unsubscribePresenceMap?.();
    unsubscribeMessages?.();
});

const UserUid = $derived(page.params.uid as string);

let loadingUser = $state(false);

const user: UserState | undefined = $derived(
    $usersStore.users.find(
        (user) => user.uid === UserUid
    )
);

async function openChat(uid:string) {
    const conversation = await findOrCreateConversation(uid);
    goto(`/chat/${conversation.id}`);
}
</script>
<div class="p-4">
        
    <div class="flex justify-between items-center">
        <a href="/home"
        class="flex gap-1 text-white">
            <ArrowLeft size="18"/>
            <p class="text-xs font-semibold">Home</p>
        </a>
        <button onclick={() => { if (user?.uid) openChat(user.uid); }}
        class="flex gap-1 text-blue-600 items-center">
            <MessageCircle size="15"/>
          <p class="text-xs font-semibold">Message</p>
        </button>
    </div>
    {#if loadingUser}
        <div class="flex pt-60 justify-center items-center gap-2">
            <div class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
            <p class="text-gray-400 text-center">Loading Measages...</p>
        </div>
    {:else if user}
        <div class="relative gap-3 bg-linear-to-br from-[#162443] via-[#0B1730] to-[#03081A] w-full flex justify-start items-start mt-3 rounded-2xl p-4">
                <img
                    src={user.profileImage}
                    alt={user.fullName}
                    class="w-28 h-28 rounded-full"
                />
             
            {#if $presenceMapStore[user.uid]?.online}
              <div class="h-4 w-4 bg-green-500 rounded-full fixed top-38 left-27.5 shadow-2xs shadow-black/85"></div>     
            {/if}
            <div class="flex flex-col justify-start items-start gap-2">
                <p class="text-white text-xl font-semibold capitalize">
                  {user.fullName}
                </p>
                <p class="text-muted text-xs font-bold">
                    @{user.username}
                </p>

                <!-- {#if user.bio} -->
                    <p class="text-Lmuted text-xs font-bold">
                        {user.bio}
                    </p>
                <!-- {/if} -->
                 <div class="flex gap-4">
                    <p class="text-Lmuted text-xs font-semibold flex gap-1 capitalize">
                      <VenusAndMars size="16"/>
                      {user.gender}
                    </p>

                    {#if user.language}
                        <p class="text-Lmuted text-xs font-semibold flex gap-1 capitalize">
                        <Globe  size="16"/>
                        {user.language}
                        </p>
                    {/if}
                 </div>
                
            </div>    
    </div>

    <div class="bg-[#0B1220] text-xs font-semibold text-Lmuted flex flex-col gap-3 rounded-2xl px-4 pt-4  border border-[#202D46] mt-3">
        <div class="flex gap-3 items-center mb-2">
            <img src="/icons8-contact-details-30.png" alt="" class="h-6 w-5 ">
            <p class="text-white text-sm">Details</p>
        </div>
        <div class="flex justify-between pb-3 items-center border-b border-[#202D46] w-full">
            <div class="flex gap-3 items-center">
                <Calendar  size="18"/>
                Date Of Birth
            </div>
            <p>
               {new Date(user.dateOfBirth + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                }).replace(',', '')}
            </p>
        </div>
        <div class="flex justify-between pb-3 items-center border-b border-[#202D46] w-full">
            <div class="flex gap-3 items-center">
                <VenusAndMars  size="18"/>
                Gender
            </div>
            <p>
                {user.gender}
            </p>
        </div>
        {#if user.title}
            <div class="flex justify-between pb-3 items-center border-b border-[#202D46] w-full">
                <div class="flex gap-3 items-center">
                    <Calendar  size="18"/>
                    Title
                </div>
                <p>
                    {user.title}
                </p>
            </div>
        {/if}
        

         <div class="flex justify-between pb-3 items-center border-b border-[#202D46] w-full">
            <div class="flex gap-3 items-center">
                <Globe  size="18"/>
                Language
            </div>
            <p>
                {user.language ?? 'English'}
            </p>
        </div>

        {#if user.website}
            <div class="flex justify-between pb-3 items-center border-b border-[#202D46] w-full">
                <div class="flex gap-3 items-center">
                <img src="/icons8-link-50.png" alt="" class="h-5 w-5 ">
                    <p>Website</p>
                </div>

                <div>
                    <a href={user.website} target="_blank" class="flex gap-3 items-center hover:underline text-blue-600 underline sm:no-underline">
                        {user.website}
                        <SquareArrowOutUpRight class="text-Lmuted" size="15"/>
                    </a>
                </div>

            </div>
        {/if}

        {#if user.facebook}
            <div class="flex justify-between pb-3 items-center border-b border-[#202D46] w-full">
                <div class="flex gap-3 items-center">
                <img src="/icons8-facebook-48.png" alt="" class="h-5 w-5 ">
                    <p>Facebook</p>
                </div>

                <div>
                    <a href={user.facebook} target="_blank" class="flex gap-3 items-center hover:underline text-blue-600 underline sm:no-underline">
                        www.{user.username}.facebook.com
                        <SquareArrowOutUpRight class="text-Lmuted" size="15"/>
                    </a>
                </div>
            </div>
        {/if}

        {#if user.instagram}
            <div class="flex justify-between pb-3 items-center border-b border-[#202D46] w-full">
                <div class="flex gap-3 items-center">
                <img src="/icons8-instagram-logo-94.png" alt="" class="h-5 w-5 ">
                    <p>Instagram</p>
                </div>

                <div>

                    <a href={user.instagram} target="_blank" class="hover:underline text-blue-600 flex gap-3 items-center">
                        www.{user.username}.instagram.com
                        <SquareArrowOutUpRight class="text-Lmuted" size="15"/>
                    </a>
                </div>

            </div>
        {/if}
        
        {#if user.instagram}
            <div class="flex justify-between pb-3 items-center w-full  border-b border-[#202D46]">
                <div class="flex gap-3 items-center">
                <img src="/icons8-whatsapp-logo-94.png" alt="" class="h-5 w-5 ">
                    <p>WhatsApp</p>
                </div>

                <div>
                   <a href={`https://wa.me/${user.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${user.username}, it's ${$userStore?.fullName} from Zingram.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 hover:underline"
                    >
                        {user.whatsapp}
                    </a>
                </div>

            </div>
        {/if}
       
        
      
    </div>
      <div class="bg-[#0B1220] text-xs font-semibold text-Lmuted flex flex-col gap-3 rounded-2xl px-4 pt-4  border border-[#202D46] mt-3">
        <div class="flex gap-3 items-center mb-2">
            <img src="/icons8-activity-64.png" alt="" class="h-6 w-5 ">
            <p class="text-white text-sm">Activity</p>
        </div>
        <div class="flex relative justify-between pb-3 items-center border-b border-[#202D46] w-full">
            <div class="flex gap-3 items-center">
              <div- class="p-2 bg-[#163A32] rounded-sm">
               <div class="h-3 w-2.5 bg-green-500 rounded-full  shadow-2xs shadow-black/85"></div>     
              </div->
                <div>
                    <p>Online</p>
                    {#if $presenceMapStore[user.uid]?.online}
                        <p >
                            Active now
                        </p>

                    {:else}
                        <p>
                            {formatLastSeen($presenceMapStore[user.uid]?.lastSeen)}
                        </p>
                    {/if}
                </div>
            </div>
           {#if $presenceMapStore[user.uid]?.online}
               <div class="absolute h-1.5 w-1.5 bg-green-500 rounded-full right-0 top-2  shadow-2xs shadow-black/85"></div>     
                <p class="me-2">Now </p>
            {:else}
                <p>
                    {formatLastSeen($presenceMapStore[user.uid]?.lastSeen)}
                </p>
            {/if}
        </div>

        
        <div class="flex relative justify-between pb-3 items-center border-b border-[#202D46] w-full">
            <div class="flex gap-3 items-center">
              <div- class="p-2 bg-[#13153E] rounded-sm">
               <MessageCircle class="text-[#4d4ba0]" strokeWidth="2.8" size='16'/>
              </div->
                <div>
                    <p>Last Message</p>
                    {#if lastMessage}
                     <p >Sent a message</p>
                    {:else}
                     <p>Haven't send a message</p>
                    {/if}
                </div>
            </div>
           {#if lastMessage}
                    <p>
                        {lastMessage?.createdAt?.toDate().toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                        })}
                    </p>
                {:else}
                <p>
                    No messae
                </p>
            {/if}
            
        </div>


        <div class="flex relative justify-between pb-3 items-center border-b border-[#202D46] w-full">
            <div class="flex gap-3 items-center">
                <div- class="p-2 bg-[#07193C] rounded-sm">
                    <Clock class="text-blue-600" strokeWidth="2.8" size='16'/>
                </div->
                <div>
                    <p>Last seen</p>
                    {#if $presenceMapStore[user.uid]?.online}
                        <p >
                            Online now
                        </p>

                    {:else}
                        <p>
                            {formatLastSeen($presenceMapStore[user.uid]?.lastSeen)}
                        </p>
                    {/if}
                </div>
            </div>
           {#if $presenceMapStore[user.uid]?.online}
                <p class="me-2">Now </p>
            {:else}
                <p>
                    {formatLastSeen($presenceMapStore[user.uid]?.lastSeen)}
                </p>
            {/if}
        </div>

         <!-- Member Since -->
        <div class="flex relative justify-between pb-3 items-center border-b border-[#202D46] w-full">
            <div class="flex gap-3 items-center">
                <div- class="p-2 bg-[#172554] rounded-sm">
                    <Calendar class="text-[#60A5FA]" strokeWidth="2.8" size='16'/>
                </div->
                <div>
                    <p>Member Since</p>
                </div>
            </div>
           <p class="capitalize">
                {#if user.createdAt}
                    {user.createdAt.toDate().toLocaleDateString("en-US", {
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
            

    {:else}
        <img
            src="/icons8-user-64.png"
            alt='no user'
            class="w-35 h-35 rounded-full mt-10"
        />
        <p class="text-gray-400 text-xl  flex gap-2 items-center">
            <Ban class="mt-1" size="22"/>
            User not found
        </p>
    {/if}
</div>