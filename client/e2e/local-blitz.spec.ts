import { expect, test } from '@playwright/test'
import type { Page, WebSocket } from '@playwright/test'

// Solo games played locally (`?local=1`, `docs/plans/local-rooms.md`): a
// blitz's and a lesson's rooms run in a Web Worker in the page
// (`src/local/room-worker.ts`), so their games never touch the room server,
// while a lobby — which another person may join — still opens there. Only the
// deck import goes to the server for a blitz, and it's stubbed here, as in
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

/** Every message the page sends the room server (not Vite's own socket). */
function serverTraffic(page: Page): string[] {
  const sent: string[] = []
  page.on('websocket', (ws: WebSocket) => {
    if (ws.url().includes('?token=')) return // Vite's hot reload
    ws.on('framesent', (frame) => sent.push(String(frame.payload)))
  })
  return sent
}

const typesOf = (sent: readonly string[]): string[] =>
  sent.map((s) => (JSON.parse(s) as { type: string }).type).filter((t) => t !== 'event-deltas')

test('a local blitz plays against three bots in the page, never on the room server', async ({ page, context }) => {
  test.setTimeout(120_000)
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await stubImport(page)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const sent = serverTraffic(page)

  await page.goto('/?local=1')
  await page.evaluate((text) => navigator.clipboard.writeText(text), LIST)
  await page.getByRole('button', { name: 'Have a deck copied? Click here to blitz!' }).click()

  // Into the game, four at the table, the room's code in the URL as ever.
  await expect(page.getByRole('button', { name: 'History' })).toBeVisible({ timeout: 60_000 })
  const roomId = await page.evaluate(() => new URL(window.location.href).searchParams.get('room'))
  expect(roomId).toMatch(/^[A-Z0-9]{5}$/)
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

  // It was all in this tab: nothing about the game went to the room server.
  expect(typesOf(sent)).toEqual([])
  expect(sent.some((s) => s.includes(roomId!))).toBe(false)
  expect(errors).toEqual([])
})

test('a local game picks up again after a reload, where it was', async ({ page, context }) => {
  test.setTimeout(150_000)
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await stubImport(page)
  const sent = serverTraffic(page)
  await page.goto('/?local=1')
  await page.evaluate((text) => navigator.clipboard.writeText(text), LIST)
  await page.getByRole('button', { name: 'Have a deck copied? Click here to blitz!' }).click()
  await expect(page.getByRole('button', { name: 'History' })).toBeVisible({ timeout: 60_000 })
  const roomId = await page.evaluate(() => new URL(window.location.href).searchParams.get('room'))
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
  // Let a save land (at most a second after a frame), then reload.
  await page.waitForTimeout(2_500)
  const before = await page.locator('.board-entry').count()

  await page.reload()
  // The same game, in the same room, with the player back in their seat and
  // the bots' cards where they were — never on the room server.
  await expect(page.getByRole('button', { name: 'History' })).toBeVisible({ timeout: 60_000 })
  expect(await page.evaluate(() => new URL(window.location.href).searchParams.get('room'))).toBe(roomId)
  await expect(page.locator('[data-player-id]')).toHaveCount(4)
  await expect.poll(() => page.locator('.board-entry').count(), { timeout: 20_000 }).toBeGreaterThanOrEqual(before)
  await expect(page.getByRole('button', { name: /^(Pass|Pass Turn|Auto-pass|Keep.*|Discard)/ }).first()).toBeVisible()
  expect(sent.some((s) => s.includes(roomId!))).toBe(false)
})

test('a lesson opens in the page too, and its Next is answered there', async ({ page }) => {
  test.setTimeout(90_000)
  const sent = serverTraffic(page)
  await page.goto('/?local=1')
  await page.locator('[data-tour="corner-help"]').click()
  await page.getByRole('menuitem', { name: /Learn Commander/ }).click()
  const card = page.locator('.coach-card')
  await expect(card).toContainText('Welcome to the table', { timeout: 60_000 })
  await card.getByRole('button', { name: 'Next' }).click()
  await expect(card).toContainText('Play a land', { timeout: 20_000 })
  expect(typesOf(sent)).toEqual([])
})

test('a lobby still opens on the room server, for others to join', async ({ page }) => {
  const sent = serverTraffic(page)
  await page.goto('/?local=1')
  await page.getByRole('button', { name: 'Create a game' }).click()
  await expect(page.getByRole('button', { name: /add player/i }).first()).toBeVisible({ timeout: 20_000 })
  expect(typesOf(sent)).toContain('create-room')
  expect(typesOf(sent)).toContain('join-room')
})

test('local mode stays on for the tab, and ?local=0 turns it off', async ({ page }) => {
  await page.goto('/?local=1')
  expect(await page.evaluate(() => sessionStorage.getItem('mtg.local'))).toBe('1')
  await page.goto('/')
  expect(await page.evaluate(() => sessionStorage.getItem('mtg.local'))).toBe('1')
  await page.goto('/?local=0')
  expect(await page.evaluate(() => sessionStorage.getItem('mtg.local'))).toBeNull()
})
