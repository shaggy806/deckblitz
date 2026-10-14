import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

// The board tour (`server/src/tutorials/board-tour.ts`), end to end: the site
// tour's last card hands over to it, and every card finds what it points at
// on a real board — a player's corner, the commander-damage chip, the
// command zone, a hand card, the graveyard's count, a permanent, the phase
// track, the Pass row and the top strip's buttons. Two cards ask for a cast:
// Grizzly Bears from the hand, then Think Twice's flashback from the
// graveyard, through the zone viewer's Cast button.
//
// Set LESSON_SHOTS_DIR to save a screenshot of every card at 1366x768,
// 1920x1080 and 2560x1440.

const SHOTS = process.env.LESSON_SHOTS_DIR
const SIZES = [
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
] as const

/** Every card, in order; a centred one (no anchor) marked. */
const CARDS: readonly { readonly id: string; readonly centred?: boolean }[] = [
  { id: 'welcome', centred: true },
  { id: 'player-panel' },
  { id: 'commander-damage' },
  { id: 'command-zone' },
  { id: 'abilities' },
  { id: 'cast-from-hand' },
  { id: 'flashback' },
  { id: 'phase-track' },
  { id: 'pass' },
  { id: 'pass-turn' },
  { id: 'auto-pass' },
  { id: 'history' },
  { id: 'settings' },
  { id: 'game-menu' },
  { id: 'done', centred: true },
]

const layer = (page: Page) => page.locator('.coach-layer')
const cardOf = (page: Page, id: string) => page.locator(`.coach-card[data-step="${id}"]`)

async function expectOnScreen(page: Page, card: Locator, id: string): Promise<void> {
  const box = await card.boundingBox()
  const view = page.viewportSize()
  expect(box, id).not.toBeNull()
  if (box === null || view === null) return
  expect(box.x, id).toBeGreaterThanOrEqual(0)
  expect(box.y, id).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width, id).toBeLessThanOrEqual(view.width)
  expect(box.y + box.height, id).toBeLessThanOrEqual(view.height)
}

/** The ring sits round `target`. */
async function expectSpotlit(page: Page, target: Locator, id: string): Promise<void> {
  const ring = await page.locator('.coach-ring').boundingBox()
  const box = await target.boundingBox()
  expect(ring, id).not.toBeNull()
  expect(box, id).not.toBeNull()
  if (ring === null || box === null) return
  const cx = box.x + box.width / 2
  // A hand card runs off the bottom of the screen.
  const cy = Math.min(box.y + box.height / 2, (page.viewportSize()?.height ?? 0) - 1)
  expect(cx, id).toBeGreaterThan(ring.x)
  expect(cx, id).toBeLessThan(ring.x + ring.width)
  expect(cy, id).toBeGreaterThan(ring.y)
  expect(cy, id).toBeLessThan(ring.y + ring.height)
}

/** Card `id` open, settled, anchored (or centred) and on screen, at every
 * size when screenshots are asked for. */
async function expectCard(page: Page, id: string, centred: boolean, n: number): Promise<Locator> {
  const card = cardOf(page, id)
  await expect(card, `card ${id}`).toBeVisible({ timeout: 60_000 })
  await expect(page.locator('.ts-acting'), `card ${id}: the board settles`).not.toHaveText('Resolving…', { timeout: 30_000 })
  await expect(layer(page), `card ${id}'s anchor`).toHaveAttribute('data-phase', centred ? 'center' : 'anchored')
  await expectOnScreen(page, card, id)
  if (SHOTS) {
    mkdirSync(SHOTS, { recursive: true })
    for (const size of SIZES) {
      await page.setViewportSize(size)
      await page.waitForTimeout(700)
      await expect(layer(page), `card ${id}'s anchor at ${size.width}x${size.height}`).toHaveAttribute(
        'data-phase',
        centred ? 'center' : 'anchored',
      )
      await expectOnScreen(page, card, `${id} at ${size.width}x${size.height}`)
      await page.screenshot({ path: join(SHOTS, `board-${String(n).padStart(2, '0')}-${id}-${size.width}x${size.height}.png`) })
    }
    await page.setViewportSize(SIZES[0])
    await page.waitForTimeout(300)
  }
  return card
}

const handCard = (page: Page, name: string) => page.locator('.hand-card', { hasText: name }).first()

test('the site tour hands over to the board tour, which points at every part of the board and casts a flashback', async ({ page }) => {
  test.setTimeout(SHOTS ? 600_000 : 180_000)
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.setViewportSize(SIZES[0])

  // The site tour's last card: Tour the board.
  await page.goto('/')
  await page.locator('[data-tour="help-callout"]').getByRole('button', { name: 'Take the tour' }).click()
  for (let i = 0; i < 20; i += 1) {
    const offer = cardOf(page, 'to-the-board')
    if (await offer.isVisible()) break
    await page.locator('.coach-card .coach-next').click()
  }
  await cardOf(page, 'to-the-board').getByRole('button', { name: 'Tour the board' }).click()
  await expect(page).toHaveURL(/room=[A-Z0-9]{5}/, { timeout: 60_000 })

  for (const [n, { id, centred = false }] of CARDS.entries()) {
    const card = await expectCard(page, id, centred, n + 1)
    switch (id) {
      case 'commander-damage': {
        const chip = page.locator('[data-tour="game-commander-damage"]').first()
        await expect(chip).toContainText('6')
        await expectSpotlit(page, chip, id)
        break
      }
      case 'cast-from-hand':
        await expectSpotlit(page, handCard(page, 'Grizzly Bears'), id)
        await handCard(page, 'Grizzly Bears').click()
        continue
      case 'flashback': {
        const graveyard = page.locator('[data-graveyard-count-of="alice"]')
        await expectSpotlit(page, graveyard, id)
        await graveyard.click()
        const viewer = page.locator('.zone-viewer-overlay')
        await expect(viewer).toBeVisible()
        await viewer.getByRole('button', { name: /^Cast/ }).first().click()
        continue
      }
    }
    await card.getByRole('button', { name: 'Next' }).click()
  }

  // The end card, and the lesson recorded as done; the site tour too.
  await expect(page.locator('.coach-card[data-step="lesson-complete"]')).toBeVisible({ timeout: 30_000 })
  await expect
    .poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem('mtg.tutorials') ?? '{}')))
    .toMatchObject({ tour: { done: true, at: null }, lessons: { 'board-tour': 'done' } })
  expect(errors).toEqual([])
})

test('the "?" menu opens the board tour too', async ({ page }) => {
  await page.goto('/')
  await page.locator('[data-tour="corner-help"]').click()
  await page.getByRole('menuitem', { name: /Tour the board/ }).click()
  await expect(cardOf(page, 'welcome')).toContainText('A practice table', { timeout: 60_000 })
})
