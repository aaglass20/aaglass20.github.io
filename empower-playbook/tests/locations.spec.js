import { test, expect } from '@playwright/test'

test.describe('Locations', () => {
  test.beforeEach(async ({ page }) => { await page.goto('./#/locations') })

  test('hero renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Location')
    await expect(page.locator('.hero-badge')).toContainText('Locations')
  })

  test('page loads (empty state or location list)', async ({ page }) => {
    await expect(page.locator('[data-testid="locations-empty"], [data-testid="locations-home"]')).toBeVisible({ timeout: 10000 })
  })

  test('add location button is present', async ({ page }) => {
    await expect(page.locator('[data-testid="add-location-btn"]')).toBeVisible({ timeout: 10000 })
  })

  test('clicking add location opens form', async ({ page }) => {
    await page.click('[data-testid="add-location-btn"]', { timeout: 10000 })
    await expect(page.locator('[data-testid="location-form"]')).toBeVisible()
  })

  test('form has name input', async ({ page }) => {
    await page.click('[data-testid="add-location-btn"]', { timeout: 10000 })
    await expect(page.locator('[data-testid="location-form-name"]')).toBeVisible()
  })

  test('save button is present in form', async ({ page }) => {
    await page.click('[data-testid="add-location-btn"]', { timeout: 10000 })
    await expect(page.locator('[data-testid="location-form-save"]')).toBeVisible()
  })

  test('save button disabled until name is entered', async ({ page }) => {
    await page.click('[data-testid="add-location-btn"]', { timeout: 10000 })
    await expect(page.locator('[data-testid="location-form-save"]')).toBeDisabled()
  })

  test('save button enabled after typing name', async ({ page }) => {
    await page.click('[data-testid="add-location-btn"]', { timeout: 10000 })
    await page.fill('[data-testid="location-form-name"]', 'Test Facility')
    await expect(page.locator('[data-testid="location-form-save"]')).toBeEnabled()
  })

  test('can cancel/close form', async ({ page }) => {
    await page.click('[data-testid="add-location-btn"]', { timeout: 10000 })
    await expect(page.locator('[data-testid="location-form"]')).toBeVisible()
    await page.click('.modal-close')
    await expect(page.locator('[data-testid="location-form"]')).not.toBeVisible()
  })
})
