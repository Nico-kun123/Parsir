<script lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

// Хранилище
import { useAuthStore } from '@/stores/authTokens'

// Плагины
import checkAdminRole from '@/plugins/checkAdminRole'

export default {
  name: 'NavBar',
  components: { RouterLink },

  setup() {
    // Хранилище для проверки авторизации
    const authStore = useAuthStore()

    const isAdmin = computed(() => checkAdminRole())

    /**
     * Обработчик события нажатия кнопки "Выход":
     *
     * Если пользователь подтвердит выход, то перенаправляем его на страницу входа.
     * Также удаляем токен авторизации пользователя.
     */
    function handleSignout() {
      if (!confirm('Вы действительно хотите выйти?')) {
        return
      }

      authStore.logout()
      window.location.href = '/auth'
    }

    return {
      handleSignout,
      isAdmin
    }
  }
}
</script>

<template>
  <div class="logo">
    <a href="/"
      ><img
        src="@/assets/img/UI/Logo.png"
        class="logo__image"
        alt="ParSir Logo"
        draggable="false"
        width="95"
    /></a>
  </div>
  <nav>
    <div class="wrapper" v-if="isAdmin">
      <RouterLink to="/home">Главная</RouterLink>
      <RouterLink to="/about">О Сервисе</RouterLink>
      <RouterLink to="/users">Пользователи</RouterLink>
    </div>

    <div class="wrapper" v-else>
      <RouterLink to="/home">Главная</RouterLink>
      <RouterLink to="/about">О Сервисе</RouterLink>
    </div>
    <div class="wrapper">
      <button @click="handleSignout">Выйти</button>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.logo {
  width: 100%;
  z-index: 5;
  position: fixed;
  top: 0;
  display: flex;
  justify-content: center;
  background-color: white;

  &__image {
    transition: $transition-easing-4 $transition-duration-normal;
    z-index: 10;
    width: 80px;
  }
}

nav {
  z-index: 5;
  background: map-get($UI-color, 'navbar');
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  box-shadow: $box-shadow-dark;
  position: fixed;
  width: 100%;
  top: 0;

  margin-top: toRem(40);
  margin-bottom: toRem(10);
  padding: 0 toRem(15);
  transition: $transition-easing-4 $transition-duration-normal;

  & a {
    transition: $transition-easing-4 $transition-duration-normal;
    display: inline-block;
    padding: toRem(10) toRem(10);

    &:first-of-type {
      border: 0;
    }

    &:hover {
      color: map-get($map: $UI-color, $key: 'navbar-text-hover');
      background: map-get($UI-color, 'navbar-link-hover');
    }
  }

  & button {
    margin: 0;
    padding: toRem(5) toRem(10);
    background-color: map-get($map: $UI-color, $key: 'navbar-signout-bg');
    color: map-get($map: $UI-color, $key: 'navbar-signout-text');
    border: 0;

    &:hover {
      background-color: map-get($map: $UI-color, $key: 'navbar-signout-bg-hover');
      color: map-get($map: $UI-color, $key: 'navbar-signout-text-hover');
    }
  }

  & a.router-link-exact-active {
    color: map-get($map: $UI-color, $key: 'navbar-link-active');
    font-weight: bolder;
  }

  & a.router-link-exact-active:hover {
    background-color: transparent;
  }
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/* ✨ RESPONSIVENESS ✨ */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/* 600px */
@include responsiveness(tablet-portrait) {
  nav {
    margin-top: 3rem;
    padding: 0 toRem(30);

    & a {
    }
  }
  .logo {
    &__image {
      width: 95px;
    }
  }
}

/* 1200px */
@include responsiveness(desktop) {
  nav {
    padding: 0 toRem(75);
    & a {
    }
  }
  .logo {
    &__image {
      width: 100px;
    }
  }
}
</style>
