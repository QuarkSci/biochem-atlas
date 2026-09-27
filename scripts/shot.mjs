#!/usr/bin/env node
/**
 * Headless screenshot helper for development and docs.
 *
 *   node scripts/shot.mjs out.png [--w 1280 --h 800] [--setup "JS run in page"] [--wait 1500]
 *
 * Unlike neuro-atlas's version, this app has no global store to wait on —
 * 3Dmol renders on its own WebGL canvas as soon as the PDB fetch resolves,
 * so we just wait a fixed --wait after networkidle.
 */
import puppeteer from 'puppeteer-core'

const args = process.argv.slice(2)
const out = args[0] ?? 'shot.png'
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : def
}
const width = +opt('w', 1280),
  height = +opt('h', 800)
const setup = opt('setup', '')
const wait = +opt('wait', 3000)
const url = opt('url', 'http://localhost:3021/')

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--hide-scrollbars'],
})
try {
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  page.on('pageerror', (e) => console.error('[page error]', e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') console.error('[console]', m.text())
  })
  await page.goto(url, { waitUntil: 'networkidle0' })
  if (setup) await page.evaluate(setup)
  await new Promise((r) => setTimeout(r, wait))
  await page.screenshot({ path: out })
  console.log('saved', out)
} finally {
  await browser.close()
}
