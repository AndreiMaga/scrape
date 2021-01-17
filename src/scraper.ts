import { Browser, Page } from 'puppeteer'
import { log } from './logger'
import { Bar, Presets } from 'cli-progress'
import { Color } from 'colors'
export interface IJobProps {
  name: string
  waitForSelector: string
  evalSelector: string
  eval_callback: (links: Element[]) => string[]
}

export interface IScraperProps {
  url: string
  browser?: Browser
  jobs: IJobProps[]
}

export interface IResultProps {
  name: string
  result: string[]
}

export class Scraper {
  props: IScraperProps
  bar: Bar
  constructor(props: IScraperProps) {
    this.props = props
    this.bar = new Bar({
      format:
        'Progress |' + '{bar}'.cyan + '| {percentage}% || {value}/{total} Jobs',
      fps: 120,
      barCompleteChar: '█',
      barIncompleteChar: ' '
    })
  }

  async scrapeAllJobs() {
    this.bar.start(this.props.jobs.length, 0, { speed: 'N/A' })

    let pages = await this.props.browser?.pages()

    if (pages === undefined) {
      return
    }
    let page = pages[0]
    log.debug('Waiting to navigate to', this.props.url)
    await page?.goto(this.props.url)

    let result: IResultProps[] = []
    log.debug('Starting the jobs!')

    await Promise.all(
      this.props.jobs.map(async (job) => {
        log.debug('Started job', job.name)
        let res = await this.scrape(job, page)
        this.bar.increment()
        if (res === undefined) {
          return
        }
        log.debug('Recieved the result for', job.name)
        result.push({ name: job.name, result: res })
      })
    )

    this.bar.stop()
    return result
  }

  private async scrape(
    job: IJobProps,
    page: Page
  ): Promise<string[] | undefined> {
    log.debug('Waiting for', job.name)
    await page.waitForSelector(job.waitForSelector)
    log.debug('Finished waiting for', job.name)
    let urls = await page.$$eval(job.evalSelector, job.eval_callback)

    log.debug('Got the result for', job.name)

    return urls
  }
}
