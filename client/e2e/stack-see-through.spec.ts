import { expect, test } from '@playwright/test'
import type { APIRequestContext, Page } from '@playwright/test'

// The stack seen through (the user's pick, 2026-11-11): at 1366x768 in a
// four-player room the top card covers most of a right-hand board. Holding
// Alt, or the eye tab on the pile, fades it and lets clicks through to the
// board under it; nothing moves. The tab's pin lets go with its stack.

const CONTROL = `http://127.0.0.1:${process.env.E2E_CONTROL_PORT ?? 4099}`

async function control(request: APIRequestContext, body: object): Promise<unknown> {
  const response = await request.post(CONTROL, { data: body })
  expect(response.ok()).toBe(true)
  return response.json()
}

/** What a click at the top card's centre lands on, and where the card is. */
const probe = (page: Page) =>
  page.evaluate(() => {
    const card = document.querySelector('.stack-entry.is-top .stack-card')
    if (card === null) return null
    const r = card.getBoundingClientRect()
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
    return { inStack: hit?.closest('.stack-overlay') !== null, at: [Math.round(r.x), Math.round(r.y)] }
  })

test('the stack fades to show the board under it: Alt held, or its tab pinned', async ({ page, request }) => {
  await control(request, { op: 'reset', room: 'PUTD4' })
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/?room=PUTD4')
  await page.getByRole('button', { name: 'Ready', exact: true }).click()
  await expect(page.locator('.hand-strip')).toBeVisible({ timeout: 20_000 })
  await control(request, { op: 'spawn', room: 'PUTD4', player: 'bob', zone: 'stack', cards: ['The Dawning Archaic'] })
  const pile = page.locator('.stack-overlay')
  const tab = page.getByRole('button', { name: 'See the board under the stack' })
  await expect(tab).toBeVisible({ timeout: 15_000 })
  await page.waitForTimeout(800)
  const shown = await probe(page)
  expect(shown?.inStack).toBe(true)

  // Alt held: faded, clicks go through, the card hasn't moved.
  await page.keyboard.down('Alt')
  await expect(pile).toHaveClass(/see-through/)
  expect(await probe(page)).toEqual({ inStack: false, at: shown?.at })
  await page.keyboard.up('Alt')
  await expect(pile).not.toHaveClass(/see-through/)

  // The tab pins it until pressed again.
  await tab.click()
  await expect(tab).toHaveAttribute('aria-pressed', 'true')
  expect((await probe(page))?.inStack).toBe(false)
  await tab.click()
  await expect(pile).not.toHaveClass(/see-through/)

  // Pinned, then the stack resolves: the next stack starts solid.
  await tab.click()
  await page.getByRole('button', { name: /Resolve stack/ }).click()
  await expect(page.locator('.stack-entry')).toHaveCount(0, { timeout: 20_000 })
  await control(request, { op: 'spawn', room: 'PUTD4', player: 'bob', zone: 'stack', cards: ['Lightning Bolt'] })
  await expect(tab).toBeVisible({ timeout: 15_000 })
  await expect(tab).toHaveAttribute('aria-pressed', 'false')
  await expect(pile).not.toHaveClass(/see-through/)
})
