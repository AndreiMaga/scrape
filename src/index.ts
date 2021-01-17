import { IScraperProps, Scraper } from './scraper'
import { readdir, readFileSync } from 'fs'
import { startBrowser } from './browser'

const scrapingConfigsDirectory = 'scrapingConfigs'

startBrowser().then((browser) => {
  readdir(scrapingConfigsDirectory, async (err, files) => {
    await Promise.all(
      files.map(async (files, index) => {
        let str = readFileSync(scrapingConfigsDirectory + '/' + files, 'utf-8')

        let props: IScraperProps = JSON.parse(str)
        props.browser = browser
        props.newpage = index != 0
        let res = await new Scraper(props).scrapeAllJobs()

        if (res === undefined) {
          return
        }

        res.forEach((e) => {
          console.log(JSON.stringify(e))
        })
      })
    )
    browser.close()
  })
})
