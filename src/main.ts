import express from 'express'
import { getScreenInfo } from './modus'  
import { ModusConfig } from './config'  
import * as fs from 'fs/promises'

type WebAssets = any

async function getWebAssets(): Promise<WebAssets> {
  const manifest = JSON.parse(await fs.readFile('./static/dist/.vite/manifest.json', 'utf-8'))['index.html']
  let assets: WebAssets = {
    js: [],
    css: []
  }

  if (manifest.file) {
    assets.js.push(manifest.file)
  }

  if (manifest.css) {
    assets.css.push(...manifest.css)
  }

  return assets
}

const app = express()
const port = 3000

app.set('views', './views')
app.set('view engine', 'ejs')

app.use('/', express.static('./static/dist'))

app.get('/test', async (req, res) => {
  const data = await getScreenInfo('688b375101b5040357de1cd2')
  res.send(data)
})

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
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
