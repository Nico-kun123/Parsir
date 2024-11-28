<script setup lang="ts">
import { RouterLink } from 'vue-router'

import icon404 from '@/components/icons/404.vue'
import { onUnmounted } from 'vue'

// Предотвращение выделения текста
document.addEventListener('selectionchange', () => {
  const selection = document.getSelection()

  if (selection) {
    selection.removeAllRanges()
  }
})

// TODO: Посмотреть, будет ли работать удаление события!
onUnmounted(() => {
  document.removeEventListener('selectionchange', () => {})
})
</script>

<template>
  <div class="not-found">
    <div class="not-found__header">
      <icon404 class="found__title" color="red" size="150" />
      <p class="not-found__subtitle">Страница не найдена!</p>
    </div>
    <div class="not-found__actions">
      <router-link to="/" class="button button--primary">Вернуться на главную</router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.not-found {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  text-align: center;
  height: 100vh;
  background-color: map-get($map: $UI-color, $key: 'bg-color-alt');

  &__header {
    margin-bottom: 2rem;
  }

  &__title {
    // font-size: 5rem;
    // font-weight: $font-weight-bold;
    // color: map-get($map: $UI-color, $key: 'text-404');
    margin: 0;
    // width: toRem(150);
    // height: fit-content;
  }

  &__subtitle {
    font-size: $font-size-large;
    font-weight: $font-weight-medium;
    color: map-get($map: $UI-color, $key: 'text-white');
    margin: 0;
  }

  &__actions {
    & a::before {
      content: '↩';
      // color: white;
      margin-right: 0.5rem;
    }
  }
}
</style>
