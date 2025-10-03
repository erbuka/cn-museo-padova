import express from 'express'
import { getScreenInfo } from './modus'  
import { ModusConfig } from './config'  
import * as fs from 'fs/promises'
import path from 'path'

type WebAssets = {
  js: string[],
  css: string[],
  headerLogo?: string
}

async function getWebAssets(): Promise<WebAssets> {
  const manifest = JSON.parse(await fs.readFile('./static/dist/.vite/manifest.json', 'utf-8'))['index.html']
  let assets: WebAssets = {
    js: [],
    css: [],
    headerLogo: ModusConfig.headerLogo
  }

  if (manifest.file) {
    assets.js.push(path.posix.join("dist", manifest.file))
  }

  if (manifest.css && Array.isArray(manifest.css)) {
    assets.css.push(...manifest.css.map((cssFile: string) => path.posix.join("dist", cssFile)))
  }

  return assets
}

const app = express()
const port = 3000

app.set('views', './views')
app.set('view engine', 'ejs')

app.use('/', express.static('./static'))

app.get('/screen/:index', async (req, res) => {
  const idx = parseInt(req.params.index)
  const screen = ModusConfig.screenIds[idx]

  if (!screen) {
    res.status(404).send('Screen not found')
    return
  }
  
  const webAssets = await getWebAssets() 
  const screenInfo = await getScreenInfo(screen)
  
  res.render('screen', {
    webAssets,
    screenInfo
  })

})

app.listen(port, () => console.log(`Listening on port ${port}`))
