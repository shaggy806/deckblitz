import { expect, test, type Page } from '@playwright/test'

// The opening-hand popup's own buttons, on the builder's boards that start
// before the first turn: rule 103.5b's third button (Serum Powder), a manual
// check's board. Rule 103.5's floor (after seven mulligans the Mulligan button
// goes) was played here too, seven clicks at ~5 s each; it was dropped on
// 2026-11-14 for speed: the engine's tests hold the rule, and the manual check
// "Mulligan: you can go no further" still plays it.

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
