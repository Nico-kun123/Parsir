import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

// Плагины
import randomUserAgent from './parserUserAgentGenerator.js'

// Используем stealth-плагин для обхода антибот-защиты
puppeteer.use(StealthPlugin())

/**
 * Запускает puppeteer со следующими параметрами:
 *
 * - headless: false: позволяет нам наблюдать за тем, что происходит.
 * - defaultViewport: null: устанавливает размер окна браузера по умолчанию.
 * - userDataDir: путь к папке с данными браузера.
 * - args: параметры запуска браузера.
 *
 * @async
 * @returns {Promise<Browser>} объект браузера
 */
const startPuppeteer = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    // headless: true,
    defaultViewport: null,
    ignoreHTTPSErrors: true,
    userDataDir: '%userprofile%\\AppData\\Local\\Google\\Chrome\\User Data\\AllowCookies',
    args: [
      '--disable-web-security', // отключает проверку безопасности браузера
      '--fast-start', // ускоряет запуск браузера
      '--disable-extensions', // отключает расширения браузера
      '--no-sandbox', // отключает сэндбокс
      '--disable-setuid-sandbox', //
      '--user-agent=' + randomUserAgent() // устанавливает пользовательский агент браузера
    ]
  })

  return browser
}

export default startPuppeteer
