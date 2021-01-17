import { Browser, Page } from 'puppeteer'

interface IJobProps {
  name: string
  waitForSelector: string
  evalSelector: string
  eval_callback: string
}

interface ICallbackProps {
  function: string
}

export interface IScraperProps {
  url: string
  browser?: Browser
  jobs: IJobProps[]
  callbacks: ICallbackProps[]
  newpage?: boolean
}

interface IResultProps {
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
    if (this.props.browser === undefined || this.props.newpage === undefined) {
      return
    }

    let page =
      this.props.newpage === true
        ? await this.props.browser.newPage()
        : (await this.props.browser.pages())[0]

    let result: IResultProps[] = []
    let response = await page.goto(this.props.url)

    if (response === undefined || response?.status() !== 200) {
      return [
        {
          name: 'error',
          result: ['url:' + this.props.url, response?.statusText()]
        }
      ]
    }

    await Promise.all(
      this.props.jobs.map(async (job) => {
        let res = await this.scrape(job, page)
        if (res === undefined) {
          return
        }
        result.push({ name: job.name, result: res })
      })
    )

    return result
  }

  private async scrape(
    job: IJobProps,
    page: Page
  ): Promise<string[] | undefined> {
    await page.waitForSelector(job.waitForSelector)
    let urls = await page.$$eval(
      job.evalSelector,
      <(links: Element[]) => string[]>eval(job.eval_callback)
    )

    return urls
  }
}
