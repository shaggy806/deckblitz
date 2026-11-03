import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'
import type { APIRequestContext, Locator, Page } from '@playwright/test'

// Learn Commander's second game, Commander's own rules, end to end, on a table
// of three: whom to attack by clicking an opponent's board, the commander coming
// back through the banner's Command zone, Disfigure in response to Giant Growth,
// and 21 commander damage, through the UI as a player would. What's closed is
// tried too: the wrong defender, leaving the commander behind, and passing a
// spell through.
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

const CARDS = [
  'welcome', 'everyone-for-themselves', 'damage-chip',
  'first-to-combat', 'first-attack', 'first-hit', 'first-pass',
  'shocked', 'back-to-command-zone', 'commander-tax',
  'on-the-stack', 'respond', 'last-in-first-out',
  'recast', 'second-to-combat', 'second-attack', 'second-pass',
  'the-sums', 'last-to-combat', 'last-attack', 'won',
  'lesson-complete',
]

type Size = { readonly width: number; readonly height: number }
interface GameState {
  readonly turn: number
  readonly players: Record<string, { readonly life: number }>
}

const COMMANDER = 'Kalakscion'
const cardOf = (page: Page, id: string) => page.locator(`.coach-card[data-step="${id}"]`)
const roomOf = (page: Page): string => new URL(page.url()).searchParams.get('room') ?? ''
const banner = (page: Page) => page.locator('[data-tour="game-decision-banner"]')
const seat = (page: Page, player: string): Locator => page.locator(`.quadrant-cell:has([data-player-id="${player}"])`)
const myTile = (page: Page, name: string) => seat(page, 'alice').locator('.mini-tile-wrap', { hasText: name }).first()

async function state(page: Page, request: APIRequestContext): Promise<GameState> {
  const response = await request.post(CONTROL, { data: { op: 'state', room: roomOf(page) } })
  expect(response.ok()).toBe(true)
  return (await response.json()) as GameState
}

async function expectCard(page: Page, id: string, size: Size): Promise<Locator> {
  const card = cardOf(page, id)
  await expect(card, `card ${id}`).toBeVisible({ timeout: 60_000 })
  await expect(page.locator('.ts-acting'), `card ${id}: the board settles`).not.toHaveText('Resolving…', { timeout: 30_000 })
  const box = await card.boundingBox()
  const view = page.viewportSize()
  if (box !== null && view !== null) {
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.y).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(view.width)
    expect(box.y + box.height).toBeLessThanOrEqual(view.height)
  }
  // A card waiting on an anchor it can't find says so instead of its own words.
  await expect(card).not.toContainText("this part of the page hasn't shown up yet")
  if (SHOTS) {
    await page.waitForTimeout(800)
    mkdirSync(SHOTS, { recursive: true })
    const name = `rules-${size.width}x${size.height}-${String(CARDS.indexOf(id) + 1).padStart(2, '0')}-${id}.png`
    await page.screenshot({ path: join(SHOTS, name) })
  }
  return card
}

async function next(page: Page, id: string, size: Size): Promise<void> {
  const card = await expectCard(page, id, size)
  await card.getByRole('button', { name: 'Next' }).click()
}

/** An empty part of `player`'s side of the table, which takes the attack click. */
async function clickBoard(page: Page, player: string): Promise<void> {
  const body = seat(page, player).locator('.quadrant-body')
  const box = await body.boundingBox()
  if (box === null) throw new Error(`no board for ${player}`)
  await body.click({ position: { x: box.width * 0.6, y: box.height - 8 } })
}

/** Each creature, then the board of the player it attacks, then the banner's
 * button, closed until all of them are sent. */
async function attack(page: Page, at: readonly (readonly [string, string])[]): Promise<void> {
  const confirm = banner(page).getByRole('button', { name: /Attack with|No attacks/ })
  for (const [name, player] of at) {
    await expect(confirm).toBeDisabled()
    await myTile(page, name).click()
    await clickBoard(page, player)
  }
  await expect(confirm).toHaveText(`Attack with ${at.length}`)
  await expect(confirm).toBeEnabled()
  await confirm.click()
}

async function startLesson(page: Page): Promise<void> {
  await page.goto('/')
  await page.locator('[data-tour="corner-help"]').click()
  await page.getByRole('menuitem', { name: /Commander's rules/ }).click()
  await expect(cardOf(page, 'welcome')).toBeVisible({ timeout: 60_000 })
}

for (const size of SIZES) {
  test(`${size.width}x${size.height}: Commander's rules plays through to the win, trying what's closed`, async ({ page, request }) => {
    test.setTimeout(420_000)
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.setViewportSize(size)
    await page.addInitScript(() => {
      const seen: string[] = []
      ;(window as unknown as { __cards: string[] }).__cards = seen
      new MutationObserver(() => {
        const id = document.querySelector('.coach-card[data-step]')?.getAttribute('data-step')
        if (id && seen.at(-1) !== id) seen.push(id)
      }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-step'] })
    })
    await startLesson(page)
    const pass = page.locator('[data-tour="game-pass"]')
    const passTurn = page.locator('[data-tour="game-pass-turn"]')

    // A table of three, on turn 9.
    await next(page, 'welcome', size)
    await next(page, 'everyone-for-themselves', size)
    await next(page, 'damage-chip', size)
    expect((await state(page, request)).turn).toBe(9)

    // Whom to attack: the wrong player leaves the button closed, and Clear
    // takes it back.
    await expectCard(page, 'first-to-combat', size)
    await pass.click()
    await expectCard(page, 'first-attack', size)
    await myTile(page, COMMANDER).click()
    await clickBoard(page, 'carol')
    await myTile(page, 'Cabal Evangel').click()
    await clickBoard(page, 'carol')
    await myTile(page, 'Muck Rats').click()
    await clickBoard(page, 'carol')
    await expect(banner(page).getByRole('button', { name: /Attack with/ })).toBeDisabled()
    await expect(banner(page)).toContainText('press Clear to start again')
    await banner(page).getByRole('button', { name: 'Clear' }).click()
    await expect(banner(page)).not.toContainText('press Clear')
    await attack(page, [[COMMANDER, 'bob'], ['Cabal Evangel', 'carol'], ['Muck Rats', 'carol']])
    await next(page, 'first-hit', size)
    await expectCard(page, 'first-pass', size)
    await passTurn.click()

    // The commander dies, and goes back: leaving it is closed.
    await next(page, 'shocked', size)
    await expectCard(page, 'back-to-command-zone', size)
    await expect(banner(page).getByRole('button', { name: /Leave in graveyard/ })).toBeDisabled()
    await banner(page).getByRole('button', { name: 'Command zone' }).click()
    await next(page, 'commander-tax', size)

    // The stack: Pass is closed, so Giant Growth can't be let through.
    await next(page, 'on-the-stack', size)
    await expectCard(page, 'respond', size)
    await expect(pass).toBeDisabled()
    await expect(page.locator('.hand-strip')).toHaveClass(/raised/)
    await page.locator('.hand-card', { hasText: 'Disfigure' }).first().click()
    await seat(page, 'carol').locator('.mini-tile-wrap', { hasText: 'Grizzly Bears' }).first().click()
    await next(page, 'last-in-first-out', size)

    // Back again, for 5 mana.
    await expectCard(page, 'recast', size)
    await seat(page, 'alice').locator('.commander-tile-wrap').click()
    await expectCard(page, 'second-to-combat', size)
    await pass.click()
    await expectCard(page, 'second-attack', size)
    await attack(page, [['Cabal Evangel', 'carol'], ['Muck Rats', 'carol']])
    await expectCard(page, 'second-pass', size)
    await passTurn.click()

    // Both at once: Rowan out on 21 commander damage, with life left.
    await next(page, 'the-sums', size)
    await expectCard(page, 'last-to-combat', size)
    await pass.click()
    await expectCard(page, 'last-attack', size)
    await attack(page, [[COMMANDER, 'bob'], ['Cabal Evangel', 'carol'], ['Muck Rats', 'carol']])
    await next(page, 'won', size)
    const players = (await state(page, request)).players
    expect(players.bob.life).toBe(16)
    expect(players.carol.life).toBe(0)

    const end = await expectCard(page, 'lesson-complete', size)
    await expect(end.getByRole('heading')).toHaveText("That's Commander")
    await expect
      .poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem('mtg.tutorials') ?? '{}').lessons))
      .toMatchObject({ 'commander-rules': 'done' })
    expect(await page.evaluate(() => (window as unknown as { __cards: string[] }).__cards)).toEqual(CARDS)
    expect(errors).toEqual([])
  })
}
