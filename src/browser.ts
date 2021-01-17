import { launch, Browser } from 'puppeteer-core'
import {
  enumerateValues,
  HKEY,
  RegistryValue,
  RegistryValueType
} from 'registry-js'
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

/**
 * Will attempt to find firefox or chrome
 */
export async function findBrowser(): Promise<string | null> {
  let firefox = await findFirefox()
  let chrome = await findChrome()

  if (chrome !== null) return chrome
  if (firefox !== null) return firefox

  return null
}

/**
 * Will attempt to find firefox by using windows registries
 */
async function findFirefox(): Promise<string | null> {
  let firefox = enumerateValues(
    HKEY.HKEY_CLASSES_ROOT,
    'Applications\\firefox.exe\\shell\\open\\command'
  )

  return await findByRegistry(firefox)
}

/**
 * Will attempt to find chrome by using windows registries
 */
async function findChrome(): Promise<string | null> {
  let chrome = enumerateValues(
    HKEY.HKEY_CLASSES_ROOT,
    'ChromeHTML\\shell\\open\\command'
  )

  return await findByRegistry(chrome)
}

/**
 * Will attempt to find a path from a registry
 */
async function findByRegistry(
  reg: readonly RegistryValue[]
): Promise<string | null> {
  if (reg.length === 0) {
    return null
  }

  let first = reg[0]

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
