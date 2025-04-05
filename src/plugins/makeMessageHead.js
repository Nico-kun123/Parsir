/**
 * Возвращает строку, содержащую текущие дату и время, для сообщений в терминале.
 *
 * Формат строки: "ДД.ММ.ГГГГ | ЧЧ:ММ:СС"
 *
 * @param {('INFO' | 'ERROR' | 'SUCCESS' | 'WARNING')} messageType - Тип сообщения. По умолчанию "INFO".
 * @returns {string} Строка с текущей датой и временем.
 */
export default function makeMessageHead(messageType) {
  const currentDate = new Date()
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h24',
    hour12: false
  })
  const dateString = formatter.format(currentDate).replace(',', ' |')

  // Типы сообщений
  const MESSAGE_TYPES = {
    ERROR: '❌ ERROR',
    SUCCESS: '✅ SUCCESS',
    WARNING: '🟨 WARNING',
    INFO: '📄 INFO'
  }

  // Если тип сообщения не существует, установить значение по умолчанию
  if (!Object.keys(MESSAGE_TYPES).includes(messageType)) {
    messageType = 'INFO'
  }

  return `[${MESSAGE_TYPES[messageType]} - ${dateString}]`
}
