import { launch, Browser } from 'puppeteer'

export async function startBrowser(): Promise<Browser | undefined> {
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
  return undefined
}
