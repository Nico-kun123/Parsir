<template>
  <div class="stats-grid">
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
</template>

<script>
export default {
  props: {
    stats: {
      type: Object,
      required: true
    }
  },
  computed: {
    trendClass() {
      return {
        'trend-up': this.stats.diff30d > 0,
        'trend-down': this.stats.diff30d < 0
      }
    }
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
      }).format(price)
    },
    formatPercent(value) {
      return `${value > 0 ? '+' : ''}${(value * 100).toFixed(1)}%`
    }
  }
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  font-size: 0.85rem;
  margin-top: 50px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  color: #666;
  margin-bottom: 2px;
}

.stat-value {
  font-weight: 500;
}

.trend-up .stat-value {
  color: #28a745;
}

.trend-down .stat-value {
  color: #dc3545;
}
</style>
