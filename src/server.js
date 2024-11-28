// Библиотеки
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Модули и плагины
import database from './plugins/DatabaseConnect.js'
import makeMessageHead from './plugins/makeMessageHead.js'

const app = express()

// Конфигурация сервера
app.use(express.json())
app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Порт
const PORT = import.meta.env?.SERVER_PORT || 3000

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
 * Срок действия токена 2 часа.
 *
 * @returns Токен авторизации.
 */
function generateToken(user) {
  // TODO: Изменить срок годности токена на 30 минут.
  return jwt.sign({ email: user.email }, 'secretKey', {
    expiresIn: '2h'
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
    const result = await database.query('SELECT isadmin FROM Users WHERE email = $1', [email])
    res.status(201).send(result.rows[0].isadmin)
  } catch (err) {
    res.status(500).send(`Ошибка получения роли пользователя:\n\t${err.toString()}`)
  }
})

// Получить список всех пользователей
app.get('/api/get-all-users', async (req, res) => {
  try {
    const result = await database.query('SELECT * FROM Users')
    res.status(201).json(result.rows)
  } catch (err) {
    res.status(500).send(`Ошибка получения списка пользователей:\n\t${err.toString()}`)
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

// ~~~~~~~~~~~~~~~~~~~~~~~~~~
//* ✨ ЗАПУСК СЕРВЕРА ✨
// ~~~~~~~~~~~~~~~~~~~~~~~~~~

app.listen(PORT, () => {
  console.log(`${makeMessageHead()} — Сервер запущен на порту ${PORT}!`)
})
