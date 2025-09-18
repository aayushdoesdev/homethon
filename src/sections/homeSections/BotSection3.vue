<script setup>
import { ref, nextTick, onMounted, watch } from "vue";
import gsap from "gsap";
import StarsBg from "@/components/StarsBg.vue";
import GsapFade from "@/components/Gsapfade.vue";
import LottieAnimation from "@/components/LottieAnimation.vue";

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
const showHeader = ref(true);
const showIntro = ref(true);
const showChat = ref(false);

// Store user profile
const userName = ref(localStorage.getItem(LOCAL_USER_KEY) || "");
const userId = ref(localStorage.getItem(LOCAL_ID_KEY) || "");

// Enhanced scroll function with better reliability
function scrollToBottom() {
  if (chatContainer.value) {
    requestAnimationFrame(() => {
      chatContainer.value.scrollTo({
        top: chatContainer.value.scrollHeight,
        behavior: "smooth",
      });
    });
  }
}

// Enhanced watch for convo with better timing
watch(
  convo,
  async (newConvo, oldConvo) => {
    await nextTick();

    // Add delay to ensure DOM is fully rendered
    setTimeout(() => {
      scrollToBottom();

      // Only animate if a new message was added (not on initialization)
      if (newConvo.length > (oldConvo?.length || 0)) {
        const messages = chatContainer.value?.querySelectorAll(".chat-message");
        if (messages && messages.length > 0) {
          const newestMessage = messages[messages.length - 1];
          if (newestMessage) {
            gsap.fromTo(
              newestMessage,
              { y: 30, opacity: 0, scale: 0.95 },
              { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }
            );
          }
        }
      }
    }, 100);
  },
  { deep: true }
);

// Enhanced watch for typing indicator
watch(isGenerating, async (newVal) => {
  if (newVal) {
    await nextTick();
    setTimeout(() => {
      scrollToBottom();
      const typingIndicator = document.querySelector(".typing-indicator");
      if (typingIndicator) {
        gsap.fromTo(
          typingIndicator,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
        );
      }
    }, 50);
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

onMounted(async () => {
  await nextTick();

  const lines = document.querySelectorAll(".intro-line");
  const tl = gsap.timeline({
    onComplete: async () => {
      showIntro.value = false;
      showChat.value = true;

      await nextTick();

      const chat = document.querySelector(".chat-container");
      if (chat) {
        gsap.set(chat, { opacity: 0, y: 50 });
        gsap.to(chat, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          clearProps: "all",
        });
      }
    },
  });

  lines.forEach((line, i) => {
    if (i === 0) {
      tl.fromTo(
        line,
        { y: 20, opacity: 0, display: "block" },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      );
    } else {
      tl.to(
        lines[i - 1],
        {
          y: -20,
          opacity: 0,
          duration: 0.8,
          ease: "power3.inOut",
          onComplete: () => {
            lines[i - 1].style.display = "none";
          },
        },
        "+=0.6"
      ).fromTo(
        line,
        { y: 20, opacity: 0, display: "block" },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      );
    }
  });
});

// Enhanced sendMessage function with better scroll handling
async function sendMessage(event) {
  event.preventDefault();
  if (!userInput.value.trim()) return;

  const message = userInput.value.trim();

  if (showHeader.value) {
    showHeader.value = false;
  }

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

    // Force scroll after adding user message
    await nextTick();
    scrollToBottom();

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
        "https://n8n.brahmaastra.ai/webhook/f04181ee-edbe-40e6-8546-18a4718b3c02",
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
      });

      // Force scroll after adding bot response
      await nextTick();
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      convo.value.push({ sender: "bot", text: "Error connecting to bot." });
      await nextTick();
      setTimeout(() => scrollToBottom(), 100);
    }

    isGenerating.value = false;
    userInput.value = "";
    return; // Skip further execution for name input
  }

  // Normal chat flow after name is set
  convo.value.push({ sender: "user", text: escapeHtml(message) });

  // Force scroll after adding user message
  await nextTick();
  scrollToBottom();

  isGenerating.value = true;

  // Minimal payload for normal messages as well
  const payload = [
    {
      unique_id: userId.value,
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
      data?.data?.data?.body?.[0]?.text ??
      data[0]?.text ??
      `Thanks, ${userName.value}!`;

    convo.value.push({
      sender: "bot",
      text: botText,
    });

    // Force scroll after adding bot response
    await nextTick();
    setTimeout(() => scrollToBottom(), 100);
  } catch (error) {
    convo.value.push({
      sender: "bot",
      text: "There was an error, please try again",
    });
    await nextTick();
    setTimeout(() => scrollToBottom(), 100);
  }

  isGenerating.value = false;
  userInput.value = "";
}
</script>

<template>
  <section class="h-[100dvh] overflow-y-hidden">
    <StarsBg />
    <div
      class="relative h-full w-full px-4 xl:px-0 flex flex-col z-30"
      :class="
        showHeader ? 'justify-center items-center' : 'justify-end items-center'
      "
    >
      <!-- Title -->
      <GsapFade
        delay="0.2"
        v-if="showHeader"
        class="flex items-start flex-col w-full md:w-[80%] xl:w-[60%]"
      >
        <h1
          class="font-inter gradient-text font-medium leading-[50px] md:leading-[65px] text-[40px] md:text-[60px]"
        >
          Meet Mr. Homethon
        </h1>

        <p class="text-white md:text-[22px] font-inter">
          here to help you with everything you need!
        </p>
      </GsapFade>

      <!-- Messages -->
      <div
        v-if="!showHeader"
        ref="chatContainer"
        class="w-full md:w-[80%] xl:w-[60%] flex flex-col flex-1 overflow-y-auto mt-4 mb-8 no-scrollbar"
      >
        <div
          v-for="(msg, idx) in convo"
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

        <div class="typing-indicator-container h-16">
          <div
            v-show="isGenerating"
            class="typing-indicator flex flex-col justify-start"
          >
            <span class="text-[12px] font-semibold mb-1 select-none text-white">
              {{ botName }}
            </span>
            <div class="flex items-start gap-2 justify-start">
              <span class="bot-icon">
                <img src="/svg/chat-icon.svg" alt="" class="w-8 h-8 mt-1" />
              </span>
              <div
                class="bg-[#e65c00] text-white rounded-xl px-4 text-[16px] max-w-xs shadow-md rounded-bl-none flex items-center"
              >
                <em class="typing-text">{{ botName }} is typing</em>
                <div class="w-10">
                  <LottieAnimation animationPath="/animations/loading.json" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input box -->
      <GsapFade
        delay="0.3"
        class="w-full md:w-[80%] xl:w-[60%] border border-[#e65c00] rounded-2xl bg-white/5 backdrop-blur-sm flex items-center gap-2 pr-4 mt-6 mb-10 md:my-6 glowing-border"
      >
        <input
          v-model="userInput"
          type="text"
          placeholder="Ask me anything"
          class="w-full px-4 py-4 md:py-6 bg-transparent rounded-2xl outline-none text-white"
          @keyup.enter="sendMessage"
        />
        <button
          @click="sendMessage"
          class="pi pi-arrow-right p-3 md:text-[20px] text-white rounded-full bg-gradient-to-r from-[#e65c00] to-[#d8b50b]"
        ></button>
      </GsapFade>
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
  flex-direction: column; /* Normal column direction */
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

.typing-indicator-container {
  height: 4rem; /* Adjust based on your typing indicator size */
  min-height: 4rem;
  margin-bottom: 1rem; /* or same space as when typing indicator is visible */
}

.glowing-border {
  border-color: #e65c00;
  box-shadow: 0 0 8px #e65c00, 0 0 20px #e65c00, 0 0 30px #d88b00,
    0 0 40px #e65c00;
  animation: glowPulse 2s infinite alternate ease-in-out;
  transition: box-shadow 0.3s ease;
}

@keyframes glowPulse {
  0% {
    box-shadow: 0 0 2px #e65c00, 0 0 2px #e65c00, 0 0 2px #d88b00,
      0 0 40px #e65c00;
  }
  100% {
    box-shadow: 0 0 2px #ffb84d, 0 0 2px #ffb84d, 0 0 2px #ffb84d,
      0 0 50px #ffb84d;
  }
}
</style>
