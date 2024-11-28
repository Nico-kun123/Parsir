<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'

// Хранилище
import { useAuthStore } from '@/stores/authTokens'

// Плагины
import makeMessageHead from '@/plugins/makeMessageHead'

onMounted(() => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.checkAuth()
  if (!isAuthenticated) {
    console.log(
      `${makeMessageHead('WARNING')}: Пользователь не авторизован! Перенаправляем на страницу входа...`
    )
  }
})
</script>

<template>
  <RouterView />
</template>

<style scoped lang="scss"></style>
