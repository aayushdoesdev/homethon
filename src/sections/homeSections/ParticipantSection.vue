<script setup>
const logoArray = [
  "/svg/past1.svg",
  "/svg/past2.svg",
  "/svg/past3.svg",
  "/svg/past4.svg",
  "/svg/past5.svg",
  "/svg/past6.svg",
  "/svg/past7.svg",
];
</script>

<template>
  <section class="py-10 xl:py-20 ">
    <div class="px-4 xl:px-0">
      <h1 class="title-text text-center">PAST PARTICIPANTS 2024</h1>

      <div class="mt-10">
        <Vue3Marquee
          :gradient="true"
          :gradient-color="[255, 255, 255]"
          gradient-length="40%"
          :clone="true"
        >
          <img
            v-for="(src, index) in logoArray"
            :key="index"
            :src="src"
            class="mr-20 h-24 w-auto"
            alt="Partner Logo"
          />
        </Vue3Marquee>

        <Vue3Marquee
          class="mt-20"
          :clone="true"
          direction="reverse"
          :gradient="true"
          :gradient-color="[255, 255, 255]"
          gradient-length="40%"
        >
          <img
            v-for="(src, index) in logoArray"
            :key="index"
            :src="src"
            class="mr-20 h-24 w-auto"
            alt="Partner Logo"
          />
        </Vue3Marquee>
      </div>
    </div>
    <div class="mt-24 max-w-7xl mx-auto">
      <h1 class="title-text text-center">BANKS & FINANCIAL INSITUTES</h1>

      <div class="grid grid-cols-4 mt-10 divide-x">
        <div class="px-16">
          <img src="/svg/bank1.svg" alt="" />
        </div>
        <div class="px-16">
          <img src="/svg/bank2.svg" alt="" />
        </div>
        <div class="px-16">
          <img src="/svg/bank3.svg" alt="" />
        </div>
        <div class="px-16">
          <img src="/svg/bank4.svg" alt="" />
        </div>
      </div>
    </div>

    <div
      class="bg-gradient-to-r from-[#E65C00] to-[#D8B50B] p-10 mt-16 text-center"
    >
      <h2 class="text-white font-arsenal font-semibold text-[40px]">
        MAKE YOUR BRAND BIGGER & VISIBLE
      </h2>
      <p class="font-inter text-[18px] text-white w-[80%] mx-auto mt-6">
        You can be one of them, too! Here's an opportunity for you to give your
        brand the best platform to showcase your exclusive properties and we
        assure you that you get maximum eyeballs which will be beneficial for
        your brand.
      </p>
    </div>
  </section>
</template>
