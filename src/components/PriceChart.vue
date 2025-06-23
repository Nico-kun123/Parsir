<template>
  <div class="price-chart" ref="chartContainer">
    <canvas ref="chartCanvas" :style="{ height: chartHeight + 'px' }"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'

// Регистрируем только необходимые модули
Chart.register(...registerables)

// Кэш для хранения уже созданных графиков
const chartCache = new WeakMap()

export default {
  props: {
    productId: {
      type: Number,
      required: true
    },
    chartHeight: {
      type: Number,
      default: 200
    }
  },
  data() {
    return {
      chart: null,
      observer: null
    }
  },
  async mounted() {
    // Ленивая загрузка при появлении в области видимости
    this.setupIntersectionObserver()
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    async setupIntersectionObserver() {
      this.observer = new IntersectionObserver(
        async ([entry]) => {
          if (entry.isIntersecting) {
            await this.loadData()
            this.observer.disconnect()
          }
        },
        {
          threshold: 0.1
        }
      )

      this.observer.observe(this.$refs.chartContainer)
    },

    async loadData() {
      try {
        // Проверяем кэш
        if (chartCache.has(this.$refs.chartCanvas)) {
          this.chart = chartCache.get(this.$refs.chartCanvas)
          return
        }

        const response = await fetch(
          `http://localhost:5500/api/products/${this.productId}/price-history?limit=100`
        )

        if (!response.ok) throw new Error('Network response was not ok')

        const priceHistory = await response.json()
        this.renderOptimizedChart(priceHistory)
      } catch (error) {
        console.error('Error fetching price history:', error)
      }
    },

    calculateStats(priceHistory) {
      if (!priceHistory?.length) return null

      const prices = priceHistory.map((item) => item.price)
      const current = prices[prices.length - 1]
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length

      // Вычисляем изменение за 30 дней
      const last30Days = priceHistory.filter((item) => {
        const date = new Date(item.parse_date)
        return date > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      })

      const diff30d =
        last30Days.length > 1 ? (current - last30Days[0].price) / last30Days[0].price : 0

      // Вычисляем волатильность (стандартное отклонение)
      const squaredDiffs = prices.map((p) => Math.pow(p - avg, 2))
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / prices.length
      const volatility = (Math.sqrt(variance) / avg) * 100

      return {
        current,
        min,
        max,
        avg,
        diff30d,
        volatility
      }
    },

    renderOptimizedChart(priceHistory) {
      if (!priceHistory?.length || !this.$refs.chartCanvas) return

      const ctx = this.$refs.chartCanvas.getContext('2d')
      if (!ctx) return

      // Рассчитываем статистику
      const stats = this.calculateStats(priceHistory)
      this.$emit('stats-ready', stats)

      // Оптимизация данных - уменьшаем количество точек
      const optimizedData = this.optimizeChartData(priceHistory)

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: optimizedData.labels,
          datasets: [
            {
              label: 'История цены',
              data: optimizedData.prices,
              borderColor: 'rgb(75, 192, 192)',
              borderWidth: 1.5,
              pointRadius: 1.5,
              tension: 0.1
            },
            // Добавляем линию тренда
            this.createTrendLine(optimizedData, stats),
            // Добавляем маркеры экстремумов
            this.createExtremesMarkers(optimizedData, stats)
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 0 // Отключаем анимацию для производительности
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: (ctx) => `Цена: ${ctx.parsed.y} ₽`
              }
            }
          },
          scales: {
            x: { display: false }, // Скрываем ось X для производительности
            y: {
              beginAtZero: false,
              ticks: {
                callback: (value) => `${value} ₽`,
                maxTicksLimit: 5 // Ограничиваем количество меток
              }
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          }
        }
      })

      // Сохраняем в кэш
      chartCache.set(this.$refs.chartCanvas, this.chart)
    },

    optimizeChartData(data) {
      const maxPoints = 30 // Максимальное количество точек для отображения
      if (data.length <= maxPoints) {
        return {
          labels: data.map((item) => this.formatDate(item.parse_date)),
          prices: data.map((item) => item.price)
        }
      }

      const step = Math.ceil(data.length / maxPoints)
      const result = {
        labels: [],
        prices: []
      }

      for (let i = 0; i < data.length; i += step) {
        result.labels.push(new Date(data[i].parse_date).toLocaleDateString())
        result.prices.push(data[i].price)
      }

      return result
    },

    createTrendLine(data, stats) {
      const n = data.prices.length
      let xSum = 0,
        ySum = 0,
        xySum = 0,
        xxSum = 0

      data.prices.forEach((price, index) => {
        xSum += index
        ySum += price
        xySum += index * price
        xxSum += index * index
      })

      const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum)
      const intercept = (ySum - slope * xSum) / n

      return {
        label: 'Тренд',
        data: data.prices.map((_, i) => slope * i + intercept),
        borderColor: slope > 0 ? '#28a745' : '#dc3545',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0
      }
    },

    createExtremesMarkers(data, stats) {
      return {
        label: 'Экстремумы',
        data: data.prices.map((p) =>
          Math.abs(p - stats.min) < 0.01 || Math.abs(p - stats.max) < 0.01 ? p : null
        ),
        pointBackgroundColor: (ctx) =>
          Math.abs(ctx.raw - stats.min) < 0.01 ? '#28a745' : '#dc3545',
        pointRadius: 5,
        showLine: false
      }
    },

    // Форматирование даты для подписей
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
      })
    },

    cleanup() {
      this.observer?.disconnect()
      if (this.chart) {
        this.chart.destroy()
        chartCache.delete(this.$refs.chartCanvas)
      }
    }
  }
}
</script>

<style scoped>
.price-chart {
  position: relative;
  width: 100%;
}

.price-chart canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
