<template>
    <div ref="lottieContainer" class="lottie-container"></div>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted } from 'vue';
  import lottie from 'lottie-web';
  
  export default defineComponent({
    name: 'Loader',
    props: {
      animationPath: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      const lottieContainer = ref(null);
  
      onMounted(() => {
        lottie.loadAnimation({
          container: lottieContainer.value,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: props.animationPath,
        });
      });
  
      return {
        lottieContainer,
      };
    },
  });
  </script>
  
  <style scoped>
  .lottie-container {
    width: 100%;
    height: 100%;
  }
  </style>
  