const puppeteer = require('puppeteer')

const TIMEOUT = 10 * 60 * 1000
const DOWNLOAD_PATH = process.env.DOWNLOAD_PATH || '/tmp'

async function saveFigmaDocument() {

  let page, fileName

  try {
    page = await browser.newPage()
    page.setDefaultTimeout(TIMEOUT)
    await page.setViewport({ width: 1024, height: 768, deviceScaleFactor: 1 })

    await page.goto(url, {
      waitUntil: 'networkidle2'
    })

    try {
      await page.waitForSelector('.view.gpu-view-content', { timeout: 10000 })
    } catch (_) {}


    // await page.screenshot({ path: '/tmp/screenshot.png' })
    await page._client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: DOWNLOAD_PATH
    });

    page
    .on('console', message =>
      console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
    .on('pageerror', ({ message }) => console.log(message))
    .on('response', response =>
      console.log(`${response.status()} ${response.url()}`))
    .on('requestfailed', request =>
      console.log(`${request.failure().errorText} ${request.url()}`))
      
    await page._client.on('Page.downloadWillBegin', ({ url, suggestedFilename }) => {
      console.log('download beginning,', url, suggestedFilename);
      fileName = suggestedFilename;
    });
  
    await page._client.on('Page.downloadProgress', ({ state }) => {
      if (state === 'completed') {
        console.log('download completed:', DOWNLOAD_PATH + '/' + fileName);
        page.close()
      }
    });

    console.log('Before evaluate')
    await page.evaluate(() => {
      console.log('triggerAction')
      return ImageBindingsObj.imageManager.loadAllImages()
        .then(() => {
          console.log('Loaded all images, saving file...')
          return FigmaAppObj.triggerAction('save-as')
        })
        .catch(err => console.error(err))
    })

    await page.waitForSelector('.non-existing', { timeout: TIMEOUT })
    console.log('After timeout')
    
  } catch (err) {
    console.error(err)
    if (page && page.close) {
      page.close()
    }  
  }
}

process.on('uncaughtException', err => console.error('uncaughtException:', err.stack))

const url = process.argv[2]
console.log('Url:', url)
if (!url) throw new Error('Please provide a Figma URL')

let browser
puppeteer.launch({
  headless: true,
  executablePath: process.env.NODE_ENV === 'production'
    ? '/usr/bin/google-chrome'
    : undefined,
  args: [
    '--no-pings',
    '--no-wifi',
    '--dbus-stub',
    '--no-default-browser-check',
    '--no-xshm',

    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--no-first-run',
    '--no-sandbox',
    '--no-zygote',
    '--hide-scrollbars'
  ]
})
  .then(res => {
    console.log('Puppeteer launched')
    browser = res
    return saveFigmaDocument()
  })
  .then(() => console.log('Done'))
  .catch(console.error)
  .then(() => process.exit())
