import { expect, test, type Page } from '@playwright/test'

// The opening-hand popup's own buttons, on the builder's boards that start
// before the first turn: rule 103.5b's third button (Serum Powder) and rule
// 103.5's floor, where the Mulligan button goes. Both boards are manual checks.

async function playCheck(page: Page, check: string) {
  await page.goto(`/?check=${encodeURIComponent(check)}`)
  await expect(page.locator('.builder-panel .bp-mode')).toHaveText('Playing', { timeout: 30_000 })
  const popup = page.locator('.mulligan-modal')
  await expect(popup).toBeVisible({ timeout: 30_000 })
  return popup
}

test('Serum Powder replaces the hand, and the popup asks again without it', async ({ page }) => {
  test.setTimeout(120_000)
  const popup = await playCheck(page, 'Serum Powder: exile your hand')
  await popup.getByRole('button', { name: /Serum Powder: exile this hand/ }).click({ timeout: 30_000 })
  await expect(popup.getByRole('button', { name: /Serum Powder/ })).toHaveCount(0, { timeout: 30_000 })
  await expect(popup).toContainText('Keep your opening hand?')
  await expect(popup.locator('.hand-card')).toHaveCount(7, { timeout: 30_000 })
  await expect(popup.getByText('Hill Giant').first()).toBeVisible()
  await popup.getByRole('button', { name: 'Keep', exact: true }).click({ timeout: 30_000 })
  await expect(popup).toHaveCount(0, { timeout: 60_000 })
})

test('after seven mulligans the hand can only be kept (a two-player game has no free one)', async ({ page }) => {
  test.setTimeout(240_000)
  const popup = await playCheck(page, 'Mulligan: you can go no further')
  const mulligan = popup.getByRole('button', { name: 'Mulligan', exact: true })
  for (let taken = 1; taken <= 7; taken += 1) {
    await mulligan.click({ timeout: 30_000 })
    await expect(popup).toContainText(`Mulligan #${taken} taken`, { timeout: 30_000 })
  }
  await expect(mulligan).toHaveCount(0)
  await expect(popup.getByRole('button', { name: 'Keep', exact: true })).toBeVisible()
})
