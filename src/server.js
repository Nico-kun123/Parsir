// Библиотеки
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Загружаем переменные окружения
import 'dotenv/config'

// Модули и плагины
import database from './database.js'
import makeMessageHead from './plugins/makeMessageHead.js'
import compareParseDate from './plugins/compareParseDate.js'

const app = express()

// Конфигурация сервера
app.use(express.json())
app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Порт
const PORT = 5500

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//* ✨ ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ✨
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ...

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//* ✨ MIDDLEWARE ДЛЯ АВТОРИЗАЦИИ ✨
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Middleware для проверки токена авторизации.
 * Если токен отсутствует или истек, то возвращается ошибка.
 */
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(403).send('Токен отсутствует!') // '403' — ошибка доступа к ресурсу
  }

  try {
    const user = jwt.verify(token, import.meta.env?.SECRET_KEY || 'secretKey')
    req.user = user
    next()
  } catch {
    return res.status(401).send('Неверный или истекший токен!') // '401' — ошибка авторизации/аутентификации
  }
}

/**
 * Генерация токена авторизации.
 * Срок действия токена: 30 минут.
 *
 * @returns Токен авторизации.
 */
function generateToken(user) {
  // TODO: Изменить срок годности токена на 30 минут.
  // return jwt.sign({ email: user.email }, 'secretKey', {
  //   expiresIn: '2h'
  // })

  return jwt.sign({ email: user.email }, import.meta.env?.SECRET_KEY || 'secretKey', {
    expiresIn: '1h'
  })
}

// const authMiddleware = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1]
//   try {
//     if (!token) {
//       return res.status(403).send('Токен отсутствует!') // Добавляем return
//     }
//     jwt.verify(token, 'secretKey', (err, user) => {
//       if (err) {
//         return res.status(401).send('Неверный или истекший токен!') // Добавляем return
//       }
//       req.user = user
//       next()
//     })
//   } catch (error) {
//     return res.status(401).send('Неверный или истекший токен!') // Добавляем return
//   }
// }

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//* ✨ API-ЗАПРОСЫ ДЛЯ РАЗРАБОТАННОГО СЕРВИСА ✨
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Получить роль пользователя по его электронной почте
app.post('/api/get-user-role', async (req, res) => {
  const { email } = req.body

  try {
    console.log(`${makeMessageHead()} — Получение роли пользователя...`)
    const result = await database.query('SELECT isadmin FROM Users WHERE email = $1', [email])
    console.log(`${makeMessageHead('SUCCESS')} — Роль пользователя получена!`)
    res.status(200).send(result.rows[0].isadmin)
  } catch (err) {
    console.log(
      `${makeMessageHead('ERROR')} — Ошибка получения роли пользователя:\n\t${err.toString()}`
    )
    res.status(500).send(`Ошибка получения роли пользователя:\n\t${err.toString()}`)
  }
})

// Получить список всех пользователей
app.get('/api/get-all-users', async (req, res) => {
  try {
    console.log(`${makeMessageHead()} — Получение списка пользователей...`)

    // TODO: Получать всё, кроме паролей
    const result = await database.query('SELECT * FROM Users')

    console.log(`${makeMessageHead('SUCCESS')} — Список всех пользователей получен!`)
    res.status(200).json(result.rows)
  } catch (err) {
    console.log(
      `${makeMessageHead('ERROR')} — Ошибка получения списка пользователей:\n\t${err.toString()}`
    )
    res.status(500).send(`Ошибка получения списка пользователей:\n\t${err.toString()}`)
  }
})

// Получение всех категорий товаров
app.get('/api/getAllCategories', async (req, res) => {
  const { shopId, categoryId } = req.query

  const queryParams = []
  let query = 'SELECT * FROM Categories'

  if (shopId) {
    query += ' WHERE store_id = $1'
    queryParams.push(shopId)

    if (categoryId) {
      query += ' AND id = $2'
      queryParams.push(categoryId)
    }
  } else if (categoryId) {
    query += ' WHERE id = $1'
    queryParams.push(categoryId)
  }

  try {
    const result = await database.query(query, queryParams)
    res.status(201).json(result.rows)
  } catch (err) {
    res.status(500).send(`Ошибка получения списка категорий:\n\t${err.toString()}`)
  }
})

app.get('/api/checkProductDate', async (req, res) => {
  const { shopId } = req.query

  const queryParams = []
  let query = 'SELECT COUNT(*) FROM Categories'

  if (shopId) {
    query += ' WHERE store_id = $1'
    queryParams.push(shopId)
  } else {
    console.log(
      `${makeMessageHead('ERROR')} — Нельзя получить количество категорий! Не указан ID магазина!`
    )
    return res.status(400).json({ message: 'Не указан ID магазина!' })
  }

  try {
    const result = await database.query(query, queryParams)
    res.status(201).json(result.rows[0].count)
  } catch (err) {
    res.status(500).send(`Ошибка получения количества категорий:\n\t${err.toString()}`)
  }
})

// Добавление нового товара в базу данных.
app.post('/api/addNewProduct', async (req, res) => {
  const { productData } = req.body

  if (!productData) {
    console.log(`${makeMessageHead('ERROR')} — Данные товара не предоставлены!`)
    return res.status(400).json({ message: 'Данные продукта не предоставлены.' })
  }

  try {
    // Проверяем, существует ли товар
    const existingProduct = await database.query('SELECT id FROM Products WHERE url = $1', [
      productData.url
    ])

    if (existingProduct.rows.length > 0) {
      console.log(
        `${makeMessageHead()} — Товар ${productData.name} (${productData.url}) уже существует, обновляем цену.`
      )

      // Обновляем цену (триггер сам добавит запись в ParseLog)
      await database.query('UPDATE Products SET price = $1, parse_date = $2 WHERE url = $3', [
        productData.price,
        productData.parse_date || new Date(),
        productData.url
      ])

      return res.status(200).json({ message: 'Цена товара обновлена.' })
    } else {
      // Добавляем новый товар (триггер сам добавит запись в ParseLog)
      const newProduct = await database.query(
        `INSERT INTO Products (name, price, image, url, store_id, category_id, parse_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`, // <- Важно: RETURNING id
        [
          productData.name,
          productData.price,
          productData.image,
          productData.url,
          productData.store_id,
          productData.category_id,
          new Date()
        ]
      )

      console.log(`${makeMessageHead('SUCCESS')} — Товар "${productData.name}" добавлен!`)

      return res.status(200).json(newProduct.rows[0])
    }
  } catch (error) {
    console.error(`${makeMessageHead('ERROR')} — Ошибка при добавлении товара:\n${error}`)
    return res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Получение истории цен для товара
app.get('/api/products/:id/price-history', async (req, res) => {
  try {
    const { rows } = await database.query(
      'SELECT price, parse_date FROM parselog WHERE product_id = $1 ORDER BY parse_date ASC',
      [req.params.id]
    )

    // Добавляем проверку на пустой результат
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Price history not found for this product' })
    }

    res.json(rows)
  } catch (err) {
    console.error('Database error:', err)
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
})

// TODO: можно пока без этого обойтись
// Получение ID товара по его URL
app.get('/api/getProductID', async (req, res) => {
  const { url } = req.query

  try {
    const result = await database.query('SELECT id FROM PRODUCTS WHERE url = $1', [url])
    res.status(201).json(result.rows[0].id) // отправит число (id товара)
  } catch (err) {
    res.status(500).send(`Ошибка получения ID товара:\n\t${err.toString()}`)
  }
})

app.get('/api/getProducts', async (req, res) => {
  try {
    const result = await database.query('SELECT * FROM PRODUCTS')
    res.status(200).json(result.rows)
  } catch (err) {
    res.status(500).send(`Ошибка получения списка товаров:\n\t${err.toString()}`)
  }
})

app.get('/api/getProductsQuery', async (req, res) => {
  const { store_name, category_name } = req.query

  try {
    // Получаем store_id
    const storeResult = await database.query('SELECT id FROM stores WHERE name = $1', [store_name])

    if (storeResult.rows.length === 0) {
      return res.status(404).send('Магазин не найден')
    }
    const store_id = storeResult.rows[0].id

    let productsResult

    if (category_name.toLowerCase() === 'all') {
      // Запрос для всех категорий
      productsResult = await database.query('SELECT * FROM products WHERE store_id = $1', [
        store_id
      ])
    } else {
      // Получаем category_id и делаем обычный запрос
      const categoryResult = await database.query('SELECT id FROM categories WHERE name = $1', [
        category_name
      ])

      if (categoryResult.rows.length === 0) {
        return res.status(404).send('Категория не найдена')
      }
      const category_id = categoryResult.rows[0].id

      productsResult = await database.query(
        'SELECT * FROM products WHERE store_id = $1 AND category_id = $2',
        [store_id, category_id]
      )
    }

    res.status(200).json(productsResult.rows)
  } catch (err) {
    res.status(500).send(`Ошибка получения списка товаров:\n\t${err.toString()}`)
  }
})

// Получение истории цен для товара
app.get('/api/products/:id/price-history', async (req, res) => {
  try {
    const { rows } = await database.query(
      'SELECT price, parse_date FROM parselog WHERE product_id = $1 ORDER BY parse_date',
      [req.params.id]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// TODO: Он типо не нужен пока что
// app.post('/api/addProductLog', async (req, res) => {
//   const { productData } = req.body

//   if (!productData) {
//     console.log(`${makeMessageHead('ERROR')} — Данные товара не предоставлены!`)
//     return res.status(400).json({ message: 'Данные продукта не предоставлены.' })
//   }

//   const queryParams = [
//     productData.product_id,
//     parseInt(productData.price),
//     productData.parse_date,
//     productData.store_id
//   ]

//   const query =
//     'INSERT INTO PRODUCT_LOGS (product_id, price, parse_date, store_id) VALUES ($1, $2, $3, $4)'

//   try {
//     const result = await database.query(query, queryParams)
//     console.log(
//       `${makeMessageHead('SUCCESS')} — Новая запись лога для товара ID:${productData.product_id} успешно добавлена!`
//     )
//     res.status(201).json(result.rows)
//   } catch (err) {
//     console.log(`${makeMessageHead('ERROR')} — Ошибка добавления лога товара:\n\t${err.toString()}`)
//     res.status(500).send(`Ошибка добавления лога товара:\n\t${err.toString()}`)
//   }
// })

// Обновление данных товара в базе данных.
app.post('/api/updateProductData', async (req, res) => {
  const { productData } = req.body

  if (!productData) {
    console.log(`${makeMessageHead('ERROR')} — Данные товара не предоставлены!`)
    return res.status(400).json({ message: 'Данные продукта не предоставлены.' })
  }

  try {
    const query = 'SELECT * FROM PRODUCTS WHERE url = $1'
    const queryParams = [productData.url]
    const result = await database.query(query, queryParams)
    if (result.rows.length === 0) {
      console.log(
        `${makeMessageHead('ERROR')} — Товар '${productData.url}' не найден в базе данных!`
      )
      return res.status(404).json({ message: 'Товар с таким URL не найден в базе данных.' })
    }
  } catch (error) {
    console.log(
      `${makeMessageHead('ERROR')} — Ошибка проверки наличия товара в базе данных:\n\t${error.toString()}`
    )
  }

  const queryParams = [parseInt(productData.price), productData.parse_date, productData.url]
  const query = `UPDATE PRODUCTS SET price = $1, parse_date = $2 WHERE url = $3`

  try {
    const result = await database.query(query, queryParams)
    console.log(
      `${makeMessageHead('SUCCESS')} — Данные товара '${productData.url}' успешно обновлены!`
    )
    res.status(201).json(result.rows)
  } catch (err) {
    console.log(
      `${makeMessageHead('ERROR')} — Ошибка обновления данных товара:\n\t${err.toString()}`
    )
    res.status(500).send(`Ошибка обновления данных товара:\n\t${err.toString()}`)
  }
})

// Регистрация пользователя
app.post('/api/registerUser', async (req, res) => {
  const { email, password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    await database.query('INSERT INTO Users (email, password) VALUES ($1, $2)', [
      email,
      hashedPassword
    ])
    console.log(`${makeMessageHead('SUCCESS')} — Пользователь '${email}' успешно зарегистрирован!`)
    res.status(201).send('Пользователь зарегистрирован!')
  } catch (err) {
    console.log(`${makeMessageHead('ERROR')} — Ошибка процедуры регистрации:\n\t${err.toString()}`)
    res.status(500).send(`Ошибка процедуры регистрации:\n\t${err.toString()}`)
  }
})

// Авторизация пользователя
app.post('/api/loginUser', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await database.query('SELECT * FROM Users WHERE email = $1', [email])
    if (!user.rows[0]) {
      console.log(`${makeMessageHead('ERROR')} — Пользователь '${email}' не найден!`)
      res.status(404).send('Пользователь не найден!')
    } else if (!(await bcrypt.compare(password, user.rows[0].password))) {
      console.log(`${makeMessageHead('ERROR')} — Пароль неверен!`)
      res.status(401).send('Пароль неверен!')
    } else {
      console.log(`${makeMessageHead('SUCCESS')} — Пользователь '${email}' успешно авторизован!`)
      await database.query('UPDATE Users SET last_login = NOW() WHERE email = $1', [email])
      res.status(200).json({ token: generateToken(user.rows[0]) })
    }
  } catch (err) {
    console.log(`${makeMessageHead('ERROR')} — Ошибка процедуры авторизации:\n\t${err.toString()}`)
    res.status(500).send(err.toString())
  }
})

// Выход из системы
app.post('/api/logout', authMiddleware, (req, res) => {
  console.log(`${makeMessageHead('SUCCESS')} — Пользователь '${req.user.email}' вышел из системы!`)
  res.status(200).json({ message: 'Успешный выход из системы' })
})

// Централизованный обработчик ошибок
app.use((err, res) => {
  console.log(`${makeMessageHead('ERROR')} — Произошла ошибка:\n\t${err.toString()}`)
  res
    .status(500)
    .json({ message: `${makeMessageHead('ERROR')} — Произошла ошибка:\n\t${err.toString()}` })
})

// ЗАПУСК СЕРВЕРА
app.listen(PORT, () => {
  console.log(`${makeMessageHead()} — Сервер запущен на порту ${PORT}!`)
})
