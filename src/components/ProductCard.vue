<template>
  <div class="product-card" ref="cardElement">
    <a :href="product.url" target="_blank" rel="noopener noreferrer">
      <img
        :src="product.image"
        :alt="product.name"
        class="product-image"
        loading="lazy"
        draggable="false"
        width="200"
        height="200"
        @error="handleImageError"
      />
    </a>
    <div class="separator"></div>
    <h3 class="product-title">{{ product.name }}</h3>
    <div class="product-price">
      <span class="current-price">{{ formattedPrice }}</span>
      <span v-if="stats" class="price-change" :class="trendClass">
        {{ trendSymbol }} {{ formatPercent(Math.abs(stats.diff30d)) }}
      </span>
    </div>
    <a class="store-link" :href="product.url" target="_blank" rel="noopener noreferrer">
      Перейти в магазин
    </a>
    <PriceChart
      v-if="isVisible"
      :product-id="product.id"
      :chart-height="160"
      @stats-ready="handleStatsReady"
    />

    <!-- Аналитика -->
    <div class="product-stats" v-if="stats">
      <div class="stat-item">
        <span class="stat-label">Текущая:</span>
        <span class="stat-value">{{ formatPrice(stats.current) }}</span>
      </div>
      <div class="stat-item" :class="trendClass">
        <span class="stat-label">Изменение:</span>
        <span class="stat-value">{{ formatPercent(stats.diff30d) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Минимум:</span>
        <span class="stat-value">{{ formatPrice(stats.min) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Волатильность:</span>
        <span class="stat-value">{{ stats.volatility.toFixed(1) }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import PriceChart from './PriceChart.vue'

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
    const stats = ref(null)
    const cardElement = ref(null)
    const observer = ref(null)

    const formattedPrice = computed(() => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(props.product.price)
    })

    const trendClass = computed(() => ({
      'trend-up': stats.value?.diff30d > 0,
      'trend-down': stats.value?.diff30d < 0
    }))

    const trendSymbol = computed(() => {
      if (!stats.value) return ''
      return stats.value.diff30d > 0 ? '↑' : '↓'
    })

    const handleImageError = (e) => {
      e.target.src = 'https://placehold.co/200x200?text=No+Image'
    }

    const handleStatsReady = (newStats) => {
      stats.value = newStats
    }

    const formatPercent = (value) => {
      return `${(value * 100).toFixed(1)}%`
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(price)
    }

    onMounted(() => {
      observer.value = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            isVisible.value = true
            observer.value.disconnect()
          }
        },
        { threshold: 0.1 }
      )

      if (cardElement.value) {
        observer.value.observe(cardElement.value)
      }
    })

    onUnmounted(() => {
      observer.value?.disconnect()
    })

    return {
      isVisible,
      stats,
      cardElement,
      formattedPrice,
      trendClass,
      trendSymbol,
      handleImageError,
      handleStatsReady,
      formatPercent,
      formatPrice
    }
  }
}
</script>

<style scoped lang="scss">
.product-card {
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-image {
  width: 100%;
  height: auto;
  aspect-ratio: 1/1;
  object-fit: contain;
  border-radius: 4px;
}

.separator {
  height: 1px;
  background: #eee;
  margin: 12px 0;
}

.product-title {
  font-size: 1rem;
  margin: 0 0 8px 0;
  flex-grow: 1;
}

.product-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.current-price {
  font-weight: 600;
  font-size: 1.1rem;
}

.price-change {
  font-size: 0.85rem;
}

.trend-up {
  color: #28a745;
  color: #dc3545;
}

.trend-down {
  color: #dc3545;
  color: #28a745;
}

.store-link {
  display: block;
  text-align: center;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  color: #333;
  text-decoration: none;
  transition: background 0.2s;
}

.store-link:hover {
  background: #eaeaea;
}

.product-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  font-size: 0.85rem;
  margin-top: 50px;

  & .stat-item {
    display: flex;
    flex-direction: column;

    & .stat-label {
      color: #666;
      margin-bottom: 2px;
    }

    &.stat-value {
      font-weight: 500;
    }
  }
}
</style>
