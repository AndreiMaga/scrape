import { Browser, Page } from 'puppeteer'

/**
 * Interface representing all the data needed to run a scraping job
 */
interface IJobProps {
  /**
   * The name of the job, will be used at the output
   */
  name: string

  /**
   * CSS selector, the job will wait until this is loaded
   */
  waitForSelector: string

  /**
   * CSS selector, the job will evaluate the selector and will pass all matches to eval_callback
   */
  evalSelector: string

  /**
   * Name of the function to call back to with all the matches from evalSelector
   */
  eval_callback: string
}

/**
 * Interface used for containing a javascript function
 */
interface ICallbackProps {
  /**
   * String representing javascript funtion with the signature (elements: Element[]) : string[]
   */
  function: string
}

/**
 * Interface representing all the data needed to run the scraper
 */
export interface IScraperProps {
  /**
   * The url to be scraped
   */
  url: string

  /**
   * Instance of a browser
   */
  browser?: Browser

  /**
   * Array of jobs to be run on the url
   */
  jobs: IJobProps[]

  /**
   * Array of callbacks to be registered
   */
  callbacks: ICallbackProps[]

  /**
   * Should the browser open a new page
   */
  newpage?: boolean
}

/**
 * Interface representing the result of a job
 */
export interface IResultProps {
  /**
   * Name of the job that was finished
   */
  name: string

  /**
   * Array of strings, each string representing a scraped value
   */
  result: string[]
}

/**
 * Just a simple scraper
 */
export class Scraper {
  /**
   * @see IScraperProps
   */
  props: IScraperProps

  /**
   *
   * @param props all the data needed for the scraper to run
   */
  constructor(props: IScraperProps) {
    this.props = props
    this.registerCallbacks()
  }

  /**
   * This will register all the callbacks in the global namespace.
   * This might be altered in the future so it will register to a different namespace or something different
   */
  private registerCallbacks() {
    this.props.callbacks.forEach((c) => {
      global.eval(c.function)
    })
  }

  /**
   * Scrape all the jobs inside props
   */
  async scrapeAllJobs(): Promise<IResultProps[] | null> {
    if (this.props.browser === undefined || this.props.newpage === undefined) {
      return null
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
          result: [
            'url:' + this.props.url,
            response?.statusText() ? response?.statusText() : ''
          ]
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

  /**
   * Scrape a job from a page
   * @param job the job that should be scraped
   * @param page the page
   */
  private async scrape(
    job: IJobProps,
    page: Page
  ): Promise<string[] | undefined> {
    await page.waitForSelector(job.waitForSelector)
    let result = await page.$$eval(
      job.evalSelector,
      <(elements: Element[]) => string[]>eval(job.eval_callback)
    )

    return result
  }
}
