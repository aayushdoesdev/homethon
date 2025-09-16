import { createRouter, createWebHistory } from 'vue-router'

// Layouts
import MainLayout from '@/layouts/MainLayout.vue'

// Pages
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "",
      component: MainLayout,
      children: [
        {
          path: "/",
          name: "home",
          component: HomeView
        }
      ]
    }
  ],
})

export default router
