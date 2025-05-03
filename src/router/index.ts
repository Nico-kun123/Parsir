import { createRouter, createWebHistory } from 'vue-router'

// Pinia store for JWT tokens
import { useAuthStore } from '../stores/authTokens'

// Views
import AuthView from '../views/AuthRegisterView.vue' // Авторизация и регистрация
import HomeView from '../views/HomeView.vue' // Главная
import ProductsPage from '../views/ProductsPage.vue'
import NotFound from '../views/NotFoundView.vue' // Страница 404

// import UsersView from '@/views/UsersView.vue'
// import { title } from 'process'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      redirect: { name: 'home' }
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: true,
        title: 'ParSir: Парсинг данных для систем эл. коммерции'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        requiresAuth: true,
        title: 'О сервисе'
      }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Пользователи системы'
      }
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../views/ProductsPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'Товары'
      }
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView,
      meta: {
        requiresAuth: false,
        title: 'Войдите в систему'
      }
    },
    {
      path: '/signout',
      name: 'signout',
      redirect: { name: 'auth' },
      meta: {
        requiresAuth: true,
        title: 'Выход из системы...'
      }
    },
    {
      path: '/:pathMatch(.*)*', // Страница "404"
      name: 'NotFound',
      component: NotFound,
      meta: {
        requiresAuth: false,
        title: 'Страница не найдена'
      }
    }
  ]
})

/**
 *! Middleware 💅
 *
 * Проверяет, авторизован ли пользователь:
 * - Если требуется авторизация, то пользователь всегда перенаправляется на
 *    страницу авторизации.
 * - Если пользователь уже авторизован, то доступ к странице авторизации
 *    запрещен (пользователь перенаправляется на главную страницу).
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Проверка, требуется ли авторизация для страницы
  if (to.meta.requiresAuth) {
    // Если пользователь не авторизован...
    if (!authStore.checkAuth()) {
      next('/auth') // ...то перенаправляем его на страницу авторизации
    } else {
      next() // ...иначе разрешаем доступ к странице
    }

    // Если пользователь уже авторизован и он пытается перейти на страницу авторизации...
  } else if (to.path === '/auth' && authStore.isAuthenticated) {
    next('/home') // ...то перенаправляем его на главную страницу
  } else {
    next() // ...иначе разрешаем доступ к странице
  }
})

// Если страница не найдена, то меняем заголовок в браузере
router.afterEach((to) => {
  document.title = to.meta.title?.toString() || 'ParSir: Парсинг данных для систем эл. коммерции'
})
export default router
