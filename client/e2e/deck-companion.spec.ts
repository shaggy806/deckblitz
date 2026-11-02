import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

// The deck builder's sideboard and a card with companion: a row says whether
// the deck can reveal it (rule 103.2b), and beside a commander the sideboard
// is still there for a companion (702.139d).

async function openWithDeck(page: Page, deck: Record<string, unknown>): Promise<void> {
  await page.addInitScript((d) => {
    window.localStorage.setItem('mtg-engine:decks', JSON.stringify([d]))
    window.localStorage.setItem('mtg-engine:active-deck', JSON.stringify({ kind: 'saved', id: (d as { id: string }).id }))
  }, deck)
  await page.goto('/deck-builder')
  await expect(page.getByTestId('db-sideboard')).toBeVisible({ timeout: 60_000 })
}

test('a companion the deck fulfils is marked, and another sideboard card is not', async ({ page }) => {
  await openWithDeck(page, {
    id: 'companion-test',
    name: 'Companion test',
    commanders: [],
    // Keruga wants mana value 3 or more: Murder has it.
    cards: ['Murder', 'Murder'],
    sideboard: ['Keruga, the Macrosage', 'Lightning Bolt'],
  })
  const side = page.getByTestId('db-sideboard')
  const keruga = side.locator('li', { hasText: 'Keruga' })
  await expect(keruga.locator('.db-companion-mark')).toHaveText('companion')
  // A card with no companion ability says nothing.
  await expect(side.locator('li', { hasText: 'Lightning Bolt' }).locator('.db-companion-mark')).toHaveCount(0)
})

test('the mark says what breaks the condition', async ({ page }) => {
  await openWithDeck(page, {
    id: 'companion-test',
    name: 'Companion test',
    commanders: [],
    cards: ['Grizzly Bears'],
    sideboard: ['Keruga, the Macrosage'],
  })
  const mark = page.getByTestId('db-sideboard').locator('.db-companion-mark')
  await expect(mark).toHaveText('companion: not met')
  await expect(mark).toHaveAttribute('title', /"Grizzly Bears" has mana value 2/)
})

test('a Commander deck keeps its sideboard for a companion, and says so', async ({ page }) => {
  await openWithDeck(page, {
    id: 'companion-test',
    name: 'Companion test',
    commanders: ['Aesi, Tyrant of Gyre Strait'],
    cards: ['Forest'],
    sideboard: ['Keruga, the Macrosage'],
  })
  const side = page.getByTestId('db-sideboard')
  await expect(side).toContainText('only a card with companion comes to the table')
  await expect(side.locator('.db-companion-mark')).toHaveText('companion')
})

test('a companion outside the commander\'s colour identity is marked as not met', async ({ page }) => {
  await openWithDeck(page, {
    id: 'companion-test',
    name: 'Companion test',
    commanders: ['Kaheera, the Orphanguard'],
    cards: ['Forest'],
    sideboard: ['Keruga, the Macrosage'],
  })
  const mark = page.getByTestId('db-sideboard').locator('.db-companion-mark')
  await expect(mark).toHaveText('companion: not met')
  await expect(mark).toHaveAttribute('title', /outside the commander's colour identity/)
})
