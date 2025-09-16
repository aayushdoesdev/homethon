<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";

const modules = [EffectCoverflow, Pagination, Autoplay];
const imgarray = [
  {
    image: "/images/swiper1.webp",
    alt: "image1",
  },
  {
    image: "/images/swiper2.webp",
    alt: "image2",
  },
  {
    image: "/images/swiper3.webp",
    alt: "image3",
  },
  {
    image: "/images/swiper4.webp",
    alt: "image4",
  },
  {
    image: "/images/swiper5.webp",
    alt: "image5",
  },
  {
    image: "/images/swiper6.webp",
    alt: "image6",
  },
  {
    image: "/images/swiper7.webp",
    alt: "image7",
  },
  {
    image: "/images/swiper8.webp",
    alt: "image8",
  },
  {
    image: "/images/swiper9.webp",
    alt: "image9",
  },
];
</script>

<template>
  <section class="py-20">
    <div class="font-inter flex flex-col gap-20">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between space-y-16 md:space-y-0 md:divide-x">
        <div class="flex flex-col items-center gap-2 px-16">
          <p class="opacity-50 uppercase font-semibold text-[14px]">
            Banking partner
          </p>
          <img src="/svg/partner1.svg" alt="" />
        </div>
        <div class="flex flex-col items-center gap-2 px-16">
          <p class="opacity-50 uppercase font-semibold text-[14px]">
            HOME LOAN PARTNER
          </p>
          <img src="/svg/partner2.svg" alt="" />
        </div>
        <div class="flex flex-col items-center gap-2 px-16">
          <p class="opacity-50 uppercase font-semibold text-[14px]">
            SOURCING PARTNER
          </p>
          <img src="/svg/partner3.svg" alt="" />
        </div>
        <div class="flex flex-col items-center gap-2 px-16">
          <p class="opacity-50 uppercase font-semibold text-[14px]">
            OUTDOOR PARTNER
          </p>
          <img src="/svg/partner4.svg" alt="" />
        </div>
      </div>

      <swiper
        :effect="'coverflow'"
        :grabCursor="true"
        :centeredSlides="true"
        :slidesPerView="'auto'"
          :spaceBetween="60"  
        :autoplay="{ delay: 3000, disableOnInteraction: false }"
        :coverflowEffect="{
          rotate: 0,
          stretch: 0,
          depth: 50,
          modifier: 1,

        }"
        loop
        :pagination="false"
        :modules="modules"
        class="w-full md:w-[80%] rounded-3xl overflow-visible relative"
      >
        <swiper-slide v-for="(slide, index) in imgarray" :key="index" class="rounded-3xl">
          <div class="relative w-full h-[350px] md:h-[650px]">
            <img
              :src="slide.image"
              :alt="slide.alt"
              class="w-full h-full object-cover rounded-3xl"
              loading="lazy"
            />
          </div>
        </swiper-slide>
      </swiper>
    </div>
  </section>
</template>

<style scoped>
.swiper {
  width: 100%;
}

.swiper-slide {
  background-position: center;
  background-size: cover;
  width: 80%;
  height: 100%;
}

.swiper-slide img {
  display: block;
  width: 100%;
}
</style>
