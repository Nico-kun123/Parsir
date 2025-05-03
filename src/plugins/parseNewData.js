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
      productList: '#listing-container > ul > li',
      productName: 'div.elBP.elDP > a',
      productPrice: 'div.elBP.elFP > div.undefined.elHY.elJY.elvI.elxI > span',
      productImage: 'div.elBP.elCP > a > img',
      productUrl: 'div.elBP.elDP > a',
      loadMoreButton: '#listing-container > div.elxx > button'
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
      productList: '.widget-search-result-container > div > div',
      productName: '.a5j > span',
      productPrice: '.ui-j > span',
      productImage: '.a5i img',
      productUrl: '.a5j',
      loadMoreButton: '.widget-search-show-more button'
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
async function parseProducts(page, category, storeConfig) {
  const { name, selectors, delays } = storeConfig

  // Навигация по странице
  try {
    await page.goto(category.url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  } catch (error) {
    console.log(
      `${makeMessageHead('ERROR')} — Ошибка загрузки страницы '${category.url}':\n\t${error.toString()}`
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

  await page.keyboard.press('End')

  // Нажатие кнопки "Показать ещё" (если она есть)
  for (let i = 0; i < 2; i++) {
    try {
      await page.waitForSelector(selectors.loadMoreButton, { timeout: 5000 }).catch(async () => {
        console.log(
          `${makeMessageHead('WARNING')} — Пробуем обновить UserAgent для страницы '${category.name}' (${category.url})...`
        )
        await page.setUserAgent(randomUserAgent())
        await page.reload()
      })
      await page.click(selectors.loadMoreButton)
      await page.keyboard.press('End')
      await randomDelay(delays.loadMore.min, delays.loadMore.max)
      await page.keyboard.press('End')
    } catch (error) {
      console.log(
        `${makeMessageHead('WARNING')} — Кнопка "Показать ещё" либо не найдена, либо её селектор был изменён! Пропускаем...`
      )
      break
    }
  }

  // TODO: это не обязательно только для OZON, но пока так (если магазинов будет больше, то можно будет убрать это условие)
  if (name === 'Ozon') {
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('End')
      await randomDelay(delays.loadMore.min, delays.loadMore.max)
    }
  }

  // Парсинг данных
  return await page.evaluate(
    (selectors, storeConfig, category) => {
      return [...document.querySelectorAll(selectors.productList)].map((card) => {
        const priceElement = card.querySelector(selectors.productPrice)
        const priceText = priceElement?.textContent?.split('руб')[0]?.trim() || 'Нет цены'
        const price = priceText !== 'Нет цены' ? priceText.replace(/\s/g, '') : 'Нет цены'

        return {
          name: card.querySelector(selectors.productName)?.textContent?.trim() || 'Нет названия',
          price: +price || -1,
          image: card.querySelector(selectors.productImage)?.src?.trim() || 'Нет картинки',
          url: card.querySelector(selectors.productUrl)?.href?.trim() || 'Нет ссылки',
          store_id: category.store_id,
          category_id: category.id,
          parse_date: new Date().toISOString()
        }
      })
    },
    selectors,
    storeConfig,
    category
  )
}

const parseNewDataALT = async (categories, storeKey) => {
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
  for (const category of categories) {
    const page = await browser.newPage() // Создаём новую страницу для каждой категории
    await page.setUserAgent(randomUserAgent())
    await page.setViewport({ width: 810, height: 900 })

    console.log(
      `${makeMessageHead()} — Переход на страницу '${category.name}' (магазин '${await printShopNameByID(category.store_id)}')...`
    )

    try {
      // Парсим данные для текущей категории
      const productData = await parseProducts(page, category, storeConfig)
      const filteredData = productData.flat().filter((product) => product.price !== -1)

      console.log(
        `${makeMessageHead('SUCCESS')} — Собрано ${filteredData.length} товаров для категории '${category.name}'!`
      )

      // Отправляем данные на сервер
      if (filteredData.length > 0) {
        console.log(`${makeMessageHead()} — Сохраняем данные в таблицу 'Products'...`)

        for (const product of filteredData) {
          if (MODE === 'debug') {
            console.log(product)
          } else {
            try {
              const response = await fetch(
                `http://localhost:${process.env.SERVER_PORT}/api/addNewProduct`,
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
          `${makeMessageHead('WARNING')} — Данные для категории '${category.name}' не были собраны!`
        )
      }
    } catch (error) {
      console.log(
        `${makeMessageHead('ERROR')} — Ошибка парсинга категории '${category.name}':\n\t${error.toString()}`
      )
    } finally {
      await page.close() // Закрываем страницу после завершения
      pageCounter++
    }

    // Задержка между категориями
    await randomDelay(5000, 6000)
  }

  if (pageCounter >= categories.length) {
    console.log(`${makeMessageHead()} — Закрытие браузера...`)
    await browser.close()
  }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const eldoradoCategories = await fetch(
  `http://localhost:${process.env.SERVER_PORT}/api/getAllCategories?store_id=1`
)
const eldorado = await eldoradoCategories.json()

// Парсинг для Эльдорадо
await parseNewDataALT(eldorado, 'eldorado')

// await randomDelay(15000, 25000)

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// const ozonCategories = await fetch(
//   `http://localhost:${process.env.SERVER_PORT}/api/getAllCategories?store_id=2`
// )
// const ozon = await ozonCategories.json()

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~