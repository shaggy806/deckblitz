import { devices, expect, test } from '@playwright/test'
import type { APIRequestContext, Browser, BrowserContextOptions, CDPSession, Page } from '@playwright/test'

// Reading a card on the board by touch (`src/ui/useHoverPopover.ts`). A
// mouse reads a permanent by resting on it; a finger has no hover. By touch
// a tap opens the card after whatever the tap did, a long press opens it and
// does nothing else, and while a decision is picking from the board a tap on
// one of its candidates answers and opens nothing. The card and the menu of
// a permanent's abilities are a finger's size however small the page is
// drawn (docs/client-gaps.md, "A touch view for phones and tablets").

const CONTROL = `http://127.0.0.1:${process.env.E2E_CONTROL_PORT ?? 4099}`

/** A page on a device of its own, and a way to hold a finger down on it. */
async function devicePage(
  browser: Browser,
  baseURL: string | undefined,
  options: BrowserContextOptions,
): Promise<{ page: Page; cdp: CDPSession }> {
  const context = await browser.newContext({ ...options, baseURL, deviceScaleFactor: 1 })
  const page = await context.newPage()
  return { page, cdp: await context.newCDPSession(page) }
}

async function seat(page: Page, request: APIRequestContext): Promise<void> {
  const response = await request.post(CONTROL, { data: { op: 'reset', room: 'TWOAA' } })
  expect(response.ok()).toBe(true)
  await page.goto('/?room=TWOAA')
  await expect(page.locator('.hand-cards .hand-card')).toHaveCount(7, { timeout: 20_000 })
  await page.waitForTimeout(1000)
}

/** The middle of a permanent's tile: the opponent's first of that name, or
 * (`mine`) this seat's last. */
const tile = (page: Page, name: string, mine: boolean) =>
  page.evaluate(
    ([name, mine]) => {
      const all = [...document.querySelectorAll('.mini-tile-wrap')].filter((w) => w.textContent?.includes(name as string))
      const r = (mine ? all[all.length - 1] : all[0]).getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    },
    [name, mine] as const,
  )

async function longPress(page: Page, cdp: CDPSession, at: { x: number; y: number }): Promise<void> {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: at.x, y: at.y }] })
  await page.waitForTimeout(700)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(300)
}

/** The name on the open popover's card. */
const popoverName = (page: Page) => page.locator('.mini-tile-popover .card-tile').first()

test('a phone showing the desktop page shrunk: cards on the board are read at a finger\'s size', async ({
  browser,
  baseURL,
  request,
}) => {
  const { page, cdp } = await devicePage(browser, baseURL, {
    viewport: { width: 980, height: 1668 },
    screen: { width: 412, height: 701 },
    hasTouch: true,
  })
  await seat(page, request)
  const k = 980 / 412

  // A tap on your own land opens its card and its abilities, and taps
  // nothing for mana.
  await page.touchscreen.tap(...(Object.values(await tile(page, 'Forest', true)) as [number, number]))
  await expect(popoverName(page)).toContainText('Forest')
  await expect(page.locator('.ability-menu')).toBeVisible()
  const sizes = await page.evaluate(() => {
    const card = document.querySelector('.mini-tile-popover .card-tile')!.getBoundingClientRect()
    const button = document.querySelector('.ability-menu button')!.getBoundingClientRect()
    const row = document.querySelector('.hand-toggle')!.getBoundingClientRect()
    return { card: card.width, cardBottom: card.bottom, button: button.height, rowTop: row.top }
  })
  // 150 of the screen's pixels wide, the menu's button 44 tall, and the card
  // clear of the bottom row's buttons.
  expect(sizes.card / k).toBeGreaterThan(140)
  expect(sizes.button / k).toBeGreaterThanOrEqual(43)
  expect(sizes.cardBottom).toBeLessThanOrEqual(sizes.rowTop)

  // A tap on the card puts it away, and reaches nothing under it.
  const card = await popoverName(page).boundingBox()
  await page.touchscreen.tap(card!.x + card!.width / 2, card!.y + card!.height / 2)
  await expect(page.locator('.mini-tile-popover')).toHaveCount(0)

  // A long press reads and clicks nothing: no menu of abilities.
  await page.touchscreen.tap(600, 60)
  await expect(page.locator('.ability-menu')).toHaveCount(0)
  await longPress(page, cdp, await tile(page, 'Forest', true))
  await expect(popoverName(page)).toContainText('Forest')
  await expect(page.locator('.ability-menu')).toHaveCount(0)
  await page.touchscreen.tap(600, 60)
  await expect(page.locator('.mini-tile-popover')).toHaveCount(0)

  // Declaring attackers, a tap on a creature picks it and opens nothing; a
  // long press on another reads it and picks nothing.
  await page.getByRole('button', { name: 'Pass', exact: true }).tap()
  await expect(page.locator('.decision-banner')).toContainText('0 attacking')
  await page.touchscreen.tap(...(Object.values(await tile(page, 'Serra Angel', true)) as [number, number]))
  await expect(page.locator('.decision-banner')).toContainText('1 attacking')
  await expect(page.locator('.mini-tile-popover')).toHaveCount(0)
  await longPress(page, cdp, await tile(page, 'Hill Giant', true))
  await expect(popoverName(page)).toContainText('Hill Giant')
  await expect(page.locator('.decision-banner')).toContainText('1 attacking')
  await page.context().close()
})

test('a tablet: a card read by a long press stays open while the board is redrawn', async ({
  browser,
  baseURL,
  request,
}) => {
  const { defaultBrowserType: _, ...tablet } = devices['iPad Mini landscape']
  const { page, cdp } = await devicePage(browser, baseURL, tablet)
  await seat(page, request)
  // An opponent's creature: nothing to click, so a tap reads it too.
  await page.touchscreen.tap(...(Object.values(await tile(page, 'Craw Wurm', false)) as [number, number]))
  await expect(popoverName(page)).toContainText('Craw Wurm')
  await page.touchscreen.tap(600, 60)
  await expect(page.locator('.mini-tile-popover')).toHaveCount(0)

  // The turn passes to bob, who casts a spell: frames arrive, each a new
  // board, and the card held open is still open.
  await page.getByRole('button', { name: 'Pass turn', exact: true }).tap()
  await longPress(page, cdp, await tile(page, 'Plains', true))
  await expect(popoverName(page)).toContainText('Plains')
  await expect(page.locator('.decision-banner')).toContainText('Diabolic Edict', { timeout: 20_000 })
  await expect(popoverName(page)).toContainText('Plains')
  await page.context().close()
})

test('a mouse still reads a permanent by resting on it', async ({ page, request }) => {
  await seat(page, request)
  const at = await tile(page, 'Craw Wurm', false)
  await page.mouse.move(at.x, at.y)
  await expect(popoverName(page)).toContainText('Craw Wurm')
  // The card takes no pointer there, as ever: a click through it lands on
  // what it covers.
  expect(await popoverName(page).evaluate((el) => getComputedStyle(el.parentElement!).pointerEvents)).toBe('none')
  // And leaving the tile closes it.
  await page.mouse.move(4, 4)
  await expect(page.locator('.mini-tile-popover')).toHaveCount(0)
})
