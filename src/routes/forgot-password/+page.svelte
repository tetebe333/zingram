<script lang="ts">
import lock from '$lib/assets/lock.png';
import { 
  Mail, Send, ChevronLeft, ChevronRight
} from 'lucide-svelte';
</script>

<div class="relative" style="padding-top: 100px;">
     <div class="absolute z-10 top-11 left-4 border border-slate-600 rounded-full p-1 hover:bg-slate-700 transition duration-300 ease-in-out">
            <a href="/login">
            <ChevronLeft class="text-white" size="22"/>
            </a>
       </div>   
     <div class="z-10 text-white text-center " style=";">
        <h1 style="margin-bottom: -120px;" class="text-2xl  font-semibold"><span class="text-blue-500">Z</span>ingram</h1>
        <div class="flex justify-center">
        <img style="width: 280px; height: 420px;" src={lock} alt="lock icon" >        </div>

        <h1 style="margin-top: -140px;" class="text-2xl  font-semibold mt-10">Forgot Password?</h1>
    </div>

    <div class="text-center mb-6">
        <h1 class="text-sm font-semibold text-gray-500">Eenter your email address and we'll</h1>
        <h1 class="text-sm font-semibold text-gray-500">send you a link to reset your password.</h1>
    </div>

    <form action="" style="padding:0 35px; 0 35px" class=" text-gray-500 ">
        <!-- Email -->
        <label class="text-start font-semibold text-sm" for="email">Email address:</label>
        <div class="relative">
            <Mail class="fogInput-icon" size="18"/>
            <input   type="email" name="email" placeholder="Enter your email" class="fogInput-field w-full" required />
        </div>
            <button type="submit" class="log-btn w-full  font-semibold mt-4 flex items-center justify-center gap-2">
                <span class="inline">Send Reset Link</span>
                <Send class="inline mt-1" size="13"/> 
            </button>
    </form> 

    <div class="mt-8 text-center">
        <h1 class="text-sm font-semibold text-gray-500">Remember your password?</h1>
        <a href="/login" class="text-blue-500 hover:underline font-semibold">
            Back to Login
            <ChevronRight class="inline-block" size="16"/>
        </a>
    </div>


       

</div>

