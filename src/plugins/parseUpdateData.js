// Плагины
import makeMessageHead from './makeMessageHead.js'
import randomUserAgent from './parserUserAgentGenerator.js'
import randomDelay from './parserTimeDelay.js'
import startPuppeteer from './startPuppeteer.js'

// Загружаем переменные окружения
import 'dotenv/config'

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//* ✨ ПЕРЕМЕННЫЕ ✨
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Браузер, в котором открываются страницы для бота.
const browser = await startPuppeteer()

// Счетчик страниц
let pageCounter = 0

// Конфигурация магазинов
const STORE_CONFIG = {
  eldorado: {
    name: 'Эльдорадо',
    baseUrl: 'https://www.eldorado.ru',
    selectors: {
      productCard: '#__next > div.elh > main > div > div.elXr > div.elsH > div > div.el2H',
      productPrice: '#__next > div.elh > main > div > div.elXr > div.elsH > div > div.el2H > p.el3H'
    },
    delays: {
      navigation: { min: 10000, max: 15000 },
      loadMore: { min: 5000, max: 8000 }
    }
  },
  ozon: {
    name: 'Ozon',
    baseUrl: 'https://www.ozon.ru',
    selectors: {
      productCard: '.widget-search-result-container > div > div',
      productPrice: '.ui-j > span'
    },
    delays: {
      navigation: { min: 1000, max: 2000 },
      loadMore: { min: 2000, max: 3000 }
    }
  }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//* ✨ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ✨
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Возвращает название интернет-магазина по его ID.
 *
 * Доступные ID:
 * - 1 — Эльдорадо;
 * - 2 — Ozon.
 *
 * @param {number} id ID интернет-магазина
 * @returns Название интернет-магазина, если id соответствует одному из доступных. В противном случае '???'.
 */
async function printShopNameByID(id) {
  const shopNames = {
    1: 'Эльдорадо',
    2: 'Ozon'
  }
  if (shopNames[id]) {
    return shopNames[id]
  }
  console.log(
    `${makeMessageHead('WARNING')} — Неизвестный ID магазина (${id})! Это может быть связано с изменением названий селекторов на сайте интернет-магазина.`
  )
  return '???'
}

/**
 * Проверяет, что все данные товара заполнены корректно.
 *
 * @param {Object} product Данные товара
 * @returns {boolean} true, если данные корректны, иначе false
 */
const isProductValid = (product) => {
  const { name, price, image, url } = product

  // Проверяем, что все поля заполнены и не содержат значений по умолчанию
  return name !== 'Нет названия' && price !== -1 && image !== 'Нет картинки' && url !== 'Нет ссылки'
}

/**
 * Закрывает страницу парсинга, если она открыта.
 *
 * @param {puppeteer.Page} page Страница, которую нужно закрыть
 */
async function closePage(page) {
  await page.close()
  pageCounter++
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//* ✨ ПАРСИНГ ДАННЫХ С САЙТОВ ✨
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 *
 *
 * @param {puppeteer.Page} page -
 * @param {object} category -
 * @param {object} storeConfig -
 * @returns {Promise<Array>}
 *
 */
/**
 * Парсит актуальные цены товаров по их URL из базы данных
 * @param {string} storeKey Ключ магазина ('eldorado' или 'ozon')
 */
async function parseProductPrices(storeKey) {
  const storeConfig = STORE_CONFIG[storeKey]
  if (!storeConfig) {
    console.log(`${makeMessageHead('ERROR')} — Конфигурация для магазина '${storeKey}' не найдена!`)
    return
  }

  try {
    // 1. Получаем все товары из базы данных
    const response = await fetch(`http://localhost:${process.env.SERVER_PORT}/api/getProducts`)
    const products = await response.json()

    // Фильтруем товары только для текущего магазина
    const storeId = storeKey === 'eldorado' ? 1 : 2
    const storeProducts = products.filter((p) => p.store_id === storeId)

    if (storeProducts.length === 0) {
      console.log(
        `${makeMessageHead('WARNING')} — Нет товаров для магазина ${storeConfig.name} в базе данных!`
      )
      return
    }

    // Получаем аргументы командной строки
    const MODE = process.env.npm_config_mode ? process.env.npm_config_mode : null // Извлекаем значение параметра '--mode'
    console.log(
      `${makeMessageHead('INFO')} — Парсим данные в режиме '${MODE ? MODE : 'production (по умолчанию)'}'...`
    )

    if (MODE === 'debug') {
      await randomDelay(9999999, 9999999)
    } else {
      // await randomDelay(3000, 4000)
      await randomDelay(storeConfig.delays.navigation.min, storeConfig.delays.navigation.max)
    }

    console.log(
      `${makeMessageHead()} — Начинаем проверку цен для ${storeProducts.length} товаров ${storeConfig.name}...`
    )

    // 2. Создаем новую страницу для парсинга
    const page = await browser.newPage()
    await page.setUserAgent(randomUserAgent())
    await page.setViewport({ width: 1200, height: 800 })

    // 3. Проверяем цены для каждого товара
    for (const product of storeProducts) {
      try {
        console.log(`${makeMessageHead()} — Проверяем товар: ${product.name} (${product.url})`)

        // Переходим на страницу товара
        await page.goto(product.url, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        })

        // Ждем загрузки и извлекаем цену
        await randomDelay(8000, 10000)
        const currentPrice = await extractProductPrice(page, storeConfig.selectors)

        if (currentPrice === null) {
          console.log(`${makeMessageHead('WARNING')} — Цена не найдена для товара ${product.name}`)
          continue
        }

        // Если цена изменилась - обновляем в БД
        if (currentPrice !== product.price) {
          await updateProductPrice(product.url, currentPrice)
        }

        // Задержка между запросами
        await randomDelay(8000, 10000)
      } catch (error) {
        console.log(
          `${makeMessageHead('ERROR')} — Ошибка при проверке товара ${product.name}: ${error.message}`
        )
      }
    }

    await page.close()
    console.log(`${makeMessageHead('SUCCESS')} — Проверка цен завершена!`)
  } catch (error) {
    console.log(`${makeMessageHead('ERROR')} — Ошибка при парсинге цен: ${error.message}`)
  }
}

/**
 * Извлекает цену товара со страницы
 */
async function extractProductPrice(page, selectors) {
  return await page.evaluate((selectors) => {
    try {
      const priceElement = document.querySelector(selectors.productPrice)
      if (!priceElement) return null

      const priceText = priceElement.textContent
        .split('руб')[0] // Удаляем всё после "руб"
        .replace(/[^\d,]/g, '') // Удаляем всё кроме цифр и запятых
        .replace(',', '.') // Заменяем запятую на точку для parseFloat

      return parseFloat(priceText)
    } catch (e) {
      return null
    }
  }, selectors)
}

/**
 * Обновляет цену товара в базе данных
 */
async function updateProductPrice(url, newPrice) {
  try {
    const response = await fetch(
      `http://localhost:${process.env.SERVER_PORT}/api/updateProductData`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productData: {
            url: url,
            price: newPrice,
            parse_date: new Date().toISOString()
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    console.log(`${makeMessageHead('SUCCESS')} — Цена товара обновлена!`)
  } catch (error) {
    console.log(`${makeMessageHead('ERROR')} — Ошибка при обновлении цены: ${error.message}`)
  }
}

// Пример использования после основного парсера:
await parseProductPrices('eldorado')
// await parseProductPrices('ozon');
