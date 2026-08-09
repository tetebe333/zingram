<script lang="ts">
import { goto } from "$app/navigation";

</script>

<div>





    
    <div class="bg-slate-900/60 items-center backdrop-blur-xl py-4 left-5 right-5 fixed bottom-8 rounded-4xl flex justify-evenly shadow-xl">

        <!-- Chats -->
        <button  onclick={()=>  goto('/home')}
        class="flex flex-col items-center text-gray-500">

            <span 
            class="material-symbols-rounded text-[30px"
            style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 24;">
                chat_bubble
            </span>

            <span class="text-sm font-semibold">
                Chats
            </span>
            
        </button>

        <!-- You -->
        <button 
        class="flex flex-col items-center text-blue-500">

            <span 
            class="material-symbols-rounded text-[30px"
            style="font-variation-settings:'FILL' 0,'wght' 500,'GRAD' 0,'opsz' 24;">
                person
            </span>

            <span class="text-sm font-semibold">
                You
            </span>

            <div class="mt-1 h-0.5 w-12 rounded-full bg-blue-500"></div>
            
        </button>

        
    </div>
</div>