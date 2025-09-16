<script setup>
import { ref, nextTick, onMounted, watch } from "vue";
import gsap from "gsap";
import { Vue3Marquee } from "vue3-marquee";

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

// Watch convo to auto-scroll on new messages and animate them
watch(convo, async () => {
  await nextTick();
  scrollToBottom();

  // Animate the newest message (last in array, first in reversed display)
  const messages = chatContainer.value?.querySelectorAll(".chat-message");
  if (messages && messages.length > 0) {
    const newestMessage = messages[0]; // First message in reversed display
    gsap.fromTo(
      newestMessage,
      { y: 30, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }
    );
  }
});

// Watch typing indicator
watch(isGenerating, (newVal) => {
  if (newVal) {
    nextTick(() => {
      const typingIndicator = document.querySelector(".typing-indicator");
      if (typingIndicator) {
        gsap.fromTo(
          typingIndicator,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
        );
      }
    });
  }
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

  // Animate header on load
  nextTick(() => {
    const header = document.querySelector(".chat-header");
    const chatBody = document.querySelector(".chat-body");
    const inputForm = document.querySelector(".chat-input");

    if (header) {
      gsap.fromTo(
        header,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }

    if (chatBody) {
      gsap.fromTo(
        chatBody,
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" }
      );
    }

    if (inputForm) {
      gsap.fromTo(
        inputForm,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.4, ease: "power3.out" }
      );
    }
  });

  // Input focus animations
  const setupInputAnimations = () => {
    const input = document.querySelector('input[type="text"]');
    if (input) {
      input.addEventListener("focus", () => {
        gsap.to(input.parentElement, {
          scale: 1.02,
          borderColor: "#E65C00",
          boxShadow: "0 0 20px rgba(230, 92, 0, 0.3)",
          duration: 0.3,
          ease: "power2.out",
        });
      });
      input.addEventListener("blur", () => {
        gsap.to(input.parentElement, {
          scale: 1,
          borderColor: "rgba(255, 255, 255, 0.25)",
          boxShadow: "0 0 0px rgba(230, 92, 0, 0)",
          duration: 0.3,
          ease: "power2.out",
        });
      });
    }
  };

  nextTick(setupInputAnimations);
});

async function sendMessage(event) {
  event.preventDefault();
  if (!userInput.value.trim()) return;

  const message = userInput.value.trim();

  // Animate input clear
  const input = event.target.querySelector("input");
  if (input) {
    gsap.to(input, { scale: 0.98, duration: 0.1, yoyo: true, repeat: 1 });
  }

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
  <section class="py-10 h-screen bg-black relative overflow-hidden">
    <div
      class="max-w-7xl mx-auto relative z-20 flex flex-col items-center justify-between md:justify-center h-full px-4 xl:px-0"
    >
      <Vue3Marquee :gradient="true"
          :gradient-color="[0, 0, 0]"
          gradient-length="20%">
        <div
          class="md:hidden bg-white/10 py-6 px-2 w-full rounded-2xl flex items-center justify-between relative mr-10 min-w-[300px] h-[150px]"
        >
          <div class="">
            <img
              src="/images/hero.webp"
              alt=""
              class="absolute bottom-0 left-0 w-[50%]"
            />
          </div>
          <div class="w-[60%] self-end font-inter text-white space-y-2">
            <p class="font-semibold">Mr Homethon</p>
            <p class="border-l-4 pl-2 text-[13px]">
              Find Projects in your budget & Location
            </p>
            <p class="border-l-4 pl-2 text-[13px]">Price Trends & Forecast</p>
          </div>
        </div>
        <div
          class="md:hidden bg-white/10 py-6 px-2 w-full rounded-2xl flex items-center justify-between relative mr-10  min-w-[350px] h-[150px]"
        >
          <div class="">
            <img
              src="/images/hero3.webp"
              alt=""
              class="absolute bottom-0 left-0 w-[50%]"
            />
          </div>
          <div class="w-[60%] self-end font-inter text-white space-y-2">
            <p class="font-semibold">Mr Homethon</p>
            <p class="border-l-4 pl-2 text-[13px]">
              RERA Information & Document
            </p>
            <p class="border-l-4 pl-2 text-[13px]">NAREDCO/ Homethon FAQ’s</p>
          </div>
        </div>
      </Vue3Marquee>

      <div
        class="w-full md:w-[60%] mx-auto max-w-full rounded-3xl shadow-lg flex flex-col mt-6 md:bg-white/5 backdrop-blur-sm relative z-10 md:border border-white/25"
      >
        <!-- Header -->
        <div
          class="hidden md:flex chat-header md:bg-white/5 p-4 text-black items-center gap-3 rounded-t-3xl"
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
          class="chat-body flex-1 overflow-y-auto overflow-x-hidden flex-col-reverse p-5 flex gap-4 min-h-[300px] max-h-[calc(100vh-380px)] md:min-h-[230px] md:max-h-[230px] no-scrollbar md:bg-white/5 relative"
        >
          <div
            v-for="(msg, idx) in convo.slice().reverse()"
            :key="idx"
            :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'"
            class="chat-message flex flex-col"
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
              <!-- <span v-if="msg.sender !== 'user'" class="bot-icon">
                <img src="/svg/chat-icon.svg" alt="" class="w-8 h-8 mt-1" />
              </span> -->

              <div
                :class="[
                  msg.sender === 'user'
                    ? 'bg-orange-100 text-orange-900 self-end rounded-br-none'
                    : 'bg-gradient-to-r from-[#E65C00] to-[#D8B50B] text-white rounded-bl-none',
                  'font-inter rounded-xl px-4 py-2 text-[16px] max-w-xs shadow-md whitespace-pre-wrap message-bubble',
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
          class="typing-indicator flex flex-col justify-start p-4 md:bg-white/5"
        >
          <span class="text-[12px] font-semibold mb-1 select-none text-white">
            {{ botName }}
          </span>
          <div class="flex items-start gap-2 justify-start">
            <span class="bot-icon">
              <img src="/svg/chat-icon.svg" alt="" class="w-8 h-8 mt-1" />
            </span>
            <div
              class="md:bg-white/5 text-white rounded-xl px-4 py-2 text-[16px] max-w-xs shadow-md rounded-bl-none"
            >
              <em class="typing-text">{{ botName }} is typing...</em>
              <span class="typing-dots">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </span>
            </div>
          </div>
        </div>

        <!-- Input -->
        <form
          class="chat-input flex items-center gap-2 backdrop-blur-sm bg-white/5 border border-white/25 rounded-xl m-4 transition-all duration-200"
          @submit="sendMessage"
        >
          <input
            v-model="userInput"
            type="text"
            placeholder="Ask me anything"
            class="bg-transparent flex-1 px-4 py-3 text-[15px] outline-none text-white placeholder-white/60"
          />
          <button
            type="submit"
            class="text-[#E65C00] rounded-full p-3 flex items-center justify-center transition-all duration-200 hover:bg-white/10 hover:scale-110 active:scale-95"
          >
            <i class="pi pi-send text-[20px]"></i>
          </button>
        </form>
      </div>
    </div>

    <div
      class="hidden md:block absolute bottom-[50%] md:bottom-0 md:left-0 max-w-[600px] xl:w-[40%]"
    >
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

/* Message bubble hover effects */
.message-bubble {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.message-bubble:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* Bot icon subtle animation */
.bot-icon img {
  transition: transform 0.3s ease;
}

.bot-icon:hover img {
  transform: rotate(5deg) scale(1.1);
}

/* Typing animation dots */
.typing-dots {
  display: inline-block;
  margin-left: 8px;
}

.dot {
  display: inline-block;
  width: 4px;
  height: 4px;
  background-color: white;
  border-radius: 50%;
  margin: 0 2px;
  animation: typing 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

/* Input button animation */
.chat-input button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-input button:hover {
  box-shadow: 0 0 20px rgba(230, 92, 0, 0.4);
}
</style>
