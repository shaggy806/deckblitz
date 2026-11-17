import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

// An opponent's big reveal (the user's report, 2026-11-17: ten cards off the
// top of a library "happens too quickly"). Every reveal was held for the one
// card's 2.6 s in one unwrapped row at a fixed size: ten cards were gone in
// under four seconds at the default speed, the first and the last cut off at
// the screen's edges. In RVEAL bob casts Mass Polymorph into a stacked library
// and reveals ten; alice, who has nothing to play, watches.

const CONTROL = `http://127.0.0.1:${process.env.E2E_CONTROL_PORT ?? 4099}`

async function control(request: APIRequestContext, body: object): Promise<unknown> {
  const response = await request.post(CONTROL, { data: body })
  expect(response.ok()).toBe(true)
  return response.json()
}

// The quick set runs the first only (its `--grep-invert` drops the others).
const SIZES = [
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
] as const

for (const size of SIZES) {
  test(`an opponent's ten-card reveal is all on screen and stays up to be read, at ${size.width}x${size.height}`, async ({
    page,
    request,
  }) => {
    test.setTimeout(90_000)
    await control(request, { op: 'reset', room: 'RVEAL' })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.setViewportSize(size)
    await page.goto('/?room=RVEAL')
    await expect(page.getByText('room RVEAL')).toBeVisible({ timeout: 20_000 })

    // Alice's turn ends on its own (an empty hand) or by a pass; bob then
    // casts on his first main phase.
    const reveal = page.locator('.reveal-show')
    const pass = page.getByRole('button', { name: 'Pass (space)' })
    await expect(async () => {
      if ((await reveal.count()) === 0 && (await pass.isEnabled().catch(() => false))) await page.keyboard.press('Space')
      await expect(reveal).toHaveCount(1, { timeout: 500 })
    }).toPass({ timeout: 45_000 })
    const shown = Date.now()

    // All ten, each wholly on screen.
    const cards = reveal.locator('.card-tile')
    await expect(cards).toHaveCount(10)
    await expect(reveal.locator('.reveal-caption')).toHaveText(/reveals from their library/i)
    await page.waitForTimeout(600)
    const boxes = await cards.evaluateAll((tiles) =>
      tiles.map((tile) => {
        const b = tile.getBoundingClientRect()
        return { left: b.left, right: b.right, top: b.top, bottom: b.bottom }
      }),
    )
    for (const box of boxes) {
      expect(box.left).toBeGreaterThanOrEqual(0)
      expect(box.top).toBeGreaterThanOrEqual(0)
      expect(box.right).toBeLessThanOrEqual(size.width)
      expect(box.bottom).toBeLessThanOrEqual(size.height)
    }
    // None on top of another.
    const spots = new Set(boxes.map((b) => `${Math.round(b.left)},${Math.round(b.top)}`))
    expect(spots.size).toBe(10)
    await page.screenshot({ path: test.info().outputPath(`reveal-ten-${size.width}x${size.height}.png`) })

    // Still up six seconds in, where it used to be gone in under four, and
    // gone by itself after that: nothing to dismiss.
    await page.waitForTimeout(Math.max(0, 6_000 - (Date.now() - shown)))
    await expect(reveal).toHaveCount(1)
    await expect(reveal).toHaveCount(0, { timeout: 15_000 })
    expect(errors).toEqual([])
  })
}
