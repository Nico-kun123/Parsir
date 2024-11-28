<script lang="ts">
import { onMounted, ref } from 'vue'

// Компоненты
import NavBar from '../components/NavBar.vue'
import AboutInstructions from '../components/AboutInstructions.vue'

// Плагины
import checkAdminRole from '@/plugins/checkAdminRole'

export default {
  name: 'AboutView',

  components: {
    NavBar,
    AboutInstructions
  },

  setup() {
    const admin = ref(false)
    onMounted(() => (admin.value = checkAdminRole()))
    return {
      admin
    }
  }
}
</script>

<template>
  <NavBar />
  <AboutInstructions :isAdmin="admin" />
</template>

<style scoped lang="scss"></style>
