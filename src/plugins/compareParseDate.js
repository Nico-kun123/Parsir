/**
 * Сравнивает указанную дату с текущей и возвращает количество дней между ними.
 *
 * @param {string} date - Дата, которую нужно сравнить с текущей датой.
 * @returns {number} Количество дней между указанной датой и текущей датой.
 */
export default function compareParseDate(date) {
  const current = Date.now()
  const parseDate = Date.parse(date)
  return Math.ceil(Math.abs(current - parseDate) / 86400000)
}
