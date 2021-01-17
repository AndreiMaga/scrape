import { launch, Browser } from 'puppeteer'

/**
 * Start a browser instance
 */
export async function startBrowser(): Promise<Browser> {
  let browser: Browser
  try {
    browser = await launch({
      headless: true,
      args: ['--disable-setuid-sandbox'],
      ignoreHTTPSErrors: true
    })

    return browser
  } catch (err) {
    console.error(err)
  }
  return Promise.reject()
}
