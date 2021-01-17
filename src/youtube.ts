import { scrapeAll } from './controller'
import { log } from './logger'
import { IJobProps, IScraperProps } from './scraper'

function innerHtmlCallback(links: Element[]): string[] {
  return links.map((e) => e.innerHTML)
}

function ariaLabelCallback(links: Element[]): string[] {
  return links.map((e) => {
    let res = e.attributes.getNamedItem('aria-label')?.value
    return res !== undefined ? res : ''
  })
}

let title: IJobProps = {
  name: 'title',
  waitForSelector:
    'yt-formatted-string.ytd-video-primary-info-renderer:nth-child(1)',
  evalSelector:
    'yt-formatted-string.ytd-video-primary-info-renderer:nth-child(1)',
  eval_callback: innerHtmlCallback
}

let likes: IJobProps = {
  name: 'likes',
  waitForSelector:
    'ytd-toggle-button-renderer.ytd-menu-renderer:nth-child(1) > a:nth-child(1) > yt-formatted-string:nth-child(2)',
  evalSelector:
    'ytd-toggle-button-renderer.ytd-menu-renderer:nth-child(1) > a:nth-child(1) > yt-formatted-string:nth-child(2)',
  eval_callback: ariaLabelCallback
}

let views: IJobProps = {
  name: 'views',
  waitForSelector: '.view-count',
  evalSelector: '.view-count',
  eval_callback: innerHtmlCallback
}

let recomandations: IJobProps = {
  name: 'recomandation',
  waitForSelector: 'ytd-compact-video-renderer span',
  evalSelector:
    'ytd-compact-video-renderer.style-scope > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > a:nth-child(1) > h3:nth-child(1) > span:nth-child(2)',
  eval_callback: ariaLabelCallback
}

let props: IScraperProps = {
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  jobs: [title, likes, views, recomandations]
}

scrapeAll(props).then((res) => {
  if (res === undefined) {
    return
  }

  res.forEach((e) => {
    log.info(e)
  })
  props.browser?.close()
})
