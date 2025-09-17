<script setup>
import { ref, nextTick, onMounted, watch } from "vue";
import gsap from "gsap";
import StarsBg from "@/components/StarsBg.vue";

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

const introLines = [
  "👋 Meet MR. Homethon",
  "Here to help you find projects in your budget,",
  "Check price trends, access RERA info,",
  "And get quick answers to all your FAQs.",
];

// Store user profile
const userName = ref(localStorage.getItem(LOCAL_USER_KEY) || "");
const userId = ref(localStorage.getItem(LOCAL_ID_KEY) || "");

function open() {
  show.value = true;
}
function close() {
  show.value = false;
}

// Enhanced scroll function with better reliability
function scrollToBottom() {
  if (chatContainer.value) {
    requestAnimationFrame(() => {
      chatContainer.value.scrollTo({
        top: chatContainer.value.scrollHeight,
        behavior: 'smooth'
      });
    });
  }
}

// Enhanced watch for convo with better timing
watch(convo, async (newConvo, oldConvo) => {
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
}, { deep: true });

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
    // If user info exists, show welcome back message
    // convo.value.push({
    //   sender: "bot",
    //   text: `What are you looking for today?`,
    //   buttons: null,
    //   image: null,
    // });
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
        { y: -20, opacity: 0, duration: 0.8, ease: "power3.inOut", onComplete: () => {
          lines[i - 1].style.display = "none";
        }},
        "+=0.6"
      )
        .fromTo(
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
        text: data[0]?.text ?? `Thanks, ${userName.value}! How can I help you today?`,
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
    const botText = data?.data?.data?.body?.[0]?.text ?? data[0]?.text ?? `Thanks, ${userName.value}!`;

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
  <section class="h-screen bg-black relative overflow-hidden">
          <StarsBg />
    <!-- Intro Section -->
    <div
      v-if="showIntro"
      class="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-50"
    >
      <div
        class="text-[30px] md:text-[50px] font-bold leading-snug max-w-7xl"
      >
        <span
          v-for="(line, idx) in introLines"
          :key="idx"
          class="intro-line block mb-2 gradient-text"
          style="opacity: 0"

        >
          {{ line }}
        </span>
      </div>
    </div>

    <div v-show="showChat" class="relative h-full w-full">
      <!-- Center chat panel vertically and horizontally using flex -->
      <div
        class="absolute inset-0 flex flex-col items-center justify-center z-30 px-4 xl:px-0"
      >
        <!-- Header -->
        <div v-if="showHeader" class="flex chat-header p-4 items-center gap-3">
          <h1
            class="font-inter gradient-text font-medium text-[30px] md:text-[60px]"
          >
            Hey, How can I help you ?
          </h1>
        </div>

        <div
          class="w-full md:w-[80%] xl:w-[60%] mx-auto rounded-3xl shadow-lg flex flex-col md:bg-white/5 backdrop-blur-sm relative z-10 border border-white/25"
        >
          <!-- Chat body -->
          <div
            ref="chatContainer"
            class="chat-body flex-1 overflow-y-auto overflow-x-hidden flex-col p-5 flex gap-4 max-h-[70dvh] md:min-h-[100px] md:max-h-[500px] no-scrollbar md:bg-white/5 relative"
          >
            <!-- Messages in normal order -->
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
                <!-- Show icon only for bot on the left -->
                <!--
                <span v-if="msg.sender !== 'user'" class="bot-icon">
                  <img src="/svg/chat-icon.svg" alt="" class="w-8 h-8 mt-1" />
                </span>
                -->

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

            <!-- Typing indicator - now appears at the bottom in normal flow -->
            <div
              v-if="isGenerating"
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
          </div>

          <!-- <div
            class="hidden md:block absolute bottom-[58%] right-[-120px] xl:bottom-[32%] xl:right-[-195px] max-w-[600px] w-[70%]"
          >
            <img src="/images/hero2.webp" alt="" />
          </div> -->

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
              class="text-[#E65C00] rounded-full p-3 flex items-center justify-center transition-all duration-200"
            >
              <i class="pi pi-send text-[20px]"></i>
            </button>
          </form>
        </div>
      </div>
    </div>

    <div
      class="hidden md:block absolute bottom-[50%] md:bottom-0 md:left-0 max-w-[600px] xl:w-[40%]"
    >
      <img src="/images/hero.webp" alt="" />
    </div>
    <div class="md:hidden fixed -bottom-48 right-[20%]">
      <div
        class="w-[250px] h-[250px] rounded-full bg-orange-500 blur-2xl opacity-50"
      ></div>
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