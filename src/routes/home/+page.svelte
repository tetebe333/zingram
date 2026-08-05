<script lang="ts">
import { 
    Search,
    Plus,
    UserRound,
    MessageCircleMore  , MessageSquare
} from 'lucide-svelte';
import messageIcon from '$lib/assets/message-icon.png';
import {goto} from '$app/navigation';


</script>



<div class="relative"> 
    <div class="fixed z-20 w-full">
        <div class="flex justify-between px-7 pt-8">
            <h1 class="text-2xl font-bold text-white"><span class="text-blue-500">C</span>hats</h1>
            <img class="w-10 h-10 rounded-full border " src="/male-avatar.PNG" alt="" >
        </div>

        <div class="relative px-5 pt-4 text-gray-400 ">
            <Search class="search-input-icon" size="18"/>
            <input class="Search-input" type="text" name="" placeholder="Search conversations...">
        </div>
    </div>
    

    <div class="flex-col  justify-center gap-1 py-50 text-center">

        <div class="flex justify-center">
            <img class="w-50 h-50 " src={messageIcon} alt="message icon" >
        </div>

        <h1 class="text-2xl font-bold text-white -mt-10">No conversations yet</h1>
        <h1 class="text-sm font-semibold text-gray-500">Start your first conversation</h1>
        <h1 class="text-sm font-semibold text-gray-500">by tapping the + button below</h1>
    </div>


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
        <button class="flex flex-col items-center text-gray-500">

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

</div>



