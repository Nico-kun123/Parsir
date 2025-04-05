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
      productName: 'div.YV._V > a',
      productPrice: 'div.YV.bW > div.undefined.L5.N5.qN.sN > span',
      productImage: 'div.YV.ZV > a > img',
      productUrl: 'div.YV._V > a',
      loadMoreButton: '#listing-container > div.rz > button'
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
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Функция для парсинга новых данных.
 *
 * Последовательность действий:
 * - Переход на страницу категории;
 * - Собираем данные из категории по всем товарам на странице ( название товара, стоимость, ссылка на страницу товара, ссылка на изображение товара);
 * - Добавляем товары в базу данных;
 * - Закрываем страницу. Если все страницы собраны, закрываем браузер.
 *
 * @param {Object} category Данные об одной категории товара (id категории, название категории, ссылка на страницу категории, ID магазина)
 * @returns {Promise<void>}
 */
const parseNewData = async (category) => {
  // Открываем новую страницу
  const page = await browser.newPage()

  // Настраиваем страницу
  await page.setUserAgent(randomUserAgent())
  await page.setViewport({ width: 810, height: 900 })

  // Получаем аргументы командной строки
  const MODE = process.env.npm_config_mode ? process.env.npm_config_mode : null // Извлекаем значение параметра '--mode'
  console.log(
    `${makeMessageHead('INFO')} — Парсим данные в режиме '${MODE ? MODE : 'production (по умолчанию)'}'...`
  )

  // Собираем данные
  const parsedData = await Promise.all(
    category.map(async (category) => {
      console.log(
        `${makeMessageHead()} — Переход на страницу '${category.name}' (магазин '${await printShopNameByID(category.store_id)}')...`
      )

      console.log(`${makeMessageHead('INFO')} — Текущий номер категории: ${pageCounter + 1}...`)

      try {
        await page.goto(`${category.url}`, { waitUntil: 'domcontentloaded' })

        if (MODE === 'debug') {
          await randomDelay(9999999, 9999999)
        } else {
          await randomDelay(3000, 4000)
        }

        await page.keyboard.press('End')

        // TODO: Можно увеличить кол-во итераций, чтобы больше данных бот собирал 👀
        for (let i = 0; i < 2; i++) {
          try {
            await page
              .waitForSelector('#listing-container > div.qA > button', { timeout: 5000 })
              .catch(async () => {
                console.log(
                  `${makeMessageHead('WARNING')} — Пробуем обновить UserAgent для страницы '${category.name}' (${category.url})...`
                )
                await page.setUserAgent(randomUserAgent())
                await page.reload()
              })

            await page.click('#listing-container > div.qA > button')
            await page.keyboard.press('End')
            await randomDelay(2000, 3000)
            await page.keyboard.press('End')
          } catch (error) {
            console.log(
              `${makeMessageHead('WARNING')} — Ошибка при навигации по странице '${category.name}' (${category.url}): ${error.toString()}`
            )
          }
          await page.keyboard.press('End')
        }

        console.log(`${makeMessageHead()} — Собираем данные из категории '${category.name}'...`)

        // Ждём пока появится селектор для списка товаров
        await page
          .waitForSelector('#listing-container > ul', { timeout: 10000 })
          .catch(async () => {
            console.log(
              `${makeMessageHead('WARNING')} — Категория '${category.name}' (магазин '${await printShopNameByID(category.store_id)}') не содержит товаров!`
            )
            await page.reload()
          })

        // Получаем данные о товарах на странице
        const productData = await page.evaluate(async () => {
          // Собираем все карточки товаров
          const cards = document.querySelectorAll('#listing-container > ul > li')

          return [...cards].map((card) => {
            // Преобразуем каждую карточку в объект с данными
            const priceElement = card.querySelector('div.VV.ZV > div.undefined.S5.U5.dN.fN > span')
            const priceText = priceElement ? priceElement.textContent : null

            let price = priceText ? priceText.split('руб')[0].trim() : 'Нет цены'
            if (price !== 'Нет цены') {
              price = price.replace(/\s/g, '') // Убираем все пробелы в цене
            }

            const nameElement = card.querySelector('div.VV.XV > a')
            const imageElement = card.querySelector('div.VV.WV > a > img')
            const urlElement = card.querySelector('div.VV.XV > a')

            return {
              name: nameElement?.textContent.trim() || 'Нет названия',
              price: +price || -1,
              image: imageElement?.getAttribute('src')?.trim() || 'Нет картинки',
              url:
                'https://www.eldorado.ru/' + urlElement?.getAttribute('href')?.trim() ||
                'Нет ссылки',
              store_id: '',
              category_id: '',
              parse_date: ''
            }
          })
        })

        // Добавляем данные о магазине и категории в каждый объект
        productData.forEach((product) => {
          Object.defineProperties(product, {
            store_id: {
              value: category.store_id
            },
            category_id: {
              value: category.id
            },
            parse_date: {
              value: new Date()
            }
          })
        })

        await closePage(page)
        console.log(`${makeMessageHead()} — Очистка некорректных данных...`)

        return productData
      } catch (error) {
        await closePage(page)
        console.log(
          `${makeMessageHead('ERROR')} — Ошибка парсинга категории '${category.name}' (магазин '${await printShopNameByID(category.store_id)}'):\n\t${error.toString()}`
        )
      }
    })
  )

  if (parsedData.flat().length === 0) {
    console.log(
      `${makeMessageHead('WARNING')} — Данные со страницы '${category.name}' (магазин '${await printShopNameByID(category.store_id)}') не были собраны! Это может быть связано с тем, что бот был заблокирован.`
    )
  } else {
    console.log(`${makeMessageHead()} — Сохраняем данные в таблицу 'Products'...`)

    const filteredData = parsedData.flat().filter((product) => product.price !== -1)

    filteredData.flat().forEach(async (product) => {
      if (MODE === 'debug') {
        console.log(product)
      } else {
        await fetch(`http://localhost:${process.env.SERVER_PORT}/api/addNewProduct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productData: product })
        })
      }
    })
  }

  await randomDelay(5000, 6000)
  if (pageCounter >= 50) {
    console.log(`${makeMessageHead()} — Закрытие браузера...`)
    await browser.close()
  }
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
          url:
            storeConfig.baseUrl + card.querySelector(selectors.productUrl)?.href?.trim() ||
            'Нет ссылки',
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

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const ozonCategories = await fetch(
  `http://localhost:${process.env.SERVER_PORT}/api/getAllCategories?store_id=2`
)
const ozon = await ozonCategories.json()

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Парсинг для Эльдорадо
await parseNewDataALT(eldorado, 'eldorado')

await randomDelay(15000, 25000)
