import { scrapeAll } from './controller'
import { IJobProps, IScraperProps } from './scraper'

function callback(links: Element[]): string[] {
  return links
    .filter(
      (link) =>
        link?.querySelector('.instock.availability > i')?.textContent !==
        'In stock'
    )
    .map((el) => (<HTMLBaseElement>el?.querySelector('h3 > a'))?.href)
}

let job: IJobProps = {
  name: 'books',
  waitForSelector: '.page_inner',
  evalSelector: 'section ol > li',
  eval_callback: callback
}

let props: IScraperProps = {
  url: 'https://books.toscrape.com',
  jobs: [job]
}

scrapeAll(props).then((res) => {
  if (res === undefined) {
    return
  }
  console.log(res)
})
