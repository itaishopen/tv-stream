import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        title: 'TVMaze Dashboard - Discover TV Shows'
      }
    },
    {
      path: '/shows/:id',
      name: 'show-detail',
      component: ShowDetailView,
      meta: {
        title: 'Show Details - TVMaze Dashboard'
      }
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
  document.title = to.meta.title as string || 'TVMaze Dashboard';
  next();
});

export default router
