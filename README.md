# Scrapers Can't Replace APEs

Scrape is a simple tool that will scrape any website (without login at the moment) just by using a [config](scrapingConfigs/books.toscrape.json) for that website.

## Usage
```bash
$ git clone https://github.com/AndreiMaga/scrape.git
$ cd scrape
$ yarn install
$ yarn start
```

This will run the configs inside [scrapingConfigs](scrapingConfigs/). If you want to add another one, just add a config file inside the directory with the schema below.  
***Be careful when you name your callbacks, don't use the same name twice***


## Config file
An short example can be found [here](scrapingConfigs/books.toscrape.json) or a more complex one [here](scrapingConfigs/youtube.json).

## Schema

The JSON schema can be found at [schema.json](schema.json)