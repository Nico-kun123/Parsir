/**
 * Возвращает строку, содержащую текущие дату и время, для сообщений в терминале.
 *
 * Формат строки: "ММ.ДД.ГГГГ | ЧЧ:ММ:СС"
 *
 * @returns Строка с текущей датой и временем.
 */
export default function makeMessageHead(messageType = 'INFO') {
  const currentDate = new Date()
  const dateString =
    currentDate.getDate() +
    '.' +
    (currentDate.getMonth() + 1) +
    '.' +
    currentDate.getFullYear() +
    ' | ' +
    currentDate.toLocaleTimeString()

  if (messageType == 'ERROR') {
    return `[❌ ERROR - ${dateString}]`
  } else if (messageType == 'SUCCESS') {
    return `[✅ SUCCESS - ${dateString}]`
  } else if (messageType == 'WARNING') {
    return `[🟨 WARNING - ${dateString}]`
  } else {
    return `[📄 INFO - ${dateString}]`
  }
}
