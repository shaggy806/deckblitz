import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { SITE_TOUR } from '../src/tutorial/tours/site.ts'
import type { Step } from '../src/tutorial/types.ts'

// The site tour (docs/plans/tutorials.md, phase 1): the coach-mark overlay
// walked end to end over the front page, to its last card's offer of the
// board tour (taken in `tutorial-board-tour.spec.ts`). Every step must find
// its `data-tour` anchor: a missing one leaves the layer "waiting" instead
// of "anchored", which fails the walk and names the step.

function pageErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

const layer = (page: Page) => page.locator('.coach-layer')
const cardOf = (page: Page, id: string) => page.locator(`.coach-card[data-step="${id}"]`)

/** The open card sits wholly inside the viewport. */
async function expectOnScreen(page: Page, id: string): Promise<void> {
  const box = await cardOf(page, id).boundingBox()
  const view = page.viewportSize()
  expect(box, id).not.toBeNull()
  if (box === null || view === null) return
  expect(box.x, id).toBeGreaterThanOrEqual(0)
  expect(box.y, id).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width, id).toBeLessThanOrEqual(view.width)
  expect(box.y + box.height, id).toBeLessThanOrEqual(view.height)
}

/** Waits for step `s` to be open and drawn: anchored to its anchor (or a
 * centred card for a step with none) and on-screen. */
async function expectStep(page: Page, s: Step): Promise<void> {
  await expect(cardOf(page, s.id), `step ${s.id}`).toBeVisible({ timeout: 20_000 })
  await expect(layer(page), `step ${s.id}'s anchor`).toHaveAttribute('data-phase', s.anchor ? 'anchored' : 'center')
  await expectOnScreen(page, s.id)
}

/** Does what moves step `s` on: its Next (or Done) button, a real click on
 * its target — which must reach the page through the spotlight — or, on a
 * card with buttons of its own, the quiet one (the last card's Not now). */
async function advanceStep(page: Page, s: Step): Promise<void> {
  if (s.buttons !== undefined) {
    const quiet = s.buttons.find((b) => b.link === true)
    if (quiet === undefined) throw new Error(`step ${s.id}: no quiet button to leave by`)
    await cardOf(page, s.id).getByRole('button', { name: quiet.label }).click()
  } else if (s.advance === 'next') {
    await cardOf(page, s.id).locator('.coach-next').click()
  } else if ('click' in s.advance) {
    await page.locator(s.advance.click).first().click()
  } else {
    throw new Error(`step ${s.id}: the walk can't drive this advance`)
  }
}

/** Walks the whole tour from the first-visit callout (or, once that's gone,
 * the "?" menu), calling `onStep` at each open step before moving on. */
async function walkTour(page: Page, onStep?: (s: Step) => Promise<void>, from: 'callout' | 'menu' = 'callout'): Promise<void> {
  await page.goto('/')
  if (from === 'callout') {
    await page.locator('[data-tour="help-callout"]').getByRole('button', { name: 'Take the tour' }).click()
  } else {
    await page.locator('[data-tour="corner-help"]').click()
    await page.getByRole('menuitem', { name: /Tour the site/ }).click()
  }
  for (const s of SITE_TOUR.steps) {
    await expectStep(page, s)
    if (onStep) await onStep(s)
    await advanceStep(page, s)
  }
  await expect(layer(page)).toHaveCount(0)
}

const progress = (page: Page) =>
  page.evaluate(() => JSON.parse(window.localStorage.getItem('mtg.tutorials') ?? 'null'))

test('the site tour walks the front page to the offer of the board tour, and Not now ends it', async ({ page }) => {
  test.setTimeout(120_000)
  const errors = pageErrors(page)
  await walkTour(page)
  // Not now: still on the front page, the tour recorded as done.
  expect(new URL(page.url()).pathname).toBe('/')
  expect(new URL(page.url()).searchParams.get('room')).toBeNull()
  expect(await progress(page)).toMatchObject({ seenIntro: true, tour: { done: true, at: null } })
  await page.locator('[data-tour="corner-help"]').click()
  await expect(page.getByRole('menuitem', { name: /Replay the site tour.*Done ✓/ })).toBeVisible()
  expect(errors).toEqual([])
})

test('clicks outside the spotlight are blocked, and Escape leaves the tour', async ({ page }) => {
  const errors = pageErrors(page)
  await page.goto('/')
  await page.locator('[data-tour="help-callout"]').getByRole('button', { name: 'Take the tour' }).click()
  await cardOf(page, 'welcome').locator('.coach-next').click()
  await expectStep(page, SITE_TOUR.steps[1])

  // A Next step: Create a game, outside the spotlight (on the blitz button),
  // is under a click-catcher, and a click there makes no room.
  const create = page.locator('[data-tour="landing-create"]')
  const box = await create.boundingBox()
  if (box === null) throw new Error('no Create a game button')
  const at = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.className ?? '', at)
  expect(hit).toContain('coach-block')
  await page.mouse.click(at.x, at.y)
  // Nor does the blitz button itself, under a Next step's spotlight.
  const blitz = await page.locator('[data-tour="landing-blitz"]').boundingBox()
  if (blitz === null) throw new Error('no blitz button')
  await page.mouse.click(blitz.x + blitz.width / 2, blitz.y + blitz.height / 2)
  // Keys meant for the page go nowhere either.
  await page.keyboard.press('Space')
  await page.waitForTimeout(500)
  await expect(page.locator('[data-tour="landing-create"]')).toBeVisible()
  await expect(cardOf(page, 'landing-blitz')).toBeVisible()
  await expect(page.locator('.landing-blitz-paste')).toHaveCount(0)

  // Escape leaves the tour, and forgets its place.
  await page.keyboard.press('Escape')
  await expect(layer(page)).toHaveCount(0)
  expect(await progress(page)).toMatchObject({ tour: { at: null } })
  expect(errors).toEqual([])
})

test('the first-visit callout shows once, beside the "?" button, and never again once dismissed', async ({ page }) => {
  const errors = pageErrors(page)
  await page.goto('/')
  const callout = page.locator('[data-tour="help-callout"]')
  await expect(callout).toBeVisible()
  // It covers none of the page's own actions.
  const c = await callout.boundingBox()
  for (const name of ['landing-blitz', 'landing-create', 'landing-join', 'landing-deck-builder', 'landing-library']) {
    const b = await page.locator(`[data-tour="${name}"]`).boundingBox()
    if (c === null || b === null) throw new Error(`no ${name}`)
    const overlaps = c.x < b.x + b.width && b.x < c.x + c.width && c.y < b.y + b.height && b.y < c.y + c.height
    expect(overlaps, name).toBe(false)
  }
  // Nor does it stop the page being used: a room code types as ever.
  await page.locator('#landing-room-code').fill('AB')
  await expect(page.locator('#landing-room-code')).toHaveValue('AB')

  await callout.getByRole('button', { name: 'Dismiss' }).click()
  await expect(callout).toHaveCount(0)
  await page.reload()
  await expect(page.locator('[data-tour="landing-create"]')).toBeVisible()
  await page.waitForTimeout(300)
  await expect(callout).toHaveCount(0)
  expect(await progress(page)).toMatchObject({ seenIntro: true })
  expect(errors).toEqual([])
})

test('a tour left mid-way picks up where it was, and one left on a stop since removed is dropped', async ({ page }) => {
  const leftAt = (at: string) =>
    page.evaluate(
      (at) => window.localStorage.setItem('mtg.tutorials', JSON.stringify({ seenIntro: true, tour: { done: false, at }, lessons: {} })),
      at,
    )
  await page.goto('/')
  await leftAt('corner-settings')
  await page.reload()
  await expectStep(page, SITE_TOUR.steps.find((s) => s.id === 'corner-settings')!)

  // The library's stops went when the tour was cut down (2026-10-13).
  await leftAt('lib-colors')
  await page.reload()
  await expect(page.locator('[data-tour="landing-create"]')).toBeVisible()
  await page.waitForTimeout(500)
  await expect(layer(page)).toHaveCount(0)
  await expect(page.getByRole('dialog', { name: 'Pick up the tour?' })).toHaveCount(0)
  expect(await progress(page)).toMatchObject({ tour: { at: null } })
})

// The live check's screenshots (not part of the suite): every page of the
// tour, the callout and the "?" menu at the three sizes the UI is checked
// at, into TOUR_SHOTS_DIR.
const SHOTS = process.env.TOUR_SHOTS_DIR
const SIZES = [
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
] as const
const SHOT_STEPS = new Set(SITE_TOUR.steps.map((s) => s.id))

async function shots(page: Page, name: string): Promise<void> {
  for (const size of SIZES) {
    await page.setViewportSize(size)
    await page.waitForTimeout(350)
    await page.screenshot({ path: `${SHOTS}/${name}-${size.width}x${size.height}.png` })
  }
  await page.setViewportSize(SIZES[0])
  await page.waitForTimeout(150)
}

test('screenshots for the live check', async ({ page }) => {
  test.skip(SHOTS === undefined, 'set TOUR_SHOTS_DIR to take them')
  test.setTimeout(300_000)
  await page.goto('/')
  await expect(page.locator('[data-tour="help-callout"]')).toBeVisible()
  await shots(page, '00-callout')
  await page.locator('[data-tour="corner-help"]').click()
  await shots(page, '01-help-menu')
  await page.locator('[data-tour="corner-help"]').click()
  let n = 2
  await walkTour(page, async (s) => {
    if (!SHOT_STEPS.has(s.id)) return
    await shots(page, `${String(n++).padStart(2, '0')}-${s.id}`)
    // Back at the default size, the step must still be drawn where it
    // belongs: the frame loop re-anchors after every resize.
    await expectStep(page, s)
  }, 'menu')
})
