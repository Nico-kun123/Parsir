<template>
  <NavBar />
  <div class="products-page">
    <h1>Товары</h1>
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="product-grid">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
  </div>
</template>

<script>
import { defineProps } from 'vue'
import ProductCard from '/src/components/ProductCard.vue'
import NavBar from '/src/components/NavBar.vue'

const props = defineProps({
  category: {
    type: String,
    required: true,
    default: 'All'
  }
})

export default {
  name: 'ProductsPage',
  components: { NavBar, ProductCard },
  data() {
    return {
      products: [],
      loading: true,
      error: null
    }
  },
  async created() {
    try {
      const response = await fetch('http://localhost:5500/api/getProducts')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      this.products = await response.json()
    } catch (err) {
      console.error('Ошибка при загрузке товаров:', err)
      this.error = 'Не удалось загрузить товары. Пожалуйста, попробуйте позже.'
    } finally {
      this.loading = false
    }
  }
}
</script>

<style scoped lang="scss">
.products-page {
  margin-top: toRem(110);

  & h1 {
    margin-left: toRem(20);
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px;
  }
}

.error {
  color: red;
  padding: 20px;
}
</style>
