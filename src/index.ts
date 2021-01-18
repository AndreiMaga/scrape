import { IResultProps, IScraperProps, Scraper } from './scraper'
import {
  appendFileSync,
  readdir,
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync
} from 'fs'
import { findBrowser, startBrowser } from './browser'
import { join } from 'path'

const scrapingConfigsDirectory = 'scrapingConfigs'
const outputDirectory = 'results'
const configFile = 'config.json'
const registry = 'registry.txt'

interface IConfig {
  /**
   * Time to wait between each pass, in minutes
   */
  timer?: number

  /**
   * The urls to be ignored with each pass
   */
  ignoredurls?: string[]
}

if (!existsSync(outputDirectory)) {
  mkdirSync(outputDirectory)
}

let config: IConfig = { ignoredurls: [] }

if (existsSync(configFile)) {
  config = JSON.parse(readFileSync(configFile, 'utf-8'))
}

if (config.timer) {
  main()
  setInterval(main, config.timer * 60000)
} else {
  main()
}

function main() {
  let fileName = new Date().getTime().toString()

  findBrowser().then((browserPath) => {
    if (browserPath === null) {
      console.error(
        'Could not locate Chrome or Firefox, please install one of them.'
      )
      return
    }

    startBrowser(browserPath).then((browser) => {
      readdir(scrapingConfigsDirectory, async (err, files) => {
        if (err !== null) {
          console.error(
            'Something happened, could not read',
            scrapingConfigsDirectory
          )
          browser.close()
          return
        }

        let result: IResultProps[] = []
        await Promise.all(
          files.map(async (files, index) => {
            let props: IScraperProps = JSON.parse(
              readFileSync(join(scrapingConfigsDirectory, files), 'utf-8')
            )
            if (config.ignoredurls && config.ignoredurls.includes(props.url))
              return

            props.browser = browser
            props.newpage = index != 0
            let res: IResultProps[] | null = await new Scraper(
              props
            ).scrapeAllJobs()

            if (res === undefined || res === null) {
              return
            }

            res.forEach((e) => {
              console.log(e)
              result.push(e)
            })
          })
        )
        writeFileSync(
          join(outputDirectory, fileName + '.json'),
          JSON.stringify(result, undefined, 2)
        )

        appendFileSync(join(outputDirectory, registry), fileName + '.json\n')

        browser.close()
      })
    })
  })
}
