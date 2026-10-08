import { test, expect } from '@playwright/test'

test('home page loads', async ({ page }) => {
  await page.goto('./')
  await expect(page).toHaveTitle(/Empower Sports Playbook/)
  await expect(page.locator('h1')).toContainText('Empower Sports')
})

test('nav is present on home page', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('nav.nav')).toBeVisible()
  await expect(page.locator('nav.nav')).toContainText('Basketball')
  await expect(page.locator('nav.nav')).toContainText('Empower Way')
})

test('basketball page loads via nav', async ({ page }) => {
  await page.goto('./')
  await page.click('nav a:has-text("Basketball")')
  await expect(page.locator('h1')).toContainText('Basketball')
})

test('practice builder wizard step 1 renders', async ({ page }) => {
  await page.goto('./#/practice-builder')
  await expect(page.locator('[data-testid="wizard-step-1"]')).toBeVisible()
  await expect(page.locator('[data-testid="wizard-step-1"]')).toContainText('Soccer')
})

test('programs page renders', async ({ page }) => {
  await page.goto('./#/programs')
  await expect(page.locator('h1')).toContainText('Programs', { timeout: 10000 })
  // empty state or program list — either is valid depending on DB state
  await expect(page.locator('[data-testid="programs-empty"], [data-testid="programs-home"]')).toBeVisible({ timeout: 10000 })
})
