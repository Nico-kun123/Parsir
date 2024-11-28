<template>
  <svg xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 24 24">
    <path
      fill="none"
      :stroke="color"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M3 7v4a1 1 0 0 0 1 1h3m0-5v10m3-9v8a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1m7-1v4a1 1 0 0 0 1 1h3m0-5v10"
    ></path>
  </svg>
</template>

<script lang="ts">
export default {
  name: 'IconError404',

  props: {
    color: {
      type: String,
      default: 'currentColor'
    },

    size: {
      type: [String, Number],
      default: 24
    }
  }
}
</script>
