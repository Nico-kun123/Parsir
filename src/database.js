import pg from 'pg'

// Плагин
import makeMessageHead from './plugins/makeMessageHead.js'

// Загружаем переменные окружения
import 'dotenv/config'

// Проверяем, что все необходимые переменные окружения установлены
const requiredEnvVars = [
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB'
]
const missingEnvVars = requiredEnvVars.filter((env) => !process.env[env])
if (missingEnvVars.length) {
  console.log(
    `${makeMessageHead('ERROR')} — Нельзя подключиться к базе данных. Отсутствуют следующие переменные окружения: ${missingEnvVars.join(', ')}!`
  )

  throw new Error(`Missing required env vars: ${missingEnvVars.join(', ')}`)
}

const DATA = {
  host: process.env?.POSTGRES_HOST,
  port: process.env?.POSTGRES_PORT,
  user: process.env?.POSTGRES_USER,
  password: process.env?.POSTGRES_PASSWORD,
  database: process.env?.POSTGRES_DB
}
const db = new pg.Pool({
  connectionString: `postgres://${DATA.user}:${DATA.password}@${DATA.host}:${DATA.port}/${DATA.database}`,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
})

db.query('SELECT NOW()', (err) => {
  if (err) {
    console.log(`${makeMessageHead('ERROR')} — Ошибка подключения к базе данных: ${err.toString()}`)
  } else {
    console.log(`${makeMessageHead('SUCCESS')} — База данных '${DATA.database}' подключена!`)
  }
})

// Обработка ошибок подключения к базе данных
db.on('error', (err) => {
  console.log(`${makeMessageHead('ERROR')} — Ошибка подключения к базе данных: ${err.toString()}`)
})

// Закрытие соединения с базой данных при завершении работы приложения
process.on('SIGINT', () => {
  console.log(
    `${makeMessageHead('INFO')} — Закрываем соединение с базой данных '${DATA.database}'...`
  )

  try {
    db.end()
    console.log(
      `${makeMessageHead('SUCCESS')} — Соединение с базой данных '${DATA.database}' закрыто!`
    )
  } catch (err) {
    console.log(
      `${makeMessageHead('ERROR')} — Ошибка закрытия соединения с базой данных '${DATA.database}': ${err.toString()}`
    )
  }
})

export default db

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//! Сохранение резервной копии БД:
// pg_dump -U postgres -d (db name) > *.sql
//! Восстановление резервной копии БД:
// psql -U postgres -d P(db name) -f *.sql

//! Или можно делать экспорт/импорт через Docker:
// docker volume ls

//! Экспорт:
// docker run --rm -v <volume_name>:/volume -v $(pwd):/backup alpine tar -czf /backup/postgres_volume.tar.gz -C /volume ./
//! Импорт:
// docker run --rm -v <volume_name>:/volume -v $(pwd):/backup alpine tar -xzf /backup/postgres_volume.tar.gz -C /volume
