import { devices, expect, test } from '@playwright/test'
import type { APIRequestContext, Browser, BrowserContextOptions, Page } from '@playwright/test'

// A touch device's hand (`src/ui/touch.ts`). A finger has no hover, and a tap
// is the hover and the click at once: on a phone the tap meant to open the
// lowered hand tray raised it and played the card under the finger in the
// same tap (the survey of 2026-11-23, docs/client-gaps.md). By touch the
// lowered tray takes no taps, a button raises and lowers it, and a card is
// picked by one tap and played by the next. A mouse's page has none of it.

const CONTROL = `http://127.0.0.1:${process.env.E2E_CONTROL_PORT ?? 4099}`

/** A page on a device of its own: `test.use` takes neither a device's
 * browser type inside a group nor the screen's size. */
async function devicePage(browser: Browser, baseURL: string | undefined, options: BrowserContextOptions): Promise<Page> {
  const context = await browser.newContext({ ...options, baseURL, deviceScaleFactor: 1 })
  return context.newPage()
}

async function seat(page: Page, request: APIRequestContext): Promise<void> {
  const response = await request.post(CONTROL, { data: { op: 'reset', room: 'TWOAA' } })
  expect(response.ok()).toBe(true)
  await page.goto('/?room=TWOAA')
  await expect(page.locator('.hand-cards .hand-card')).toHaveCount(7, { timeout: 20_000 })
  await page.waitForTimeout(1000)
}

const raised = (page: Page) =>
  page.evaluate(() => document.querySelector('.hand-strip')?.classList.contains('raised') ?? false)

/** The middle of what shows of a hand card's tile, by its place in the fan. */
const cardPoint = (page: Page, index: number) =>
  page.evaluate((i) => {
    const tile = document.querySelectorAll('.hand-cards .hand-card .card-tile')[i]
    const r = tile.getBoundingClientRect()
    const bottom = Math.min(r.bottom, window.innerHeight)
    return { x: r.left + r.width / 2, y: (r.top + bottom) / 2 }
  }, index)

test.describe('a tablet', () => {
  test('the hand opens by its button, and a card is played by a second tap', async ({ browser, baseURL, request }) => {
    const { defaultBrowserType: _, ...tablet } = devices['iPad Mini landscape']
    const page = await devicePage(browser, baseURL, tablet)
    await seat(page, request)
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-touch'))).toBe('wide')

    // A tap on a lowered card does nothing: the tray stays down and the card
    // stays in the hand.
    const lowered = await cardPoint(page, 2)
    await page.touchscreen.tap(lowered.x, lowered.y)
    await page.waitForTimeout(600)
    expect(await raised(page)).toBe(false)
    await expect(page.locator('.hand-cards .hand-card')).toHaveCount(7)
    await expect(page.locator('.touch-picked')).toHaveCount(0)

    // Its button raises it.
    await page.getByRole('button', { name: 'Hand (7)' }).tap()
    await expect.poll(() => raised(page)).toBe(true)

    // The first tap on a card picks it, grown, and plays nothing.
    const card = await cardPoint(page, 2)
    await page.touchscreen.tap(card.x, card.y)
    await expect(page.locator('.hand-cards .hand-card.touch-picked')).toHaveCount(1)
    await page.waitForTimeout(600)
    await expect(page.locator('.hand-cards .hand-card')).toHaveCount(7)
    const grown = await page.evaluate(() => {
      const picked = document.querySelector('.touch-picked .card-tile')?.getBoundingClientRect()
      const other = document.querySelector('.hand-card:not(.touch-picked) .card-tile')?.getBoundingClientRect()
      return (picked?.height ?? 0) / (other?.height ?? 1)
    })
    expect(grown).toBeGreaterThan(1.4)

    // The second tap plays it (a land), and the tray goes down.
    const again = await page.evaluate(() => {
      const r = document.querySelector('.touch-picked .card-tile')!.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    })
    await page.touchscreen.tap(again.x, again.y)
    await expect(page.locator('.hand-cards .hand-card')).toHaveCount(6)
    expect(await raised(page)).toBe(false)
    await expect(page.locator('.touch-picked')).toHaveCount(0)

    // The button lowers it too.
    await page.getByRole('button', { name: 'Hand (6)' }).tap()
    await expect.poll(() => raised(page)).toBe(true)
    await page.getByRole('button', { name: 'Hide hand' }).tap()
    await expect.poll(() => raised(page)).toBe(false)
    await page.context().close()
  })
})

test.describe('a phone showing the desktop page shrunk to fit', () => {
  test('its buttons are a finger wide on the screen, and the page does not scroll', async ({ browser, baseURL, request }) => {
    // Chrome's "Desktop site": the page 980px wide on a screen of 412.
    const page = await devicePage(browser, baseURL, {
      viewport: { width: 980, height: 1668 },
      screen: { width: 412, height: 701 },
      hasTouch: true,
    })
    await seat(page, request)
    const k = 980 / 412
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-touch'))).toBe('narrow')
    expect(
      Number(await page.evaluate(() => document.documentElement.style.getPropertyValue('--touch-k'))),
    ).toBeCloseTo(k, 1)
    for (const name of ['Hand (7)', 'Pass', 'Pass turn']) {
      const box = await page.getByRole('button', { name, exact: true }).boundingBox()
      // 44 of the screen's pixels tall.
      expect(box!.height / k).toBeGreaterThanOrEqual(43)
    }
    const overflow = await page.evaluate(() => ({
      x: document.documentElement.scrollWidth - window.innerWidth,
      y: document.documentElement.scrollHeight - window.innerHeight,
    }))
    expect(overflow.x).toBeLessThanOrEqual(0)
    expect(overflow.y).toBeLessThanOrEqual(0)

    // Raised, the hand's cards are the size in the hand they are on a phone
    // page as wide as its screen (96px there), and stand clear of the row of
    // buttons.
    await page.getByRole('button', { name: 'Hand (7)' }).tap()
    await expect.poll(() => raised(page)).toBe(true)
    await page.waitForTimeout(500)
    const hand = await page.evaluate(() => {
      const tile = document.querySelectorAll<HTMLElement>('.hand-cards .hand-card .card-tile')[3]
      const row = document.querySelector('.hand-toggle')!.getBoundingClientRect()
      return { width: tile.offsetWidth, bottom: tile.getBoundingClientRect().bottom, rowTop: row.top }
    })
    expect(hand.width / k).toBeGreaterThanOrEqual(95)
    expect(hand.bottom).toBeLessThanOrEqual(hand.rowTop + 2)
    await page.context().close()
  })
})

test('a mouse gets none of it', async ({ page, request }) => {
  await seat(page, request)
  expect(await page.evaluate(() => document.documentElement.hasAttribute('data-touch'))).toBe(false)
  await expect(page.locator('.hand-toggle')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Pass (space)' })).toBeVisible()
  // The pointer raises the tray, as ever.
  const card = await cardPoint(page, 3)
  await page.mouse.move(card.x, 760)
  await expect.poll(() => raised(page)).toBe(true)
  await page.mouse.move(card.x, 200)
  await expect.poll(() => raised(page)).toBe(false)
})
