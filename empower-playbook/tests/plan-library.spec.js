import { test, expect } from '@playwright/test'

test.describe('PlanLibrary', () => {
  test.beforeEach(async ({ page }) => { await page.goto('./#/plan-library') })

  test('hero renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Plans')
    await expect(page.locator('.hero-badge')).toContainText('Plan Management')
  })

  test('page loads (empty state or plan list)', async ({ page }) => {
    await expect(page.locator('[data-testid="plan-library-home"]')).toBeVisible({ timeout: 10000 })
    await expect(
      page.locator('[data-testid="plan-library-empty"], .plan-card').first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('new plan button is present', async ({ page }) => {
    await expect(page.locator('[data-testid="new-plan-btn"]')).toBeVisible({ timeout: 10000 })
  })

  test('clicking new plan navigates to practice-builder', async ({ page }) => {
    await page.click('[data-testid="new-plan-btn"]', { timeout: 10000 })
    await expect(page).toHaveURL(/#\/practice-builder/)
  })
})
