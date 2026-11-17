import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

// A board's tiles glide when they shift (the user, 2026-11-17: it shouldn't be
// "so abrupt"). `Table` remounts with each frame, so when a permanent left,
// everything after it in the row was simply drawn one place along on the next
// board. In ARRWS alice Murders the first of bob's four creatures, and the
// three after it close the gap.

const CONTROL = `http://127.0.0.1:${process.env.E2E_CONTROL_PORT ?? 4099}`

async function control(request: APIRequestContext, body: object): Promise<unknown> {
  const response = await request.post(CONTROL, { data: body })
  expect(response.ok()).toBe(true)
  return response.json()
}

interface Sample {
  readonly left: number
  readonly pointer: string
}

test("a board's tiles glide into the gap a dead creature leaves, taking no pointer on the way", async ({ page, request }) => {
  test.setTimeout(90_000)
  await control(request, { op: 'reset', room: 'ARRWS' })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/?room=ARRWS')
  await expect(page.getByText('room ARRWS')).toBeVisible({ timeout: 20_000 })
  const pass = page.getByRole('button', { name: 'Pass (space)' })
  await expect(pass).toBeEnabled({ timeout: 20_000 })

  const bears = page.locator('.board.opp .mini-tile', { hasText: 'Grizzly Bears' })
  const giant = page.locator('.board.opp .board-entry', { hasText: 'Hill Giant' })
  await expect(bears).toHaveCount(1)
  const from = (await giant.boundingBox())?.x ?? Number.NaN

  // Where the Hill Giant's tile is drawn, every frame from here on.
  await page.evaluate(() => {
    const track: { left: number; pointer: string }[] = []
    ;(window as unknown as { tileTrack: typeof track }).tileTrack = track
    const tick = () => {
      const entry = [...document.querySelectorAll('.board.opp .board-entry')].find((e) =>
        (e.textContent ?? '').includes('Hill Giant'),
      )
      if (entry !== undefined) {
        track.push({ left: entry.getBoundingClientRect().left, pointer: getComputedStyle(entry).pointerEvents })
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })

  // Murder, aimed at the Bears, and passed until it has resolved.
  await page.locator('.hand-card', { hasText: 'Murder' }).locator('.card-tile').first().dispatchEvent('click')
  await bears.first().click()
  await expect(async () => {
    if ((await bears.count()) > 0 && (await pass.isEnabled().catch(() => false))) await page.keyboard.press('Space')
    await expect(bears).toHaveCount(0, { timeout: 300 })
  }).toPass({ timeout: 40_000 })

  // The Giant ends one place to the left…
  await expect.poll(async () => (await giant.boundingBox())?.x ?? Number.NaN, { timeout: 10_000 }).toBeLessThan(from - 50)
  await page.waitForTimeout(1500)
  const to = (await giant.boundingBox())?.x ?? Number.NaN
  expect(to).toBeLessThan(from - 50)

  // …having been drawn on the way there, not only at the two ends, and with
  // no pointer while it moved: a tile sliding under a resting pointer would
  // open its hover card as it passed.
  const track = await page.evaluate(() => (window as unknown as { tileTrack: Sample[] }).tileTrack)
  const onTheWay = track.filter((s) => s.left > to + 2 && s.left < from - 2)
  expect(onTheWay.length).toBeGreaterThan(3)
  expect(onTheWay.every((s) => s.pointer === 'none')).toBe(true)
  // At rest it takes the pointer again.
  expect(await giant.evaluate((entry) => getComputedStyle(entry).pointerEvents)).not.toBe('none')
  expect(errors).toEqual([])
})
