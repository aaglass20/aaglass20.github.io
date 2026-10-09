import { test, expect } from '@playwright/test'

test.describe('DrillAdmin', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { window.__EMPOWER_NO_SUPABASE__ = true })
    await page.goto('./#/drill-admin')
  })

  test('hero renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Drill')
    await expect(page.locator('.hero-badge')).toContainText('Drill Management')
  })

  test('page loads with drill-admin-home container', async ({ page }) => {
    await expect(page.locator('[data-testid="drill-admin-home"]')).toBeVisible({ timeout: 10000 })
  })

  test('add drill button is present', async ({ page }) => {
    await expect(page.locator('[data-testid="add-drill-btn"]')).toBeVisible({ timeout: 10000 })
  })

  test('clicking add drill opens form', async ({ page }) => {
    await page.click('[data-testid="add-drill-btn"]', { timeout: 10000 })
    await expect(page.locator('[data-testid="drill-form"]')).toBeVisible()
  })

  test('form has name input and save button', async ({ page }) => {
    await page.click('[data-testid="add-drill-btn"]', { timeout: 10000 })
    await expect(page.locator('[data-testid="drill-form-name"]')).toBeVisible()
    await expect(page.locator('[data-testid="drill-form-save"]')).toBeVisible()
  })

  test('library tab shows drills', async ({ page }) => {
    await expect(page.locator('[data-testid="drill-admin-home"]')).toBeVisible({ timeout: 10000 })
    // Library is default tab — should show drill cards (builtin drills always present)
    await expect(page.locator('.lib-card').first()).toBeVisible({ timeout: 10000 })
  })
})
