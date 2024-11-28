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
      d="M12.525 18.025q-.5.325-1.012.038T11 17.175V13H3q-.425 0-.712-.288T2 12t.288-.712T3 11h8V6.825q0-.6.513-.888t1.012.038l8.15 5.175q.475.3.475.85t-.475.85z"
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
      d="M12.525 18.025q-.5.325-1.012.038T11 17.175V13H3q-.425 0-.712-.288T2 12t.288-.712T3 11h8V6.825q0-.6.513-.888t1.012.038l8.15 5.175q.475.3.475.85t-.475.85z"
    ></path>
  </svg>
</template>

<script lang="ts">
export default {
  name: 'PaginationPageNext'
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
