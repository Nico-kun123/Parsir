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
const PORT = process.env.SERVER_PORT || 3000

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
    expiresIn: '30m'
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
    console.log(`${makeMessageHead('ERROR')} — Данные товара не предоставлены!')`)
    return res.status(400).json({ message: 'Данные продукта не предоставлены.' })
  }

  try {
    const query = 'SELECT * FROM PRODUCTS WHERE url = $1'
    const queryParams = [productData.url]
    const result = await database.query(query, queryParams)
    if (result.rows.length > 0) {
      console.log(
        `${makeMessageHead()} — Товар ${productData.name} (${productData.url}) уже существует в базе данных!`
      )
      return res.status(200).json({ message: 'Товар с таким URL уже существует.' })
    }
  } catch (error) {
    console.log(
      `${makeMessageHead('ERROR')} — Ошибка проверки наличия товара в базе данных:\n\t${error.toString()}`
    )
  }

  const queryParams = [
    productData.name,
    parseInt(productData.price),
    productData.image,
    productData.url,
    productData.store_id,
    productData.category_id,
    productData.parse_date
  ]
  const query =
    'INSERT INTO PRODUCTS (name, price, image, url, store_id, category_id, parse_date) VALUES ($1, $2, $3, $4, $5, $6, $7)'

  try {
    const result = await database.query(query, queryParams)
    console.log(
      `${makeMessageHead('SUCCESS')} — Новый товар '${productData.name}' успешно добавлен в базу данных!`
    )

    const productID = result.rows[0].id

    const logData = {
      product_id: productID,
      price: parseInt(productData.price),
      parse_date: productData.parse_date,
      store_id: productData.store_id
    }

    console.log(logData)

    try {
      // Выполняем внутренний запрос к API для добавления лога
      await database.query(
        'INSERT INTO PRODUCT_LOGS (product_id, price, parse_date, store_id) VALUES ($1, $2, $3, $4)',
        [productID, parseInt(productData.price), productData.parse_date, productData.store_id]
      )

      console.log(
        `${makeMessageHead('SUCCESS')} — Новая запись лога для товара ID=${productID} (store_id=${productData.store_id}) успешно добавлена!`
      )
    } catch (error) {
      console.log(
        `${makeMessageHead('ERROR')} — Ошибка добавления лога товара:\n\t${error.toString()}`
      )
    }

    res.status(201).json(result.rows)
  } catch (err) {
    console.log(
      `${makeMessageHead('ERROR')} — Ошибка добавления нового товара:\n\t${err.toString()}`
    )
    res.status(500).send(`Ошибка добавления нового товара:\n\t${err.toString()}`)
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

// TODO: Он типо не нужен пока что
app.post('/api/addProductLog', async (req, res) => {
  const { productData } = req.body

  if (!productData) {
    console.log(`${makeMessageHead('ERROR')} — Данные товара не предоставлены!`)
    return res.status(400).json({ message: 'Данные продукта не предоставлены.' })
  }

  const queryParams = [
    productData.product_id,
    parseInt(productData.price),
    productData.parse_date,
    productData.store_id
  ]

  const query =
    'INSERT INTO PRODUCT_LOGS (product_id, price, parse_date, store_id) VALUES ($1, $2, $3, $4)'

  try {
    const result = await database.query(query, queryParams)
    console.log(
      `${makeMessageHead('SUCCESS')} — Новая запись лога для товара ID:${productData.product_id} успешно добавлена!`
    )
    res.status(201).json(result.rows)
  } catch (err) {
    console.log(`${makeMessageHead('ERROR')} — Ошибка добавления лога товара:\n\t${err.toString()}`)
    res.status(500).send(`Ошибка добавления лога товара:\n\t${err.toString()}`)
  }
})

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

  const queryParams = [parseInt(productData.price), productData.parse_date]
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
