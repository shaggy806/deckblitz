import { expect, test, type APIRequestContext } from '@playwright/test'

// The History popup's log scrolls under a sticky "Log" header. A bug report
// (2026-10-09): once the log filled up, a strip near its top showed the lines
// scrolled past — the header pinned inside the scroll box's padding, 8px
// below its top edge. Lines are cloned in to make it overflow without playing
// a long game; only the layout is under test.

const CONTROL = `http://127.0.0.1:${process.env.E2E_CONTROL_PORT ?? 4099}`

async function control(request: APIRequestContext, body: object): Promise<void> {
  const response = await request.post(CONTROL, { data: body })
  expect(response.ok()).toBe(true)
}

test('a scrolled log shows nothing above its sticky header', async ({ page, request }) => {
  await control(request, { op: 'reset', room: 'TWOAA' })
  await page.goto('/?room=TWOAA')
  await page.getByRole('button', { name: 'Ready', exact: true }).click()
  await page.getByRole('button', { name: 'History', exact: true }).click()
  const box = page.locator('.event-log')
  await expect(box.locator('li').first()).toBeVisible()

  const measured = await box.evaluate((el) => {
    const ul = el.querySelector('ul')
    if (ul === null) return null
    const lines = [...ul.children]
    while (el.scrollHeight <= el.clientHeight * 2) for (const li of lines) ul.appendChild(li.cloneNode(true))
    el.scrollTop = el.scrollHeight / 2
    const inner = el.getBoundingClientRect().top + el.clientTop
    const head = el.querySelector('.event-log-head')?.getBoundingClientRect().top ?? NaN
    // What is drawn just inside the box's top edge.
    const at = document.elementFromPoint(el.getBoundingClientRect().left + 60, inner + 3)
    return { gap: Math.round(head - inner), drawn: at?.closest('.event-log-head') ? 'header' : at?.closest('li') ? 'line' : 'other' }
  })
  expect(measured).toEqual({ gap: 0, drawn: 'header' })
})

// Frames carry only the events the socket hasn't had (`state.eventsFrom`),
// and the client puts the log back together (`net/eventLog.ts`): the History
// must still list the whole game — built from slices across many frames, and
// sent whole again after a reload.
test('the History lists the whole game after many frames, and again after a reload', async ({ page, request }) => {
  await control(request, { op: 'reset', room: 'CASTN' })
  const slices: number[] = []
  page.on('websocket', (ws) =>
    ws.on('framereceived', ({ payload }) => {
      const message = JSON.parse(String(payload)) as { type: string; eventsFrom?: number }
      if (message.type === 'state') slices.push(message.eventsFrom ?? -1)
    }),
  )
  await page.goto('/?room=CASTN')
  await page.getByRole('button', { name: 'Ready', exact: true }).click()
  const pass = page.getByRole('button', { name: 'Pass (space)' })
  await expect(pass).toBeEnabled({ timeout: 20_000 })
  /** The History's lines, each led by its event's number. */
  const history = async (): Promise<string[]> => {
    await page.getByRole('button', { name: 'History', exact: true }).click()
    const lines = page.locator('.event-log li')
    await expect(lines.first()).toBeVisible()
    const text = await lines.allTextContents()
    await page.keyboard.press('Escape')
    await expect(page.locator('.event-log')).toHaveCount(0)
    return text
  }
  const numbers = (lines: readonly string[]): string[] => lines.map((line) => /^\d+/.exec(line)?.[0] ?? line)
  const before = await history()

  // Divination, cast and resolved: a run of frames, each a slice of the log.
  const hand = page.locator('.hand-cards .hand-card')
  const held = await hand.count()
  await page.locator('.hand-cards .hand-card .card-tile', { hasText: 'Divination' }).first().dispatchEvent('click')
  await expect(pass).toBeEnabled({ timeout: 20_000 })
  await pass.click()
  await expect(hand).toHaveCount(held + 1, { timeout: 20_000 })
  await expect(pass).toBeEnabled({ timeout: 20_000 })
  expect(slices[0]).toBe(0)
  expect(slices.filter((from) => from > 0).length).toBeGreaterThanOrEqual(2)

  const after = await history()
  expect(after.length).toBeGreaterThan(before.length)
  // Everything from before is still there, in order, the new lines after it.
  expect(numbers(after).slice(0, before.length)).toEqual(numbers(before))
  expect(after.some((line) => line.includes('Divination'))).toBe(true)

  // A reload: a new socket, sent the whole log at once.
  slices.length = 0
  await page.reload()
  await expect(pass).toBeEnabled({ timeout: 20_000 })
  expect(slices[0]).toBe(0)
  expect(await history()).toEqual(after)
})
