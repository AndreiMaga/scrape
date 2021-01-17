import { launch, Browser } from 'puppeteer-core'
import { enumerateValues, HKEY, RegistryValueType } from 'registry-js'
import { pathExists } from 'fs-extra'
/**
 * Start a browser instance
 */
export async function startBrowser(exe_path: string): Promise<Browser> {
  try {
    let browser = await launch({
      headless: true,
      executablePath: exe_path,
      args: ['--disable-setuid-sandbox'],
      ignoreHTTPSErrors: true
    })

    return browser
  } catch (err) {
    console.error(err)
  }
  return Promise.reject()
}

export async function findBrowser(): Promise<string | null> {
  let firefox = await findFirefox()
  let chrome = await findChrome()

  if (chrome !== null) return chrome
  if (firefox !== null) return firefox

  return null
}

async function findFirefox(): Promise<string | null> {
  let firefox = enumerateValues(
    HKEY.HKEY_CLASSES_ROOT,
    'Applications\\firefox.exe\\shell\\open\\command'
  )
  if (firefox.length === 0) {
    return null
  }

  let first = firefox[0]

  if (
    first.type === RegistryValueType.REG_EXPAND_SZ ||
    first.type === RegistryValueType.REG_SZ
  ) {
    let path = first.data.split('"')[1]

    if (await pathExists(path)) {
      return path
    }
  }

  return null
}

async function findChrome(): Promise<string | null> {
  let chrome = enumerateValues(
    HKEY.HKEY_CLASSES_ROOT,
    'ChromeHTML\\shell\\open\\command'
  )
  if (chrome.length === 0) {
    return null
  }

  let first = chrome[0]

  if (
    first.type === RegistryValueType.REG_EXPAND_SZ ||
    first.type === RegistryValueType.REG_SZ
  ) {
    let path = first.data.split('"')[1]

    if (await pathExists(path)) {
      return path
    }
  }

  return null
}
