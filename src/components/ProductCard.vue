<template>
  <div class="product-card">
    <a :href="product.url" target="_blank" rel="noopener noreferrer">
      <img
        :src="product.image"
        :alt="product.name"
        class="product-image"
        loading="lazy"
        draggable="false"
        width="200px"
        height="200px"
        @error="handleImageError"
      />
    </a>
    <div class="separator"></div>
    <h3>{{ product.name }}</h3>
    <span>Цена: {{ formattedPrice }}</span>
    <a :href="product.url" target="_blank" rel="noopener noreferrer"> Перейти в магазин </a>
    <PriceChart v-if="isVisible" :product-id="product.id" />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import PriceChart from '@/components/PriceChart.vue'

export default {
  components: { PriceChart },
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const isVisible = ref(false)
    const observer = ref(null)

    const formattedPrice = computed(() => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(props.product.price)
    })

    const handleImageError = (e) => {
      e.target.src = 'https://placehold.co/200x200?text=No+Image'
    }

    onMounted(() => {
      observer.value = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          observer.value.disconnect()
        }
      })
      observer.value.observe(document.querySelector('.product-card'))
    })

    onUnmounted(() => {
      if (observer.value) observer.value.disconnect()
    })

    return { isVisible, formattedPrice, handleImageError }
  }
}
</script>

<style scoped lang="scss">
.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;

  & a {
    width: fit-content;
    margin: 0;

    & .product-image {
      width: 100%;
      height: auto;
      object-fit: contain;
      align-self: center;
      background: #f5f5f5;
    }
  }

  & h3 {
    line-height: normal;
  }
}

a {
  margin-top: auto;
}

.separator {
  height: 1px;
  background-color: #ddd;
  margin: 10px 0;
}
</style>
