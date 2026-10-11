import { chromium } from 'playwright'
const out = process.argv[2]
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } })
const deck = {
  id: 'ban-test', name: 'Banned test',
  commanders: ["Atraxa, Praetors' Voice"],
  cards: ['Ancestral Recall', 'Black Lotus', 'Counterspell', ...Array(96).fill('Forest')],
}
await ctx.addInitScript((d) => {
  localStorage.setItem('mtg-engine:decks', JSON.stringify([d]))
  localStorage.setItem('mtg-engine:active-deck', JSON.stringify({ kind: 'saved', id: d.id }))
}, deck)
const page = await ctx.newPage()
page.on('console', (m) => { if (m.type() === 'error') console.log('console error:', m.text()) })
await page.goto('http://localhost:5173/deck-builder')
await page.locator('.db-legality').first().waitFor({ timeout: 60000 })
console.log('builder:', (await page.locator('.db-legality').first().innerText()).replace(/\n/g, ' | '))
for (const s of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }, { width: 2560, height: 1440 }]) {
  await page.setViewportSize(s); await page.waitForTimeout(400)
  await page.screenshot({ path: `${out}/builder-${s.width}.png` })
}
const lib = await ctx.newPage()
await lib.setViewportSize({ width: 1366, height: 768 })
await lib.goto('http://localhost:5173/library')
await lib.locator('.lib-grid').waitFor({ timeout: 60000 })
await lib.locator('.lib-search').fill('Black Lotus')
await lib.waitForTimeout(800)
console.log('badges:', await lib.locator('.lib-banned-badge').count())
await lib.screenshot({ path: `${out}/library-grid.png` })
await lib.locator('.lib-card-open').first().click()
await lib.locator('.lib-banned-note').waitFor()
console.log('note:', await lib.locator('.lib-banned-note').innerText())
await lib.screenshot({ path: `${out}/library-detail.png` })
await browser.close()
