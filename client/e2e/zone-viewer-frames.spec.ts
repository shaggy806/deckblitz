import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

// A bug report (2026-11-11): a graveyard or exile viewer closed whenever
// anything happened — an opponent's spell, a trigger — because it lived in
// `Table`, which remounts on every frame. It lives in `GameScreen` now, and
// reads its cards off each frame's view, so it stays open and shows a card
// arriving while it's up.

const CONTROL = `http://127.0.0.1:${process.env.E2E_CONTROL_PORT ?? 4099}`

async function control(request: APIRequestContext, body: object): Promise<unknown> {
  const response = await request.post(CONTROL, { data: body })
  expect(response.ok()).toBe(true)
  return response.json()
}

test('a graveyard viewer stays open, and current, as a new frame lands', async ({ page, request }) => {
  await control(request, { op: 'reset', room: 'ARRWS' })
  await control(request, { op: 'move', room: 'ARRWS', names: ['Grizzly Bears'], to: 'graveyard' })
  await page.goto('/?room=ARRWS')
  await page.getByRole('button', { name: 'Ready', exact: true }).click()
  await expect(page.locator('.hand-strip')).toBeVisible({ timeout: 20_000 })

  await page.locator('[data-graveyard-count-of="bob"]').click()
  const viewer = page.locator('.zone-viewer-box')
  await expect(viewer.locator('.zone-viewer-head')).toContainText("Bob's graveyard (1)")

  // A new frame: bob's Hill Giant goes to his graveyard.
  await control(request, { op: 'move', room: 'ARRWS', names: ['Hill Giant'], to: 'graveyard' })
  await expect(page.locator('[data-graveyard-count-of="bob"]')).toHaveText(/graveyard 2/, { timeout: 15_000 })
  await expect(viewer.locator('.zone-viewer-head')).toContainText("Bob's graveyard (2)")

  // Closing still closes it.
  await page.keyboard.press('Escape')
  await expect(viewer).toHaveCount(0)
})
