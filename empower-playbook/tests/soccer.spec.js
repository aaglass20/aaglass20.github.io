import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('./#/soccer')
})

test('soccer page renders hero and title', async ({ page }) => {
  await expect(page.locator('h1')).toContainText('Soccer')
  await expect(page.locator('.hero-badge')).toContainText('Soccer Program')
})

test('drills — default tab shows Dribbling Agility with coach tip', async ({ page }) => {
  const drills = page.locator('[data-testid="drills-section"]')
  await expect(drills).toContainText('Dribbling Agility')
  await expect(drills).toContainText('without a ball first')
})

test('drills — Passing tab shows both Passing drills', async ({ page }) => {
  await page.click('[data-testid="drills-section"] button.tab-btn:has-text("Passing")')
  const drills = page.locator('[data-testid="drills-section"]')
  await expect(drills).toContainText('Passing Lines')
  await expect(drills).toContainText('Partner Passing')
  await expect(drills).not.toContainText('Dribbling Agility')
})

test('drills — Shooting tab shows Penalty Shooting with coach tip', async ({ page }) => {
  await page.click('[data-testid="drills-section"] button.tab-btn:has-text("Shooting")')
  const drills = page.locator('[data-testid="drills-section"]')
  await expect(drills).toContainText('Penalty Shooting')
  await expect(drills).toContainText('dramatic')
})

test('drills — Mini Games tab shows Construction Zone and Scrimmage', async ({ page }) => {
  await page.click('[data-testid="drills-section"] button.tab-btn:has-text("Mini Games")')
  const drills = page.locator('[data-testid="drills-section"]')
  await expect(drills).toContainText('Construction Zone')
  await expect(drills).toContainText('Scrimmage')
})

test('plans — default Week 1 shows Partner Passing for Youngs', async ({ page }) => {
  await expect(page.locator('[data-testid="plans-section"]')).toContainText('Partner Passing')
})

test('plans — Week 2 shows Pass to Shot', async ({ page }) => {
  await page.click('[data-testid="plans-section"] button.tab-btn:has-text("Week 2")')
  await expect(page.locator('[data-testid="plans-section"]')).toContainText('Pass to Shot')
})

test('plans — Week 3 shows Passing Lines', async ({ page }) => {
  await page.click('[data-testid="plans-section"] button.tab-btn:has-text("Week 3")')
  await expect(page.locator('[data-testid="plans-section"]')).toContainText('Passing Lines')
  await expect(page.locator('[data-testid="plans-section"]')).toContainText('Penalty Shooting')
})

test('equipment checklist renders soccer balls and cones', async ({ page }) => {
  await expect(page.locator('.equipment-grid')).toContainText('Soccer balls')
  await expect(page.locator('.equipment-grid')).toContainText('Cones')
})

test('scrimmage card is present', async ({ page }) => {
  await expect(page.locator('.scrimmage-card')).toContainText('Scrimmage Format')
  await expect(page.locator('.scrimmage-card')).toContainText('peer volunteers')
})
