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
      productCard: '#listing-container > ul > li',
      productPrice: 'div.YV.bW > div.undefined.L5.N5.qN.sN > span',
      productSoldOut: 'div.YV.bW > div.undefined.L5.N5.qN.sN > span'
    },
    delays: {
      navigation: { min: 4000, max: 5000 },
      loadMore: { min: 3000, max: 4000 }
    }
  },
  ozon: {
    name: 'Ozon',
    baseUrl: 'https://www.ozon.ru',
    selectors: {
      productCard: '.widget-search-result-container > div > div',
      productPrice: '.ui-j > span',
      productSoldOut: '.ui-j > span'
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
 * Закрывает страницу парсинга, если она открыта.
 *
 * @param {puppeteer.Page} page Страница, которую нужно закрыть
 */
async function closePage(page) {
  await page.close()
  pageCounter++
}

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
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//* ✨ ПАРСИНГ ДАННЫХ С САЙТОВ ✨
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Parses product data from a given category page on an e-commerce website.
 *
 * @param {puppeteer.Page} page - The page instance used for navigation and evaluation.
 * @param {object} category - The category object containing the URL and identifiers for the category.
 * @param {object} storeConfig - The configuration object for the store containing selectors and delays.
 * @returns {Promise<Array>} A promise that resolves to an array of product data objects.
 *
 * The function navigates to the category URL, simulates scrolling and clicking the "Load More" button
 * to load more products if necessary, and evaluates the page content to extract product information
 * such as name, price, image URL, and product URL. The extracted data is returned as an array of objects.
 */
async function parseProducts(page, productData, storeConfig) {
  const { name, selectors, delays } = storeConfig

  // Навигация по странице
  try {
    await page.goto(productData.url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  } catch (error) {
    console.log(
      `${makeMessageHead('ERROR')} — Ошибка загрузки страницы '${productData.url}':\n\t${error.toString()}`
    )
    return [] // Пропустить категорию, если страница не загружена
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
    await randomDelay(delays.navigation.min, delays.navigation.max)
  }

  try {
    await page
      .waitForSelector(selectors.productSoldOut, { timeout: 5000 })
      .then(() => {
        console.log(
          `${makeMessageHead('WARNING')} — Товара '${productData.url}' нет в наличии! Пропускаем...`
        )
      })
      .then(async () => {
        await closePage(page)
      })
      .catch(async () => {
        console.log(
          `${makeMessageHead('SUCCESS')} — Товар '${productData.url}' есть в наличии! Продолжаем парсинг...`
        )
      })
  } catch (error) {
    console.log(
      `${makeMessageHead('ERROR')} — Ошибка загрузки страницы '${productData.url}':\n\t${error.toString()}`
    )

    await closePage(page)
  }

  // Парсинг данных
  return await page.evaluate(
    (selectors, productData, category) => {
      return [...document.querySelectorAll(selectors.productCard)].map((card) => {
        const priceElement = card.querySelector(selectors.productPrice)
        const priceText = priceElement?.textContent?.split('руб')[0]?.trim() || 'Нет цены'
        const price = priceText !== 'Нет цены' ? priceText.replace(/\s/g, '') : 'Нет цены'

        return {
          price: +price || -1,
          url: productData.url,
          parse_date: new Date().toISOString()
        }
      })
    },
    selectors,
    storeConfig,
    productData
  )
}

const parseUpdateData = async (products, storeKey) => {
  const storeConfig = STORE_CONFIG[storeKey]

  if (!storeConfig) {
    console.log(`${makeMessageHead('ERROR')} — Конфигурация для магазина '${storeKey}' не найдена!`)
    return
  }

  const MODE = process.env.npm_config_mode || 'production'
  console.log(
    `${makeMessageHead()} — Парсим данные в режиме '${MODE ? MODE : 'production (по умолчанию)'}'...`
  )

  // Обрабатываем категории по одной
  for (const product of products) {
    const page = await browser.newPage() // Создаём новую страницу для каждой категории
    await page.setUserAgent(randomUserAgent())
    await page.setViewport({ width: 810, height: 900 })

    console.log(
      `${makeMessageHead()} — Переход на страницу '${product.name}' (магазин '${await printShopNameByID(product.store_id)}')...`
    )

    try {
      // Парсим данные для текущей категории
      const productData = await parseProducts(page, product, storeConfig)
      const filteredData = productData.flat().filter((product) => product.price !== -1)

      //   console.log(
      //     `${makeMessageHead('SUCCESS')} — Собрано ${filteredData.length} товаров для категории '${product.name}'!`
      //   )

      //   console.log(filteredData)

      // Отправляем данные на сервер
      if (filteredData.length > 0) {
        console.log(`${makeMessageHead()} — Сохраняем данные в таблицу 'Parselog'...`)

        for (const product of filteredData) {
          if (MODE === 'debug') {
            console.log(product)
          } else {
            try {
              console.log(product)
              const response = await fetch(
                `http://localhost:${process.env.SERVER_PORT}/api/updateProductData`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ productData: product })
                }
              )

              if (!response.ok) {
                console.log(
                  `${makeMessageHead('ERROR')} — Ошибка при сохранении продукта (${response.statusText})!`
                )
              }
            } catch (error) {
              console.log(
                `${makeMessageHead('ERROR')} — Ошибка при отправке запроса на сервер:\n\t${error.toString()}`
              )
            }
          }
        }
      } else {
        console.log(
          `${makeMessageHead('WARNING')} — Данные для категории '${product.name}' не были собраны!`
        )
      }
    } catch (error) {
      console.log(
        `${makeMessageHead('ERROR')} — Ошибка парсинга категории '${product.name}':\n\t${error.toString()}`
      )
    } finally {
      await closePage(page)
    }

    // Задержка между категориями
    await randomDelay(5000, 6000)
  }

  if (pageCounter >= products.length) {
    console.log(`${makeMessageHead()} — Закрытие браузера...`)
    await browser.close()
  }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const eldoradoCategories = await fetch(
  `http://localhost:${process.env.SERVER_PORT}/api/getAllCategories?store_id=1`
)
const eldorado = await eldoradoCategories.json()

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Парсинг для Эльдорадо
await parseUpdateData(eldorado, 'eldorado')

await randomDelay(15000, 25000)
