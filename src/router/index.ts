import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from "@/views/DashboardView.vue";
import ShowDetailView from "@/views/ShowDetailView.vue";
import SearchBar from "@/components/SearchBar.vue";
import SearchRes from "@/views/SearchRes.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        title: 'TVStream Dashboard - Discover TV Shows'
      }
    },
    {
      path: '/shows/:id',
      name: 'show-detail',
      component: ShowDetailView,
      meta: {
        title: 'Show Details - TVStream Dashboard'
      }
    },
    {
      path:'/search',
      name: 'search-page',
      component: SearchRes,
    },
    {
      // Catch-all 404 route
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
})

// Update page title on route change
router.beforeEach((to, from, next) => {
  document.title = to.meta.title as string || 'TVStream Dashboard';
  next();
});

export default router
