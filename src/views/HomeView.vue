<script lang="ts">
import NavBar from '../components/NavBar.vue'
import HomeBanner from '../components/HomeBanner.vue'
import HomeShops from '@/components/HomeShops.vue'
import HomeShopSelect from '@/components/HomeShopSelect.vue'

export default {
  name: 'HomeView',

  components: {
    NavBar,
    HomeBanner,
    HomeShops,
    HomeShopSelect
  },

  setup() {
    return {}
  }
}
</script>

<template>
  <NavBar />
  <HomeBanner />
  <HomeShops />
  <HomeShopSelect />
</template>
