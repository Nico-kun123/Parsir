<script lang="ts" setup>
import { defineProps } from 'vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <svg
    v-if="!props.disabled"
    xmlns="http://www.w3.org/2000/svg"
    width="2.5em"
    height="2.5em"
    viewBox="0 0 24 24"
  >
    <path
      fill="#604cc3"
      d="m11.475 18.025l-8.15-5.175q-.475-.3-.475-.85t.475-.85l8.15-5.175q.5-.325 1.013-.037t.512.887V11h8q.425 0 .713.288T22 12t-.288.713T21 13h-8v4.175q0 .6-.513.888t-1.012-.038"
    ></path>
  </svg>
  <svg
    v-else
    class="disabled"
    xmlns="http://www.w3.org/2000/svg"
    width="2.5em"
    height="2.5em"
    viewBox="0 0 24 24"
  >
    <path
      class="disabled"
      d="m11.475 18.025l-8.15-5.175q-.475-.3-.475-.85t.475-.85l8.15-5.175q.5-.325 1.013-.037t.512.887V11h8q.425 0 .713.288T22 12t-.288.713T21 13h-8v4.175q0 .6-.513.888t-1.012-.038"
    ></path>
  </svg>
</template>

<script lang="ts">
export default {
  name: 'PaginationPagePrevious'
}
</script>

<style lang="scss" scoped>
.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
:not(.disabled) {
  cursor: pointer;
  opacity: 1;
}
</style>
