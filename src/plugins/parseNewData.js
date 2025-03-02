// Плагины
import makeMessageHead from './makeMessageHead.js'
import randomUserAgent from './parserUserAgentGenerator.js'
import randomDelay from './parserTimeDelay.js'
import startPuppeteer from './startPuppeteer.js'

/**
 * Браузер, в котором открываются страницы для бота.
 */
const browser = await startPuppeteer()

let pageCounter = 0

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
const printShopNameByID = (id) => {
  const shopNames = {
    1: 'Эльдорадо',
    2: 'Ozon'
  }
  if (shopNames[id]) {
    return shopNames[id]
  }
  console.log(
    `${makeMessageHead('WARNING')} — Неизвестный ID магазина! (функция '${printShopNameByID.name}')`
  )
  return '???'
}

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
  const page = await browser.newPage()

  await page.setUserAgent(randomUserAgent())
  await page.setViewport({ width: 810, height: 900 })

  const parsedData = await Promise.all(
    category.map(async (category) => {
      console.log(
        `${makeMessageHead()} — Переход на страницу '${category.name}' (магазин '${printShopNameByID(category.store_id)}')...`
      )

      try {
        await page.goto(`${category.url}`, { waitUntil: 'domcontentloaded' })
        await randomDelay(3000, 4000)

        await page.keyboard.press('End')
        // TODO: Можно увеличить кол-во итераций, чтобы больше данных бот собирал 👀
        for (let i = 0; i < 2; i++) {
          try {
            await page
              .waitForSelector('#listing-container > div.Gy > button', { timeout: 5000 })
              .catch(async () => {
                console.log(
                  `${makeMessageHead('WARNING')} — Пробуем обновить UserAgent для страницы '${category.name}' (${category.url})...`
                )

                await page.setUserAgent(randomUserAgent())
                await page.reload()
              })

            await page.click('#listing-container > div.Gy > button')
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
              `${makeMessageHead('WARNING')} — Категория '${category.name}' (магазин '${printShopNameByID(category.store_id)}') не содержит товаров!`
            )
            await page.reload()
          })

        const productData = await page.evaluate(async () => {
          // Собираем все карточки товаров
          const cards = document.querySelectorAll('#listing-container > ul > li.PD > div')

          // console.log(` — Количество товаров в категории: ${cards.length}`)

          // Преобразуем каждую карточку в объект с данными
          return [...cards].map((card) => {
            let price =
              card.querySelector('.LW.TW')?.textContent.split('руб')[0].trim() || 'Нет цены'

            if (price !== 'Нет цены') {
              price = price.replace(' ', '')
            }
            return {
              name: card.querySelector('.ZD')?.textContent.trim() || 'Нет названия',
              price: +price || -1,
              image: card.querySelector('.BC')?.getAttribute('src')?.trim() || 'Нет картинки',
              url: card.querySelector('.ZD')?.getAttribute('href')?.trim() || 'Нет ссылки',
              store_id: '',
              category_id: '',
              // parse_date: new Date()
              parse_date: ''
            }
          })
        })

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
          // console.log(product)
        })

        pageCounter++
        await page.close()

        return productData
      } catch (error) {
        pageCounter++
        await page.close()
        console.log(
          `${makeMessageHead('ERROR')} — Ошибка парсинга категории '${category.name}' (магазин '${printShopNameByID(category.store_id)}'):\n\t${error.toString()}`
        )
      }
    })
  )

  if (parsedData.flat().length === 0) {
    console.log(
      `${makeMessageHead('WARNING')} — Данные со страницы '${category.name}' (магазин '${printShopNameByID(category.store_id)}') не были собраны! Это может быть связано с тем, что бот был заблокирован.`
    )
  } else {
    console.log(`${makeMessageHead()} — Сохраняем данные в таблицу 'Products'...`)

    // TODO: Раскомментить, когда убедишься, что данные правильно собираются 👀.
    // parsedData.flat().forEach(async (product) => {
    //   console.log(product)
    //   // await fetch('http://localhost:3000/api/addProduct', {
    //   //   method: 'POST',
    //   //   headers: { 'Content-Type': 'application/json' },
    //   //   body: JSON.stringify({ productData: product })
    //   // })
    // })
  }

  await randomDelay(5000, 6000)
  if (pageCounter >= 50) {
    console.log(`${makeMessageHead()} — Закрытие браузера...`)
    await browser.close()
  }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//* ✨ ПАРСИНГ НОВЫХ ДАННЫХ ПО ОТДЕЛЬНЫМ КАТЕГОРИЯМ ТОВАРОВ ✨
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

for (let id = 1; id <= 50; id++) {
  const categoriesList = await fetch(
    `http://localhost:3000/api/getAllCategories?store_id=1&categoryId=${id}`
  )

  const categories = await categoriesList.json()
  await parseNewData(categories)
  await randomDelay(15000, 25000)
}
