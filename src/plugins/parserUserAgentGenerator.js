import UserAgent from 'user-agents'

/**
 * Возвращает случайную строку User-Agent для бота веб-скрапера.
 * Это используется в качестве дополнительного механизма защиты бота от блокировки.
 *
 * @returns {string} A random User-Agent string.
 */
const randomUserAgent = () =>
  new UserAgent({ deviceCategory: 'desktop', platform: 'Win32' }).toString()

export default randomUserAgent
