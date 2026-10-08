import { test, expect } from '@playwright/test'

test.describe('EmpowerWay', () => {
  test.beforeEach(async ({ page }) => { await page.goto('./#/empower-way') })

  test('hero renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Empower')
    await expect(page.locator('.hero-badge')).toBeVisible()
  })

  test('page loads', async ({ page }) => {
    await expect(page.locator('[data-testid="empower-way-home"]')).toBeVisible()
  })

  test('has 4 nav cards', async ({ page }) => {
    await expect(page.locator('[data-testid="nav-card-programs"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-card-practice-builder"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-card-drill-admin"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-card-locations"]')).toBeVisible()
  })

  test('card labels are correct', async ({ page }) => {
    await expect(page.locator('[data-testid="empower-way-home"]')).toContainText('Programs')
    await expect(page.locator('[data-testid="empower-way-home"]')).toContainText('Plan Builder')
    await expect(page.locator('[data-testid="empower-way-home"]')).toContainText('Drill Library')
    await expect(page.locator('[data-testid="empower-way-home"]')).toContainText('Locations')
  })

  test('programs card links to /programs', async ({ page }) => {
    const href = await page.locator('[data-testid="nav-card-programs"]').getAttribute('href')
    expect(href).toContain('programs')
  })

  test('plan builder card links to /plan-library', async ({ page }) => {
    const href = await page.locator('[data-testid="nav-card-practice-builder"]').getAttribute('href')
    expect(href).toContain('plan-library')
  })
})
