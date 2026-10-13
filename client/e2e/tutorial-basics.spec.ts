import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'
import type { APIRequestContext, Locator, Page } from '@playwright/test'

// Learn Commander, end to end (docs/plans/tutorials.md, phase 2): the "?"
// menu opens a tutorial room on the server's `basics-proof` lesson, and the
// coach overlay shows each card the server sends, as its frame is shown. The
// lesson is played through the UI the way a player would — Next, click a
// Forest, click Llanowar Elves, Pass Turn, block with the Elves — every card
// in order, to the last one, and the progress store marks it done. Retry
// rewinds a chapter gone wrong.
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
const CARDS = ['welcome', 'play-land', 'cast-elves', 'pass-turn', 'block', 'well-done', 'lesson-complete']

interface GameState {
  readonly turn: number
  readonly step: string
  readonly players: Record<string, { readonly life: number; readonly lands: number; readonly hand: readonly string[] }>
}

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
async function expectCard(page: Page, id: string, size: { width: number; height: number }): Promise<Locator> {
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

async function startLesson(page: Page): Promise<void> {
  await page.goto('/')
  await page.locator('[data-tour="corner-help"]').click()
  await page.getByRole('menuitem', { name: /Learn Commander/ }).click()
  await expect(cardOf(page, 'welcome')).toBeVisible({ timeout: 60_000 })
  expect(roomOf(page)).toMatch(/^[A-Z0-9]{5}$/)
}

for (const size of SIZES) {
  test(`${size.width}x${size.height}: Learn Commander plays basics-proof through, card by card`, async ({ page, request }) => {
    test.setTimeout(240_000)
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.setViewportSize(size)
    await recordCards(page)
    await startLesson(page)

    // Welcome: a card on its own, everything else blocked, and no Retry yet.
    const welcome = await expectCard(page, 'welcome', size)
    await expect(layer(page)).toHaveAttribute('data-phase', 'center')
    await expect(welcome.getByRole('button', { name: 'Retry chapter' })).toHaveCount(0)
    await expectBlocked(page, page.locator('[data-tour="game-pass-turn"]'))
    await welcome.getByRole('button', { name: 'Next' }).click()

    // Play a land: the Forest in hand is lit, and clicking it plays it.
    const land = await expectCard(page, 'play-land', size)
    await expect(layer(page)).toHaveAttribute('data-reach', 'page')
    await expect(land.locator('[data-goal="land-played"]')).toHaveAttribute('data-done', 'false')
    await expect(land.getByRole('button', { name: 'Next' })).toHaveCount(0)
    await expectSpotlit(page, handCard(page, 'Forest'))
    await expectApart(land, handCard(page, 'Forest'), 'the Forest')
    // The top strip's menus stay out of reach while a goal card is up.
    await expectBlocked(page, page.locator('[data-tour="game-history"]'))
    await handCard(page, 'Forest').click()

    // Cast Llanowar Elves: one click, the Forest paying for it.
    const cast = await expectCard(page, 'cast-elves', size)
    expect((await state(page, request)).players.alice.lands).toBe(1)
    await expectSpotlit(page, handCard(page, 'Llanowar Elves'))
    await expectApart(cast, handCard(page, 'Llanowar Elves'), 'the Elves')
    await handCard(page, 'Llanowar Elves').click()

    // Pass the turn: the room keeps the window for it, on turn 1 with the
    // Elves down, rather than passing it for the player.
    const pass = await expectCard(page, 'pass-turn', size)
    await expect.poll(async () => (await state(page, request)).turn).toBe(1)
    await expect(myTile(page, 'Llanowar Elves')).toBeVisible()
    const passTurn = page.locator('[data-tour="game-pass-turn"]')
    await expectSpotlit(page, passTurn)
    await expectApart(pass, passTurn, 'Pass Turn')
    await expect(passTurn).toBeEnabled()
    await passTurn.click()

    // Block: Rowan's Mystic attacks; the Elves, then the banner's Block.
    const block = await expectCard(page, 'block', size)
    await expect(page.getByText(/Declare blockers/)).toBeVisible()
    await expectSpotlit(page, myTile(page, 'Llanowar Elves'))
    await expectApart(block, myTile(page, 'Llanowar Elves'), 'the Elves')
    const attacker = page.locator('.quadrant-cell:not(.self) .mini-tile-wrap', { hasText: 'Elvish Mystic' }).first()
    await expectApart(block, attacker, "Rowan's attacking Mystic")
    const banner = page.locator('[data-tour="game-decision-banner"]')
    await expectApart(block, banner, 'the decision banner')
    await myTile(page, 'Llanowar Elves').click()
    const confirm = banner.getByRole('button', { name: /^Block/ })
    await expect(confirm).toBeEnabled()
    await confirm.click()

    const done = await expectCard(page, 'well-done', size)
    await done.getByRole('button', { name: 'Next' }).click()

    // The end: a card of its own, and the lesson recorded as done.
    const end = await expectCard(page, 'lesson-complete', size)
    await expect(end.getByRole('heading')).toHaveText('You did it!')
    await expect(end.getByRole('button', { name: 'Play again' })).toBeVisible()
    await expect
      .poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem('mtg.tutorials') ?? '{}').lessons))
      .toEqual({ 'basics-proof': 'done' })
    expect(await cardsSeen(page)).toEqual(CARDS)
    // Rowan never lost a life he wasn't meant to; alice took no damage.
    expect((await state(page, request)).players.alice.life).toBe(40)

    // Back to the menu, where the "?" menu says it's done.
    await end.getByRole('button', { name: 'Back to menu' }).click()
    await expect(page.locator('[data-tour="landing-create"]')).toBeVisible({ timeout: 30_000 })
    await page.locator('[data-tour="corner-help"]').click()
    await expect(page.getByRole('menuitem', { name: /Learn Commander again/ })).toContainText('Done')
    expect(errors).toEqual([])
  })
}

test('Retry rewinds a chapter gone wrong to its start', async ({ page, request }) => {
  test.setTimeout(180_000)
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await startLesson(page)
  await cardOf(page, 'welcome').getByRole('button', { name: 'Next' }).click()
  await expect(cardOf(page, 'play-land')).toBeVisible()
  await handCard(page, 'Forest').click()
  await expect(cardOf(page, 'cast-elves')).toBeVisible({ timeout: 30_000 })
  const start = await state(page, request)
  expect(start).toMatchObject({ turn: 1 })
  expect(start.players.alice.hand).toHaveLength(2)

  // The wrong move: pass the turn without casting the Elves. Rowan's turn
  // plays out (his Mystic swings in unblocked), and it's alice's again.
  await page.locator('[data-tour="game-pass-turn"]').click()
  await expect.poll(async () => (await state(page, request)).turn, { timeout: 60_000 }).toBe(3)
  const wrong = await state(page, request)
  expect(wrong.players.alice.life).toBe(39)
  expect(wrong.players.alice.hand).toHaveLength(3)
  // Still asked to cast them.
  await expect(cardOf(page, 'cast-elves')).toBeVisible()
  await expect(cardOf(page, 'cast-elves').locator('[data-goal="elves-cast"]')).toHaveAttribute('data-done', 'false')

  // Retry: back to the chapter's start — turn 1, the life back, the draw undone.
  await cardOf(page, 'cast-elves').getByRole('button', { name: 'Retry chapter' }).click()
  await expect.poll(async () => (await state(page, request)).turn, { timeout: 30_000 }).toBe(1)
  const rewound = await state(page, request)
  expect(rewound.players.alice.life).toBe(40)
  expect(rewound.players.alice.hand).toEqual(start.players.alice.hand)
  expect(rewound.players.alice.lands).toBe(1)
  await expect(cardOf(page, 'cast-elves')).toBeVisible()
  await expect(handCard(page, 'Llanowar Elves')).toBeVisible()
  // The rewound board on screen, settled, before the click.
  await expect(page.locator('.hand-card')).toHaveCount(2)
  await expect(page.locator('.ts-acting')).toHaveText(/Alice to act/, { timeout: 30_000 })

  // And it plays on from there: cast them now.
  await handCard(page, 'Llanowar Elves').click()
  await expect(cardOf(page, 'pass-turn')).toBeVisible({ timeout: 30_000 })
  expect(errors).toEqual([])
})
