<script setup>
const whyVisitPoints = [
  { title: "EXPANSIVE LOCATIONS", desc: "TO CHOOSE FROM" },
  { title: "EXCITING LAUNCHES", desc: "TO DISCOVER" },
  { title: "500+ PROJECTS", desc: "FOR DISPLAY" },
  { title: "READY TO MOVE IN", desc: "PROPERTIES" },
  { title: "ONGOING & NEARING", desc: "POSSESSION HOMES" },
  { title: "LOAN FACILITY", desc: "FROM LEADING BANKS" },
  { title: "AMAZING OFFERS", desc: "AND SCHEMES" },
  { title: "SPOT DISCOUNTS", desc: "FOR EVERYONE" },
  { title: "3 DAYS", desc: "OF EXCITING OFFERS" },
  { title: "100+", desc: "PARTICIPANTS" },
];
</script>

<template>
  <section class="py-10 xl:py-20 bg-gradient-to-b from-[#FFFFFF] to-[#F9D423] px-4 xl:px-0">
    <div class="max-w-7xl mx-auto">
      <div class="text-center">
        <h1 class="title-text">About Expo</h1>
        <p class="font-inter text-[#51410D] mt-6 text-[18px] leading-8">
          Introducing
          <span class="font-bold">HOMETHON PROPERTY EXPO 2025!</span> NAREDCO
          Maharashtra proudly presents the largest property exhibition in
          Maharashtra, set to be one of the most significant events.
          <span class="font-bold">Join us</span> at the prestigious
          <span class="font-bold"
            >Jio World Convention Centre in BKC, Mumbai.</span
          >
          Explore an entirely new realm of Property Showcase featuring premium
          real estate brands from across the state, and benefit from exclusive
          knowledge sessions hosted by industry stalwarts and veterans. Don't
          miss out on this exceptional opportunity!
        </p>
      </div>


      <div class="text-center mt-24">
        <h1 class="title-text">WHY VISIT US?</h1>
        <div class="mt-10 flex flex-wrap justify-center gap-6 xl:divide-x divide-black divide-opacity-10">
            <div v-for="item in whyVisitPoints" class="text-[#51410D] px-6">
                <p class="font-arsenal font-semibold text-[30px]">{{ item.title }}</p>
                <p class="font-inter">{{ item.desc }}</p>
            </div>
        </div>
      </div>
    </div>
  </section>
</template>
