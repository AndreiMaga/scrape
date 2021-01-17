import { Scraper, IScraperProps } from './scraper'
import { startBrowser } from './browser'
import { log } from './logger'

export async function scrapeAll(props: IScraperProps) {
  log.debug('Waiting for a browser!')

  log.debug('Starting the scraper tool!')
  return await new Scraper(props).scrapeAllJobs()
}
