<template>
  <NavBar />
  <div class="products-page">
    <div class="page-header">
      <h1>{{ $route.query.category }}</h1>
      <div class="export-controls">
        <button @click="exportData('csv')" class="export-btn">
          <i class="fas fa-file-csv"></i> CSV
        </button>
        <button @click="exportData('xml')" class="export-btn">
          <i class="fas fa-file-code"></i> XML
        </button>
        <button @click="exportData('pdf')" class="export-btn">
          <i class="fas fa-file-pdf"></i> PDF
        </button>
      </div>
    </div>
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="product-grid">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
  </div>
</template>

<script>
import ProductCard from '/src/components/ProductCard.vue'
import NavBar from '/src/components/NavBar.vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'

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
    await this.loadProducts()
  },
  methods: {
    async loadProducts() {
      try {
        const response = await fetch(
          `http://localhost:5500/api/getProductsQuery?store_name=${this.$route.query.shop}&category_name=${this.$route.query.category}`
        )
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
    },

    exportData(format) {
      if (!this.products.length) {
        alert('Нет данных для экспорта')
        return
      }

      const filename = `${this.$route.query.category}_${new Date().toISOString().slice(0, 10)}`

      switch (format) {
        case 'csv':
          this.exportToCSV(filename)
          break
        case 'xml':
          this.exportToXML(filename)
          break
        case 'pdf':
          this.exportToPDF(filename)
          break
      }
    },

    exportToCSV(filename) {
      // Добавляем BOM для корректного отображения кириллицы
      const BOM = '\uFEFF'
      const headers = ['ID', 'Название', 'Цена', 'URL', 'Изображение']
      const rows = this.products.map((p) => [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.price,
        p.url,
        p.image
      ])

      const csvContent = BOM + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n') // Используем \r\n для совместимости

      this.downloadFile(filename + '.csv', 'text/csv;charset=utf-8;', csvContent)
    },

    exportToXML(filename) {
      const xmlItems = this.products
        .map(
          (p) => `
        <product>
          <id>${p.id}</id>
          <name><![CDATA[${p.name}]]></name>
          <price>${p.price}</price>
          <url>${p.url}</url>
          <image>${p.image}</image>
        </product>
      `
        )
        .join('')

      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<products>
  ${xmlItems}
</products>`

      this.downloadFile(filename + '.xml', 'application/xml;charset=utf-8;', xmlContent)
    },

    async exportToPDF(filename) {
      try {
        // Создаем временный HTML элемент с данными
        const tempDiv = document.createElement('div')
        tempDiv.style.position = 'absolute'
        tempDiv.style.left = '-9999px'
        tempDiv.style.top = '-9999px'
        tempDiv.style.width = '100%'
        tempDiv.style.height = 'auto'
        tempDiv.style.margin = 'auto'
        tempDiv.style.padding = '10px'
        tempDiv.style.backgroundColor = 'white'
        tempDiv.style.fontFamily = 'Arial, sans-serif'
        tempDiv.style.lineHeight = '1'

        // Разбиваем товары на группы для лучшей пагинации
        const itemsPerPage = 15
        const pages = []

        for (let i = 0; i < this.products.length; i += itemsPerPage) {
          pages.push(this.products.slice(i, i + itemsPerPage))
        }

        // Создаем HTML для каждой страницы
        const pagesHTML = pages
          .map((pageProducts, pageIndex) => {
            const startIndex = pageIndex * itemsPerPage
            const endIndex = Math.min(startIndex + itemsPerPage, this.products.length)

            return `
        <div class="page" style="
          min-height: 900px; 
          width: 100%;
          page-break-after: always; 
          padding: 10px;
          ${pageIndex > 0 ? '' : ''}
        ">
          <table style="
            width: 100%; 
            margin: auto;
            border-collapse: collapse; 
            font-size: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
            <thead>
              <tr style="color: black; line-height: 1;">
                <th style="border: 1px solid #ddd; padding: 10px 8px; text-align: left; font-weight: bold;">ID</th>
                <th style="border: 1px solid #ddd; padding: 10px 8px; text-align: left; font-weight: bold;">Название товара</th>
                <th style="border: 1px solid #ddd; padding: 10px 8px; text-align: center; font-weight: bold;">Цена</th>
                <th style="border: 1px solid #ddd; padding: 10px 8px; text-align: left; font-weight: bold;">Ссылка</th>
              </tr>
            </thead>
            <tbody>
              ${pageProducts
                .map(
                  (p, rowIndex) => `
                <tr style="background-color: ${rowIndex % 2 === 0 ? '#f8f9fa' : 'white'}; max-height: 20px;">
                  <td style="
                    border: 1px solid #ddd; 
                    padding: 10px 8px; 
                    text-align: center;
                    font-weight: bold;
                    color: #495057;
                    max-height: 25px;
                  ">${p.id}</td>
                  <td style="
                    border: 1px solid #ddd; 
                    padding: 10px 8px; 
                    max-width: 300px;
                    word-wrap: break-word;
                    line-height: 1.2;
                    min-width: 550px;
                    max-height: 25px;
                  ">${p.name}</td>
                  <td style="
                    border: 1px solid #ddd; 
                    padding: 10px 8px; 
                    text-align: center;
                    font-weight: bold;
                    color: #28a745;
                    white-space: nowrap;
                    max-height: 25px;
                  ">${p.price} ₽</td>
                  <td style="
                    border: 1px solid #ddd; 
                    padding: 10px 8px; 
                    word-break: break-all;
                    font-size: 10px;
                    color: #6c757d;
                    line-height: 1.2;
                    min-width: 280px;
                    max-height: 25px;
                  ">${p.url.length > 50 ? p.url.substring(0, 50) + '...' : p.url}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div style="
            margin-top: 20px; 
            margin-bottom: 20px;
            padding-top: 15px; 
            border-top: 1px solid #ddd; 
            text-align: center; 
            color: #6c757d; 
            font-size: 10px;
            width: 100%;
          ">
            Сгенерировано автоматически • ${new Date().toLocaleString('ru-RU')}
          </div>
        </div>
      `
          })
          .join('')

        tempDiv.innerHTML = `
      <div style="font-family: Arial, sans-serif;">
        ${pagesHTML}
      </div>
    `

        document.body.appendChild(tempDiv)

        // Конвертируем в canvas с высоким качеством
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 1000,
          height: tempDiv.scrollHeight,
          scrollX: 0,
          scrollY: 0
        })

        // Удаляем временный элемент
        document.body.removeChild(tempDiv)

        // Создаем PDF с правильной пагинацией
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        })

        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = pdfWidth - 20 // Отступы по 10мм с каждой стороны
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        // Высота одной страницы в пикселях на canvas
        const pageHeightInCanvas = canvas.height / pages.length
        const pageHeightInPDF = (pageHeightInCanvas * imgWidth) / canvas.width

        // Добавляем каждую страницу отдельно
        for (let pageNum = 0; pageNum < pages.length; pageNum++) {
          if (pageNum > 0) {
            pdf.addPage()
          }

          // Вычисляем позицию для обрезки canvas
          const sourceY = pageNum * pageHeightInCanvas
          const sourceHeight = pageHeightInCanvas

          // Создаем временный canvas для текущей страницы
          const pageCanvas = document.createElement('canvas')
          const pageCtx = pageCanvas.getContext('2d')

          pageCanvas.width = canvas.width
          pageCanvas.height = sourceHeight

          // Копируем нужную часть изображения
          pageCtx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sourceHeight,
            0,
            0,
            canvas.width,
            sourceHeight
          )

          const pageImgData = pageCanvas.toDataURL('image/png', 1.0)

          // Добавляем изображение в PDF
          pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, pageHeightInPDF)
        }

        pdf.save(filename + '.pdf')
      } catch (err) {
        console.error('Ошибка при генерации PDF:', err)
        alert('Не удалось создать PDF файл')
      }
    },
    downloadFile(filename, type, content) {
      try {
        const blob = new Blob([content], { type })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        setTimeout(() => {
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }, 100)
      } catch (err) {
        console.error('Ошибка при скачивании файла:', err)
        alert('Не удалось скачать файл')
      }
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.export-controls {
  display: flex;
  gap: 10px;
}

.export-btn {
  padding: 8px 15px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
}

.export-btn:hover {
  background: #e0e0e0;
}

.error {
  color: #dc3545;
  padding: 20px;
  text-align: center;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .export-controls {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
