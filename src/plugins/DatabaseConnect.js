import pg from 'pg'

// Плагин
import makeMessageHead from './makeMessageHead.js'

const DATA = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '123',
  database: 'Parsir_DB'
}
const db = new pg.Pool({
  connectionString: `postgres://${DATA.user}:${DATA.password}@${DATA.host}:${DATA.port}/${DATA.database}`
})

db.connect((err) => {
  if (err) {
    console.log(`${makeMessageHead('ERROR')} — Ошибка подключения к базе данных: ${err.toString()}`)
  } else {
    console.log(`${makeMessageHead('SUCCESS')} — База данных '${DATA.database}' подключена!`)
  }
})

export default db

//! Сохранение резервной копии БД:
// pg_dump -U postgres -d Parsir_DB > parsir_db_backup.sql
//! Восстановление резервной копии БД:
// psql -U postgres -d Parsir_DB -f parsir_db_backup.sql

//! Или можно делать экспорт/импорт через Docker:
// docker volume ls

//! Экспорт:
// docker run --rm -v <volume_name>:/volume -v $(pwd):/backup alpine tar -czf /backup/postgres_volume.tar.gz -C /volume ./
//! Импорт:
// docker run --rm -v <volume_name>:/volume -v $(pwd):/backup alpine tar -xzf /backup/postgres_volume.tar.gz -C /volume
