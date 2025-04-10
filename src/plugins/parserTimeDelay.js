/**
 * Функция для эмуляции задержки между действиями бота в процессе парсинга.
 * Используется в качестве дополнительного механизма защиты бота от блокировки.
 *
 * Возвращает Promise, который разрешается через случайное время в диапазоне от
 * min до max миллисекунд (по умолчанию от 1000 до 2000 миллисекунд).
 *
 * @param {number} min - Минимальное время задержки (в миллисекундах).
 * @param {number} max - Максимальное время задержки (в миллисекундах).
 * @returns {Promise} Promise.
 */
const randomDelay = (min = 1000, max = 2000) =>
  new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)))

export default randomDelay
