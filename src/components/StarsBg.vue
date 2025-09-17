<script setup>
import { ref, onMounted } from 'vue'

// Utility function to generate random box-shadows for stars
function generateBoxShadow(count, color, maxX = 2000, maxY = 2000) {
  const arr = []
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * maxX)
    const y = Math.floor(Math.random() * maxY)
    arr.push(`${x}px ${y}px ${color}`)
  }
  return arr.join(', ')
}

const shadowsSmall = ref('')
const shadowsMedium = ref('')
const shadowsBig = ref('')

onMounted(() => {
  shadowsSmall.value = generateBoxShadow(700, '#FFF')
  shadowsMedium.value = generateBoxShadow(200, '#FFF')
  shadowsBig.value = generateBoxShadow(100, '#FFF')
})

onMounted(() => {
  document.documentElement.style.setProperty('--stars-small', shadowsSmall.value)
  document.documentElement.style.setProperty('--stars-medium', shadowsMedium.value)
  document.documentElement.style.setProperty('--stars-big', shadowsBig.value)
})
</script>

<template>
  <div class="fixed inset-0 h-full w-full overflow-hidden bg-gradient-to-b from-[#1B2735] to-[#090A0F] z-0">
    <!-- Small stars -->
    <div
      class="absolute"
      style="
        width:1px; height:1px; background:transparent;
        box-shadow: var(--stars-small);
        animation: animStar 50s linear infinite;
      "
    ></div>
    <!-- Medium stars -->
    <div
      class="absolute"
      style="
        width:2px; height:2px; background:transparent;
        box-shadow: var(--stars-medium);
        animation: animStar 100s linear infinite;
      "
    ></div>
    <!-- Large stars -->
    <div
      class="absolute"
      style="
        width:3px; height:3px; background:transparent;
        box-shadow: var(--stars-big);
        animation: animStar 150s linear infinite;
      "
    ></div>
  </div>
</template>

<style>
@keyframes animStar {
  from { transform: translateY(0px); }
  to   { transform: translateY(-2000px); }
}
:root {
  --stars-small: '';
  --stars-medium: '';
  --stars-big: '';
}
</style>
