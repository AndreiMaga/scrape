import { Browser, Page } from 'puppeteer'
import { log } from './logger'

export interface IJobProps {
  name: string
  waitForSelector: string
  evalSelector: string
  eval_callback: string
}

export interface ICallbackProps {
  name: string
  function: string
}

export interface IScraperProps {
  url: string
  browser?: Browser
  jobs: IJobProps[]
  callbacks: ICallbackProps[]
  newpage?: boolean
}

export interface IResultProps {
  name: string
  result: string[]
}

export class Scraper {
  props: IScraperProps
  constructor(props: IScraperProps) {
    this.props = props
    this.registerCallbacks()
  }

  private registerCallbacks() {
    this.props.callbacks.forEach((c) => {
      global.eval(c.function)
    })
  }

  async scrapeAllJobs() {
    if (this.props.browser === undefined) {
      return
    }

    let page: Page

    if (this.props.newpage === undefined) {
      // this will never happen
      return
    }

    page =
      this.props.newpage === true
        ? await this.props.browser.newPage()
        : (await this.props.browser.pages())[0]

    log.debug('Waiting to navigate to', this.props.url)
    await page.goto(this.props.url)

    let result: IResultProps[] = []
    log.debug('Starting the jobs!')

    await Promise.all(
      this.props.jobs.map(async (job) => {
        log.debug('Started job', job.name)
        let res = await this.scrape(job, page)
        if (res === undefined) {
          return
        }
        log.debug('Recieved the result for', job.name)
        result.push({ name: job.name, result: res })
      })
    )

    return result
  }

  private async scrape(
    job: IJobProps,
    page: Page
  ): Promise<string[] | undefined> {
    log.debug('Waiting for', job.name)
    await page.waitForSelector(job.waitForSelector)
    log.debug('Finished waiting for', job.name)
    let urls = await page.$$eval(
      job.evalSelector,
      <(links: Element[]) => string[]>eval(job.eval_callback)
    )

    log.debug('Got the result for', job.name)

    return urls
  }
}
