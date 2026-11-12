import { expect, test } from '@playwright/test'
import type { APIRequestContext, Page } from '@playwright/test'

// The hand's fan spaces its cards to fit the row (App.tsx's HAND_CARD_GAP).
// The row once took its width from those cards, so any moment it was
// narrower — a resize, a frame with more cards — closed the gaps, the row
// shrank to them and never grew back, down to the overlap floor (a bug
// report, 2026-11-11: "Hand shrunk way too far", SCUTB at 2560x1392).

const CONTROL = `http://127.0.0.1:${process.env.E2E_CONTROL_PORT ?? 4099}`

async function control(request: APIRequestContext, body: object): Promise<void> {
  const response = await request.post(CONTROL, { data: body })
  expect(response.ok()).toBe(true)
}

/** The fan's row width and its cards' spacing. */
const fan = (page: Page) =>
  page.evaluate(() => {
    const row = document.querySelector<HTMLElement>('.hand-cards')
    const second = row?.querySelectorAll<HTMLElement>('.hand-card')[1]
    return { width: row?.clientWidth ?? 0, gap: second?.style.marginLeft ?? '' }
  })

test('the hand keeps its spacing through a resize and back', async ({ page, request }) => {
  await control(request, { op: 'reset', room: 'SCUTB' })
  await page.setViewportSize({ width: 2560, height: 1392 })
  await page.goto('/?room=SCUTB')
  await expect(page.locator('.hand-cards .hand-card')).toHaveCount(7, { timeout: 20_000 })
  await page.waitForTimeout(1000)
  const first = await fan(page)
  for (const size of [
    { width: 1366, height: 768 },
    { width: 1920, height: 1080 },
    { width: 2560, height: 1392 },
  ]) {
    await page.setViewportSize(size)
    await page.waitForTimeout(600)
  }
  // Back where it started: the same width and the same spacing.
  await expect.poll(() => fan(page)).toEqual(first)
  // And that spacing is the fit, not an overlap the row ratcheted into:
  // seven cards across the row's whole width.
  expect(first.width).toBeGreaterThan(1200)
})
