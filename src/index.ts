import { IResultProps, IScraperProps, Scraper } from './scraper'
import { readdir, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { findBrowser, startBrowser } from './browser'

const scrapingConfigsDirectory = 'scrapingConfigs'
const outputDirectory = 'results'

const fileName = new Date().getTime().toString()

if (!existsSync(outputDirectory)) {
  mkdirSync(outputDirectory)
}

findBrowser().then((browserPath) => {
  if (browserPath === null) return

  startBrowser(browserPath).then((browser) => {
    readdir(scrapingConfigsDirectory, async (err, files) => {
      let result: IResultProps[] = []
      await Promise.all(
        files.map(async (files, index) => {
          let str = readFileSync(
            scrapingConfigsDirectory + '/' + files,
            'utf-8'
          )

          let props: IScraperProps = JSON.parse(str)
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
        outputDirectory + '/' + fileName + '.json',
        JSON.stringify(result, undefined, 2)
      )

      browser.close()
    })
  })
})
