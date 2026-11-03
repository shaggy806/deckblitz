import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'
import type { APIRequestContext, Locator, Page } from '@playwright/test'

// Learn Commander, end to end (docs/plans/tutorials.md): the "?" menu opens a
// tutorial room on the server's `learn-commander` lesson, and the coach overlay
// shows each card the server sends, as its frame is shown. The lesson is played
// through the UI the way a player would, every card in order, to the win on turn
// 7 and on into a first real game. A second test checks what's closed: the
// buttons that used to leave the lesson waiting for a move that couldn't happen.
//
// Set LESSON_SHOTS_DIR to also walk it at 1920x1080 and 2560x1440 and save a
// screenshot of every card at each size.

const CONTROL = `http://127.0.0.1:${process.env.E2E_CONTROL_PORT ?? 4099}`
const SHOTS = process.env.LESSON_SHOTS_DIR
const SIZES = SHOTS
  ? [
      { width: 1366, height: 768 },
      { width: 1920, height: 1080 },
      { width: 2560, height: 1440 },
    ]
  : [{ width: 1366, height: 768 }]

/** Every card the lesson shows, in order. */
const CARDS = [
  'welcome', 'life', 'hand', 'read-a-card', 'command-zone', 'library',
  'first-land', 'cast-rats', 'tapped', 'summoning-sick', 'first-pass',
  'phase-track', 'rowan-creature',
  'your-turn-again', 'second-land', 'cast-evangel', 'first-to-combat', 'first-attack', 'first-hit', 'second-pass',
  'block', 'block-result', 'graveyard',
  'third-land', 'cast-commander', 'commander-rules', 'second-to-combat', 'second-attack', 'third-pass',
  'rowan-commander', 'last-turn', 'last-to-combat', 'last-attack', 'blocked', 'won',
  'lesson-complete',
]

interface GameState {
  readonly turn: number
  readonly step: string
  readonly players: Record<string, { readonly life: number; readonly lands: number; readonly hand: readonly string[] }>
}

type Size = { readonly width: number; readonly height: number }

async function control<T>(request: APIRequestContext, data: Record<string, unknown>): Promise<T> {
  const response = await request.post(CONTROL, { data })
  expect(response.ok()).toBe(true)
  return (await response.json()) as T
}

const layer = (page: Page) => page.locator('.coach-layer')
const cardOf = (page: Page, id: string) => page.locator(`.coach-card[data-step="${id}"]`)
const roomOf = (page: Page): string => new URL(page.url()).searchParams.get('room') ?? ''
const state = (page: Page, request: APIRequestContext) => control<GameState>(request, { op: 'state', room: roomOf(page) })

/** Records every card the overlay shows, in order, from before the page's
 * own scripts run. */
async function recordCards(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const seen: string[] = []
    ;(window as unknown as { __cards: string[] }).__cards = seen
    new MutationObserver(() => {
      const id = document.querySelector('.coach-card[data-step]')?.getAttribute('data-step')
      if (id && seen.at(-1) !== id) seen.push(id)
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-step'] })
  })
}
const cardsSeen = (page: Page) => page.evaluate(() => (window as unknown as { __cards: string[] }).__cards)

/** The open card is wholly on screen. */
async function expectOnScreen(page: Page, card: Locator): Promise<void> {
  const box = await card.boundingBox()
  const view = page.viewportSize()
  expect(box).not.toBeNull()
  if (box === null || view === null) return
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(view.width)
  expect(box.y + box.height).toBeLessThanOrEqual(view.height)
}

/** Neither box overlaps the other. */
async function expectApart(a: Locator, b: Locator, what: string): Promise<void> {
  const x = await a.boundingBox()
  const y = await b.boundingBox()
  expect(x, what).not.toBeNull()
  expect(y, what).not.toBeNull()
  if (x === null || y === null) return
  const overlap = x.x < y.x + y.width && y.x < x.x + x.width && x.y < y.y + y.height && y.y < x.y + x.height
  expect(overlap, `the card covers ${what}`).toBe(false)
}

/** The spotlight's ring sits round `target`. */
async function expectSpotlit(page: Page, target: Locator): Promise<void> {
  await expect(layer(page)).toHaveAttribute('data-phase', 'anchored')
  const ring = await page.locator('.coach-ring').boundingBox()
  const box = await target.boundingBox()
  expect(ring).not.toBeNull()
  expect(box).not.toBeNull()
  if (ring === null || box === null) return
  const cx = box.x + box.width / 2
  const cy = Math.min(box.y + box.height / 2, (page.viewportSize()?.height ?? 0) - 1)
  expect(cx).toBeGreaterThan(ring.x)
  expect(cx).toBeLessThan(ring.x + ring.width)
  expect(cy).toBeGreaterThan(ring.y)
  expect(cy).toBeLessThan(ring.y + ring.height)
}

/** Waits for card `id`, on screen and settled (its frame shown, the board
 * idle), and saves its screenshot when asked to. */
async function expectCard(page: Page, id: string, size: Size): Promise<Locator> {
  const card = cardOf(page, id)
  await expect(card, `card ${id}`).toBeVisible({ timeout: 60_000 })
  await expect(page.locator('.ts-acting'), `card ${id}: the board settles`).not.toHaveText('Resolving…', { timeout: 30_000 })
  await expectOnScreen(page, card)
  if (SHOTS) {
    // The card's entrance and the board's art, finished.
    await page.waitForTimeout(800)
    const dir = join(SHOTS)
    mkdirSync(dir, { recursive: true })
    await page.screenshot({ path: join(dir, `${size.width}x${size.height}-${String(CARDS.indexOf(id) + 1).padStart(2, '0')}-${id}.png`) })
  }
  return card
}

/** On through a Next card. */
async function next(page: Page, id: string, size: Size): Promise<void> {
  const card = await expectCard(page, id, size)
  await card.getByRole('button', { name: 'Next' }).click()
}

/** A click on the page under the overlay lands on the overlay instead. */
async function expectBlocked(page: Page, target: Locator): Promise<void> {
  const box = await target.boundingBox()
  expect(box).not.toBeNull()
  if (box === null) return
  const hit = await page.evaluate(
    ([x, y]) => document.elementFromPoint(x, y)?.closest('.coach-layer') !== null,
    [box.x + box.width / 2, box.y + box.height / 2] as const,
  )
  expect(hit).toBe(true)
}

const handCard = (page: Page, name: string) => page.locator('.hand-card', { hasText: name }).first()
const myTile = (page: Page, name: string) =>
  page.locator('.quadrant-cell.self .mini-tile-wrap', { hasText: name }).first()
const banner = (page: Page) => page.locator('[data-tour="game-decision-banner"]')

/** Declares `names` as attackers, each picked on the board, with the banner's
 * button, which stays closed short of everyone the card asks for. */
async function attackWith(page: Page, names: readonly string[]): Promise<void> {
  const confirm = banner(page).getByRole('button', { name: /Attack with|No attacks/ })
  for (const name of names) {
    await expect(confirm).toBeDisabled()
    await myTile(page, name).click()
  }
  await expect(confirm).toHaveText(`Attack with ${names.length}`)
  await expect(confirm).toBeEnabled()
  await confirm.click()
}

async function startLesson(page: Page): Promise<void> {
  await page.goto('/')
  await page.locator('[data-tour="corner-help"]').click()
  await page.getByRole('menuitem', { name: /Learn Commander/ }).click()
  await expect(cardOf(page, 'welcome')).toBeVisible({ timeout: 60_000 })
  expect(roomOf(page)).toMatch(/^[A-Z0-9]{5}$/)
}

for (const size of SIZES) {
  test(`${size.width}x${size.height}: Learn Commander plays through to the win, card by card`, async ({ page, request }) => {
    test.setTimeout(420_000)
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.setViewportSize(size)
    await recordCards(page)
    await startLesson(page)
    const pass = page.locator('[data-tour="game-pass"]')
    const passTurn = page.locator('[data-tour="game-pass-turn"]')
    const autoPass = page.locator('[data-tour="game-auto-pass"]')

    // The table: Next cards, everything else blocked, nothing yet to retry, and
    // nothing to go back to at first.
    const welcome = await expectCard(page, 'welcome', size)
    await expect(layer(page)).toHaveAttribute('data-phase', 'center')
    await expect(welcome.getByRole('button', { name: 'Retry chapter' })).toHaveCount(0)
    await expect(welcome.getByRole('button', { name: 'Back' })).toHaveCount(0)
    await expectBlocked(page, passTurn)
    await welcome.getByRole('button', { name: 'Next' }).click()
    await next(page, 'life', size)
    // The hand comes up by itself for the cards about it.
    await expectCard(page, 'hand', size)
    await expect(page.locator('.hand-strip')).toHaveClass(/raised/)
    await cardOf(page, 'hand').getByRole('button', { name: 'Next' }).click()
    await expectCard(page, 'read-a-card', size)
    await expect(cardOf(page, 'read-a-card').locator('.pip').first()).toBeVisible()
    await cardOf(page, 'read-a-card').getByRole('button', { name: 'Next' }).click()
    await next(page, 'command-zone', size)
    await next(page, 'library', size)

    // Land and mana.
    const land = await expectCard(page, 'first-land', size)
    await expect(layer(page)).toHaveAttribute('data-reach', 'page')
    await expect(land.getByRole('button', { name: 'Next' })).toHaveCount(0)
    await expectSpotlit(page, handCard(page, 'Swamp'))
    await expect(page.locator('.hand-strip')).toHaveClass(/raised/)
    await expectApart(land, handCard(page, 'Swamp'), 'the Swamp')
    await handCard(page, 'Swamp').click()
    await expectCard(page, 'cast-rats', size)
    expect((await state(page, request)).players.alice.lands).toBe(1)
    await handCard(page, 'Muck Rats').click()
    await next(page, 'tapped', size)
    await next(page, 'summoning-sick', size)
    const firstPass = await expectCard(page, 'first-pass', size)
    await expectSpotlit(page, passTurn)
    await expectApart(firstPass, passTurn, 'Pass Turn')
    await passTurn.click()

    // Rowan's turn stops at each card, with nothing going on behind it.
    await expectCard(page, 'phase-track', size)
    expect((await state(page, request)).players.bob.lands).toBe(0)
    await cardOf(page, 'phase-track').getByRole('button', { name: 'Next' }).click()
    await next(page, 'rowan-creature', size)

    // Attack.
    await next(page, 'your-turn-again', size)
    await expectCard(page, 'second-land', size)
    await handCard(page, 'Swamp').click()
    await expectCard(page, 'cast-evangel', size)
    await handCard(page, 'Cabal Evangel').click()
    await expectCard(page, 'first-to-combat', size)
    await expect(passTurn).toBeDisabled()
    await expect(autoPass).toBeDisabled()
    await pass.click()
    const firstAttack = await expectCard(page, 'first-attack', size)
    await expectApart(firstAttack, banner(page), 'the decision banner')
    await attackWith(page, ['Muck Rats'])
    await expectCard(page, 'first-hit', size)
    expect((await state(page, request)).players.bob.life).toBe(12)
    await cardOf(page, 'first-hit').getByRole('button', { name: 'Next' }).click()
    await expectCard(page, 'second-pass', size)
    await passTurn.click()

    // Block.
    const block = await expectCard(page, 'block', size)
    await expect(page.getByText(/Declare blockers/)).toBeVisible()
    await expectApart(block, banner(page), 'the decision banner')
    // "No blocks" would have left the card waiting for a block that can't come.
    const confirm = banner(page).getByRole('button', { name: /^Block|No blocks/ })
    await expect(confirm).toBeDisabled()
    await myTile(page, 'Cabal Evangel').click()
    await expect(confirm).toBeEnabled()
    await confirm.click()
    await expectCard(page, 'block-result', size)
    await expect(page.locator('.quadrant-cell:not(.self) .mini-tile-wrap', { hasText: 'Dwarven Trader' })).toHaveCount(0)
    await cardOf(page, 'block-result').getByRole('button', { name: 'Next' }).click()
    await next(page, 'graveyard', size)

    // The commander, cast from the command zone: the tile with no name on it.
    await expectCard(page, 'third-land', size)
    await handCard(page, 'Swamp').click()
    await expectCard(page, 'cast-commander', size)
    await page.locator('.quadrant-cell.self [data-obj-id]', { hasNotText: /\w/ }).first().click()
    await next(page, 'commander-rules', size)
    await expectCard(page, 'second-to-combat', size)
    await pass.click()
    await expectCard(page, 'second-attack', size)
    await attackWith(page, ['Muck Rats', 'Cabal Evangel'])
    await expectCard(page, 'third-pass', size)
    expect((await state(page, request)).players.bob.life).toBe(9)
    await passTurn.click()

    // The finish.
    await next(page, 'rowan-commander', size)
    await next(page, 'last-turn', size)
    await expectCard(page, 'last-to-combat', size)
    await pass.click()
    await expectCard(page, 'last-attack', size)
    await attackWith(page, ['Kalakscion', 'Cabal Evangel', 'Muck Rats'])
    await next(page, 'blocked', size)
    await next(page, 'won', size)

    // The end: a card of its own, the lesson recorded as done, and on to a game.
    const end = await expectCard(page, 'lesson-complete', size)
    await expect(end.getByRole('heading')).toHaveText('You did it!')
    await expect(end.getByRole('button', { name: "Commander's rules" })).toBeVisible()
    await expect
      .poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem('mtg.tutorials') ?? '{}').lessons))
      .toEqual({ 'learn-commander': 'done' })
    expect(await cardsSeen(page)).toEqual(CARDS)
    expect((await state(page, request)).players.alice.life).toBe(40)

    await end.getByRole('button', { name: 'Play a real game' }).click()
    await expect(page.locator('.mulligan-modal')).toBeVisible({ timeout: 60_000 })
    await expect(page.locator('.coach-card')).toHaveCount(0)
    expect(errors).toEqual([])
  })
}

test('nothing can run off and leave the lesson waiting, Back looks, and Retry rewinds', async ({ page, request }) => {
  test.setTimeout(180_000)
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await startLesson(page)
  const size = { width: 1366, height: 768 }
  for (const id of ['welcome', 'life', 'hand', 'read-a-card', 'command-zone', 'library']) await next(page, id, size)

  // Passing early was the soft-lock (2026-11-02): all three buttons are closed.
  await expectCard(page, 'first-land', size)
  for (const button of ['game-pass', 'game-pass-turn', 'game-auto-pass']) {
    await expect(page.locator(`[data-tour="${button}"]`)).toBeDisabled()
  }
  await page.keyboard.press('Space')
  await page.waitForTimeout(500)
  expect((await state(page, request)).turn).toBe(1)
  await expect(cardOf(page, 'first-land')).toBeVisible()
  // Nor is another card in the hand any use.
  await handCard(page, 'Barony Vampire').click({ force: true })
  await page.waitForTimeout(300)
  expect((await state(page, request)).players.alice.hand).toHaveLength(7)

  // Back reads the card before, and returns; the game hasn't moved.
  await cardOf(page, 'first-land').getByRole('button', { name: 'Back' }).click()
  const review = cardOf(page, 'review:library')
  await expect(review).toContainText('Your library')
  await review.getByRole('button', { name: 'Back' }).click()
  await expect(cardOf(page, 'review:command-zone')).toBeVisible()
  await cardOf(page, 'review:command-zone').getByRole('button', { name: 'Return to the lesson' }).click()
  await expect(cardOf(page, 'first-land')).toBeVisible()

  // No Retry until there's something to undo; then back to the chapter's start.
  await expect(cardOf(page, 'first-land').getByRole('button', { name: 'Retry chapter' })).toHaveCount(0)
  await handCard(page, 'Swamp').click()
  const cast = await expectCard(page, 'cast-rats', size)
  expect((await state(page, request)).players.alice.lands).toBe(1)
  await cast.getByRole('button', { name: 'Retry chapter' }).click()
  await expect(cardOf(page, 'first-land')).toBeVisible({ timeout: 30_000 })
  await expect.poll(async () => (await state(page, request)).players.alice.lands, { timeout: 30_000 }).toBe(0)

  // And it plays on from there.
  await handCard(page, 'Swamp').click()
  await expect(cardOf(page, 'cast-rats')).toBeVisible({ timeout: 30_000 })
  expect(errors).toEqual([])
})
