import { expect, test } from '@playwright/test'
import type { Page, WebSocket } from '@playwright/test'
import { readFileSync } from 'node:fs'

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

/**
 * Alice passes her turns (Auto-pass stops at her own, so Pass turn there)
 * until a bot's permanent is on the board. When she is the one who goes
 * first she ends that turn with eight cards, having played none, and the
 * game waits on her cleanup discard: answered here. Unanswered, nothing ever
 * reached the board and the test failed about one run in four, whenever the
 * roll put her first ("fails on and off on main", 2026-11-16).
 */
async function passUntilTheBoardHasSomething(page: Page): Promise<void> {
  await expect
    .poll(
      async () => {
        const discard = page.locator('.decision-banner', { hasText: 'Discard to hand size' })
        if (await discard.isVisible().catch(() => false)) {
          // The fan overlaps its cards: a click sent to the tile itself.
          await page.locator('.hand-card .card-tile').first().dispatchEvent('click')
          await discard.getByRole('button', { name: 'Discard' }).click({ timeout: 2_000 }).catch(() => {})
        }
        const passTurn = page.getByRole('button', { name: 'Pass turn' })
        if (await passTurn.isEnabled().catch(() => false)) await passTurn.click().catch(() => {})
        return page.locator('.board-entry').count()
      },
      { timeout: 60_000, intervals: [1_000] },
    )
    .toBeGreaterThan(0)
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
  // whatever reaches the battlefield is a bot's: pass her turns until
  // something does.
  const keep = page.getByRole('button', { name: /^Keep/ })
  if (await keep.isVisible({ timeout: 5_000 }).catch(() => false)) await keep.click()
  await page.getByRole('button', { name: 'Auto-pass' }).click()
  await passUntilTheBoardHasSomething(page)

  // The numbers a slower machine is measured by (the plan's step 6).
  const stats = await page.evaluate(
    () => (window as unknown as { deckblitzLocal: { stats: () => Promise<Record<string, number | null>> } }).deckblitzLocal.stats(),
  )
  expect(stats.decisions).toBeGreaterThan(0)
  expect(stats.readyMs).toBeGreaterThan(0)
  expect(stats.games).toBe(1)

  // The History is the same panel as a server room's, Export log included:
  // the file is named for this room.
  await page.getByRole('button', { name: 'History', exact: true }).click()
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.event-log').getByRole('button', { name: 'Export log' }).click(),
  ])
  expect(download.suggestedFilename()).toMatch(new RegExp(`^gamelog-${roomId}-\\d+\\.txt$`))
  await page.keyboard.press('Escape')

  // It was all in this tab: nothing about the game went to the room server.
  expect(typesOf(sent)).toEqual([])
  expect(sent.some((s) => s.includes(roomId!))).toBe(false)
  expect(errors).toEqual([])

  // The file has the game's replay after its lines, and Settings on the
  // landing page plays it again from Alice's seat (`src/replay/`).
  const file = await download.path()
  expect(readFileSync(file, 'utf8')).toContain('=== Deck Blitz replay')
  await page.goto('/?local=1')
  await page.getByRole('button', { name: 'Settings' }).click()
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Watch a replay…' }).click(),
  ])
  await chooser.setFiles(file)
  const bar = page.getByRole('toolbar', { name: 'Replay' })
  await expect(bar).toBeVisible({ timeout: 20_000 })
  await expect(bar.locator('.replay-where')).toContainText('1/')
  await bar.getByRole('button', { name: 'On a move' }).click()
  await expect(bar.locator('.replay-where')).toContainText('2/')
  // A History entry takes the board to its move.
  await page.getByRole('button', { name: 'History', exact: true }).click()
  await expect(page.locator('.event-log li.ev-ahead').first()).toBeVisible()
  await page.locator('.event-log li').last().click()
  await expect(page.locator('.event-log li.ev-ahead')).toHaveCount(0)
  await expect(page.locator('.event-log-export')).toHaveCount(0)
  await bar.getByRole('button', { name: 'Exit replay' }).click()
  await expect(bar).toHaveCount(0)
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
  await passUntilTheBoardHasSomething(page)
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
  await expect(page.getByRole('button', { name: /^(Pass|Pass turn|Auto-pass|Keep.*|Discard)/ }).first()).toBeVisible()
  expect(sent.some((s) => s.includes(roomId!))).toBe(false)
})

test('a lesson opens in the page too, and its Next is answered there', async ({ page }) => {
  test.setTimeout(90_000)
  const sent = serverTraffic(page)
  await page.goto('/?local=1')
  await page.locator('[data-tour="corner-help"]').click()
  await page.getByRole('menuitem', { name: /Learn Commander/ }).click()
  const card = page.locator('.coach-card')
  await expect(card).toContainText('Welcome!', { timeout: 60_000 })
  await card.getByRole('button', { name: 'Next' }).click()
  await expect(card).toContainText('How you win', { timeout: 20_000 })
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

test('a lobby game with only bots across the table moves into the page as it starts', async ({ page }) => {
  // `src/lobby/localStart.ts`: the host seated, every other seat a bot, and
  // nobody watching — the same table is rebuilt in the worker and started
  // there, and the server's waiting room is left.
  test.setTimeout(120_000)
  const sent = serverTraffic(page)
  await page.goto('/?local=1')
  await page.getByRole('button', { name: 'Create a game' }).click()
  await page.getByRole('button', { name: 'Add precon bot' }).first().click()
  await expect(page.getByRole('button', { name: 'Add precon bot' })).toHaveCount(0, { timeout: 20_000 })
  const lobbyId = await page.evaluate(() => new URL(window.location.href).searchParams.get('room'))
  await page.getByRole('button', { name: 'Ready' }).click()
  await page.getByRole('button', { name: 'Start game' }).click()

  await expect(page.getByRole('button', { name: 'History' })).toBeVisible({ timeout: 60_000 })
  await expect(page.locator('[data-player-id]')).toHaveCount(2, { timeout: 20_000 })
  const roomId = await page.evaluate(() => new URL(window.location.href).searchParams.get('room'))
  expect(roomId).not.toBe(lobbyId)
  // The lobby was left, never started, and the game's room is unknown there.
  expect(typesOf(sent)).toContain('leave-room')
  expect(typesOf(sent)).not.toContain('start-game')
  expect(sent.some((s) => s.includes(roomId!))).toBe(false)
})

test('local mode stays on for the tab, and ?local=0 turns it off', async ({ page }) => {
  await page.goto('/?local=1')
  expect(await page.evaluate(() => sessionStorage.getItem('mtg.local'))).toBe('1')
  await page.goto('/')
  expect(await page.evaluate(() => sessionStorage.getItem('mtg.local'))).toBe('1')
  await page.goto('/?local=0')
  expect(await page.evaluate(() => sessionStorage.getItem('mtg.local'))).toBe('0')
})

test("a blitz whose card pool won't load in the page is played on the server instead", async ({ page, context }) => {
  test.setTimeout(120_000)
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await stubImport(page)
  // The worker's card shards fail: it can't start.
  await context.route(/\/shard-\d+[^/]*\.js/, (route) => route.abort())
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const sent = serverTraffic(page)

  await page.goto('/?local=1')
  await page.evaluate((text) => navigator.clipboard.writeText(text), LIST)
  await page.getByRole('button', { name: 'Have a deck copied? Click here to blitz!' }).click()

  // Into the game all the same, its room on the server.
  await expect(page.getByRole('button', { name: 'History' })).toBeVisible({ timeout: 60_000 })
  await expect(page.locator('[data-player-id]')).toHaveCount(4, { timeout: 20_000 })
  const roomId = await page.evaluate(() => new URL(window.location.href).searchParams.get('room'))
  expect(typesOf(sent)).toContain('create-room')
  expect(sent.some((s) => s.includes(roomId!))).toBe(true)
  expect(errors).toEqual([])
})
