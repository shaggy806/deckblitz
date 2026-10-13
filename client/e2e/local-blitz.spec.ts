import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

// A blitz played locally (`?local=1`, `docs/plans/local-rooms.md`): the
// rooms run in a Web Worker in the page (`src/local/room-worker.ts`), so the
// game — against three bots, as a blitz always is — never touches the room
// server. Only the deck import goes to the server, and it's stubbed here, as in
// `blitz.spec.ts`.

const LIST = ['Commander', '1 Ghalta, Primal Hunger', '', 'Deck', '1 Grizzly Bears', '30 Forest'].join('\n')

async function stubImport(page: Page): Promise<void> {
  const card = (name: string, count = 1) => ({
    name,
    count,
    implemented: true,
    found: true,
    manaCost: null,
    typeLine: '',
    suggestedReplacement: null,
    replacements: [],
    printingId: null,
  })
  const lines = [
    { type: 'progress', done: 3, total: 3, name: 'Forest' },
    {
      type: 'result',
      cards: [card('Ghalta, Primal Hunger'), card('Grizzly Bears'), card('Forest', 30)],
      format: { legal: false, violations: [], identity: 'G', commanders: ['Ghalta, Primal Hunger'] },
    },
  ]
  await page.route('**/import-deck', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/x-ndjson',
      body: lines.map((l) => JSON.stringify(l)).join('\n') + '\n',
      headers: { 'Access-Control-Allow-Origin': '*' },
    }),
  )
}

test('a local blitz plays against three bots in the page, with no socket to the room server', async ({ page, context }) => {
  test.setTimeout(120_000)
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await stubImport(page)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  // Every socket the page opens, but Vite's own (its hot reload).
  const sockets: string[] = []
  page.on('websocket', (ws) => {
    if (!ws.url().includes('vite') && !/\/\?token=/.test(ws.url())) sockets.push(ws.url())
  })

  await page.goto('/?local=1')
  await page.evaluate((text) => navigator.clipboard.writeText(text), LIST)
  await page.getByRole('button', { name: 'Have a deck copied? Click here to blitz!' }).click()

  // Into the game, four at the table, the room's code in the URL as ever.
  await expect(page.getByRole('button', { name: 'History' })).toBeVisible({ timeout: 60_000 })
  expect(await page.evaluate(() => new URL(window.location.href).searchParams.get('room'))).toMatch(/^[A-Z0-9]{5}$/)
  await expect(page.locator('[data-player-id]')).toHaveCount(4, { timeout: 20_000 })

  // The bots play. Alice keeps her hand if asked and never plays a card, so
  // whatever reaches the battlefield is a bot's: pass her turns (Auto-pass
  // stops at her own, so Pass Turn there) until something does.
  const keep = page.getByRole('button', { name: /^Keep/ })
  if (await keep.isVisible({ timeout: 5_000 }).catch(() => false)) await keep.click()
  await page.getByRole('button', { name: 'Auto-pass' }).click()
  await expect
    .poll(
      async () => {
        const passTurn = page.getByRole('button', { name: 'Pass Turn' })
        if (await passTurn.isEnabled().catch(() => false)) await passTurn.click().catch(() => {})
        return page.locator('.board-entry').count()
      },
      { timeout: 60_000, intervals: [1_000] },
    )
    .toBeGreaterThan(0)

  // It was all in this tab: the page opened no socket to the room server.
  expect(sockets).toEqual([])
  expect(errors).toEqual([])
})

test('local mode stays on for the tab, and ?local=0 turns it off', async ({ page }) => {
  await page.goto('/?local=1')
  expect(await page.evaluate(() => sessionStorage.getItem('mtg.local'))).toBe('1')
  await page.goto('/')
  expect(await page.evaluate(() => sessionStorage.getItem('mtg.local'))).toBe('1')
  await page.goto('/?local=0')
  expect(await page.evaluate(() => sessionStorage.getItem('mtg.local'))).toBeNull()
})
