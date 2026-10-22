// Times a big stack of triggers in the live client: Mesmeric Orb on a board of
// 60 tapped permanents, from Alice's untap step until the last trigger has
// resolved, with "Resolve stack" clicked once. The reference for condensing
// stack triggers (BACKLOG, Client / UI). Needs dev-rooms (or a --builder
// server) on :4000 and Vite on :5173.
//
//   node client/scripts/orb-timing.mjs [--permanents 60] [--headed]
import { chromium } from 'playwright'

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : fallback
}
const permanents = Number(arg('permanents', '60'))
const url = arg('url', 'http://localhost:5173/')

const cards = []
let k = 1
const add = (name, owner, zone, extra = {}) => cards.push({ key: `t${k++}`, name, owner, zone, ...extra })
add('Mesmeric Orb', 'alice', 'battlefield')
const lands = Math.round(permanents * (2 / 3))
for (let i = 0; i < lands; i += 1) add(['Island', 'Forest', 'Plains', 'Swamp', 'Mountain'][i % 5], 'alice', 'battlefield', { tapped: true })
for (let i = lands; i < permanents; i += 1) add('Grizzly Bears', 'alice', 'battlefield', { tapped: true })
add('Forest', 'bob', 'battlefield')
const spec = {
  seats: [
    { player: 'alice', life: 40, bot: false },
    { player: 'bob', life: 40, bot: true },
  ],
  cards,
  active: 'bob',
  step: 'end',
  libraryFill: permanents + 40,
}

const browser = await chromium.launch({ headless: !process.argv.includes('--headed') })
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
await page.goto(url)
await page.getByRole('button', { name: 'Scenario builder' }).click()
await page.locator('.builder-panel').waitFor()
await page.getByRole('button', { name: 'Import…' }).click()
await page.locator('.builder-panel textarea').fill(JSON.stringify(spec))
await page.getByRole('button', { name: 'Load it' }).click()
await page.waitForFunction(() => document.querySelectorAll('[data-obj-id]').length >= 2)
await page.getByRole('button', { name: /Start play/ }).click()

const t0 = Date.now()
// The untap step's triggers arrive on the stack.
await page.waitForFunction(() => document.querySelector('.stack-entry') !== null, null, { timeout: 120_000 })
const tStack = Date.now()
const entries = await page.locator('.stack-entry').count()
const label = await page.locator('.stack-entry-label').first().textContent()
// Resolve them all in one go.
await page.getByRole('button', { name: /Resolve stack/ }).click()
const tResolve = Date.now()
await page.waitForFunction(() => document.querySelector('.stack-entry') === null, null, { timeout: 600_000 })
const tDone = Date.now()

console.log(
  JSON.stringify({
    permanents,
    stackEntriesShown: entries,
    topLabel: label,
    untapToStackMs: tStack - t0,
    resolveAllMs: tDone - tResolve,
    perTriggerMs: Math.round((tDone - tResolve) / permanents),
  }),
)
await browser.close()
