<script setup>
import { ref, nextTick, onMounted, watch } from "vue";

// LocalStorage keys
const LOCAL_USER_KEY = "mychat_name";
const LOCAL_ID_KEY = "mychat_id";

// Generate a random unique ID (6 to 12 digits)
function randomId(length = 10) {
  let result = "";
  const digits = "0123456789";
  for (let i = 0; i < length; i++) {
    result += digits.charAt(Math.floor(Math.random() * 10));
  }
  return result;
}

const props = defineProps({
  botName: { type: String, default: "Homethon Bot" },
});

const show = ref(false);
const convo = ref([]);
const userInput = ref("");
const isGenerating = ref(false);
const chatContainer = ref(null);

// Store user profile
const userName = ref(localStorage.getItem(LOCAL_USER_KEY) || "");
const userId = ref(localStorage.getItem(LOCAL_ID_KEY) || "");

function open() {
  show.value = true;
}
function close() {
  show.value = false;
}

// Scroll chat container to bottom
function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
}

// Watch convo to auto-scroll on new messages
watch(convo, async () => {
  await nextTick();
  scrollToBottom();
});

// Escape HTML special characters to prevent XSS
function escapeHtml(text) {
  return text.replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m])
  );
}

// On component mount
onMounted(() => {
  if (userName.value && userId.value) {
    // If user info exists, show welcome back message
    convo.value.push({
      sender: "bot",
      text: `What are you looking for today?`,
      buttons: null,
      image: null,
    });
  } else if (!userName.value && convo.value.length === 0) {
    // Prompt for name if no user info found
    convo.value.push({
      sender: "bot",
      text: "Welcome! What can i help with you today?",
      buttons: null,
      image: null,
    });
  }
});

async function sendMessage(event) {
  event.preventDefault();
  if (!userInput.value.trim()) return;

  const message = userInput.value.trim();

  // First-time user name input handling
  if (!userName.value) {
    userName.value = escapeHtml(message);
    userId.value = randomId(12);
    localStorage.setItem(LOCAL_USER_KEY, userName.value);
    localStorage.setItem(LOCAL_ID_KEY, userId.value);

    convo.value.push({ sender: "user", text: userName.value });

    // Minimal payload format for initial message
    const payload = [
      {
        unique_id: userId.value,
        text: message,
      },
    ];

    try {
      isGenerating.value = true;
      const response = await fetch(
        "https://n8n.brahmaastra.ai/webhook/dceaa3e1-8ffa-4e10-bad5-b0e70fcb65eb",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();

      convo.value.push({
        sender: "bot",
        text:
          data[0]?.text ??
          `Thanks, ${userName.value}! How can I help you today?`,
        /* buttons: null,
        image: null, */
      });
    } catch (error) {
      convo.value.push({ sender: "bot", text: "Error connecting to bot." });
    }

    isGenerating.value = false;
    userInput.value = "";
    return; // Skip further execution for name input
  }

  // Normal chat flow after name is set
  convo.value.push({ sender: "user", text: escapeHtml(message) });
  isGenerating.value = true;

  // Minimal payload for normal messages as well
  const payload = [
    {
      unique_id: userId.value, // You can adjust unique_id logic as needed
      text: message,
    },
  ];

  try {
    const response = await fetch(
      "https://n8n.brahmaastra.ai/webhook/f04181ee-edbe-40e6-8546-18a4718b3c02",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json();
    const botText =
      data?.data?.data?.body?.[0]?.text ?? `Thanks, ${userName.value}!`;

    const lastMsg = convo.value[convo.value.length - 1];

    if (lastMsg && lastMsg.sender === "bot") {
      lastMsg.text = data[0]?.text ?? "No response from bot.";
      /* lastMsg.buttons = null;
      lastMsg.image = null; */
      convo.value.splice(
        convo.value.length - 1,
        1,
        JSON.parse(JSON.stringify(lastMsg))
      );
    } else {
      convo.value.push({
        sender: "bot",
        text: botText ?? "No response from bot.",
      });
    }
  } catch (error) {
    convo.value.push({
      sender: "bot",
      text: "There was an error, please try again",
    });
  }

  isGenerating.value = false;
  userInput.value = "";
}

defineExpose({ open, close });
</script>

<template>
  <section
    class="py-10 h-screen bg-gradient-to-r from-[#E65C00] to-[#D8B50B] relative overflow-hidden"
  >
    <div
      class="bg-gradient-to-b from-black to-transparent h-[200px] w-full absolute top-0"
    ></div>
    <div
      class="bg-gradient-to-t from-black to-transparent h-[200px] w-full absolute bottom-0"
    ></div>
    <div
      class="max-w-7xl mx-auto relative z-20 flex items-center justify-center h-full px-4 xl:px-0"
    >
      <div
        class="w-full md:w-[60%] mx-auto max-w-full rounded-3xl shadow-lg flex flex-col mt-16 bg-white relative z-10"
      >
        <!-- Header -->
        <div
          class="bg-white p-4 text-black flex items-center gap-3 rounded-t-3xl"
        >
          <h1
            class="font-inter gradient-text font-medium text-[30px] md:text-[40px]"
          >
            Hey,<br />How can I help you ?
          </h1>
        </div>

        <!-- Chat body -->
        <div
          ref="chatContainer"
          class="flex-1 overflow-auto overflow-x-hidden flex-col-reverse p-5 flex gap-4 min-h-[230px] max-h-[230px] no-scrollbar bg-white relative"
        >
          <div
            v-for="(msg, idx) in convo.slice().reverse()"
            :key="idx"
            :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'"
            class="flex flex-col"
          >
            <span
              class="text-[12px] font-semibold mb-1 select-none text-white"
              :class="msg.sender === 'user' ? 'self-end' : 'self-start'"
            >
              {{ msg.sender === "user" ? "User" : botName }}
            </span>

            <!-- Wrap icon and message in a horizontal flex -->
            <div
              :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'"
              class="flex items-start gap-2"
            >
              <!-- Show icon only for bot on the left -->
              <span v-if="msg.sender !== 'user'">
                <img src="/svg/chat-icon.svg" alt="" class="w-8 h-8 mt-1" />
              </span>

              <div
                :class="[
                  msg.sender === 'user'
                    ? 'bg-orange-100 text-orange-900 self-end rounded-br-none'
                    : 'bg-gradient-to-r from-[#E65C00] to-[#D8B50B] text-white rounded-bl-none',
                  'font-inter rounded-xl px-4 py-2 text-[16px] max-w-xs shadow-md whitespace-pre-wrap',
                ]"
                v-html="msg.text"
              ></div>
            </div>
          </div>
        </div>

        <div
          class="hidden md:block absolute bottom-[58%] right-[-120px] xl:bottom-[32%] xl:right-[-195px] max-w-[600px] w-[70%]"
        >
          <img src="/images/hero2.webp" alt="" />
        </div>
        <div
          v-if="isGenerating"
          class="flex flex-col justify-start p-4 bg-white/15"
        >
          <span class="text-[12px] font-semibold mb-1 select-none">
            {{ botName }}
          </span>
          <div
            class="bg-gray-100 text-gray-800 rounded-xl px-4 py-2 text-[16px] max-w-xs shadow-md"
          >
            <em>{{ botName }} is typing...</em>
          </div>
        </div>
        

        <!-- Input -->
        <form
          class="flex items-center gap-2 bg-black/5 border border-gray-200 rounded-xl m-4"
          @submit="sendMessage"
        >
          <input
            v-model="userInput"
            type="text"
            placeholder="Ask me anything"
            class="bg-transparent flex-1 px-4 py-3 text-[15px] outline-none"
          />
          <button
            type="submit"
            class="text-[#E65C00] rounded-full p-3 flex items-center justify-center transition"
          >
            <i class="pi pi-send text-[20px]"></i>
          </button>
        </form>
      </div>
    </div>

    <div class="absolute top-0 opacity-40 h-full">
      <img src="/images/pattern.webp" alt="" class="object-cover"/>
    </div>

    <div class="absolute bottom-[50%] md:bottom-0 md:left-0 max-w-[600px] xl:w-[40%]">
      <img src="/images/hero.webp" alt="" />
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.chat-container {
  display: flex;
  flex-direction: column-reverse; /* Reverse column direction */
  overflow-y: auto;
}

.gradient-text {
  background: linear-gradient(90deg, #e65c00, #d8b50b); /* example gradient */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

section {
  background: linear-gradient(
    270deg,
    #e65c00,
    #f2994a,
    #f2c94c,
    #d8b50b,
    #e0820e,
    #c9a700,
    #e27105,
    #d8b50b
  );
  background-size: 1600% 1600%;
  animation: gradientShift 20s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
