<template>
  <RecycleScroller
    class="scroller"
    :items="products"
    :item-size="320"
    key-field="id"
    v-bind="$attrs"
  >
    <template #default="{ item }">
      <ProductCard :product="item" />
    </template>
  </RecycleScroller>
</template>

<script>
import { memo } from 'vue'

import { RecycleScroller } from 'vue3-virtual-scroller'
import ProductCard from './ProductCard.vue'

export default {
  components: {
    RecycleScroller,
    ProductCard: memo(ProductCard)
  },
  props: {
    products: {
      type: Array,
      required: true,
      default: () => []
    }
  }
}
</script>

<style scoped>
.scroller {
  height: calc(100vh - 60px);
  width: 100%;
}

@media (max-width: 768px) {
  .scroller {
    height: calc(100vh - 120px);
  }
}
</style>
