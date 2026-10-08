import { test, expect } from '@playwright/test'

test.describe('Programs', () => {
  test.beforeEach(async ({ page }) => { await page.goto('./#/programs') })

  test('hero renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Program')
    await expect(page.locator('.hero-badge')).toContainText('Programs')
  })

  test('page loads (empty state or program list)', async ({ page }) => {
    await expect(page.locator('[data-testid="programs-empty"], [data-testid="programs-home"]')).toBeVisible({ timeout: 10000 })
  })

  test('create button is present', async ({ page }) => {
    await expect(page.locator('[data-testid="create-program-btn"]')).toBeVisible({ timeout: 10000 })
  })

  test('clicking create opens wizard step 1', async ({ page }) => {
    await page.click('[data-testid="create-program-btn"]', { timeout: 10000 })
    await expect(page.locator('[data-testid="wizard-step-1"]')).toBeVisible()
  })

  test('wizard step 1 shows all 6 sports', async ({ page }) => {
    await page.click('[data-testid="create-program-btn"]', { timeout: 10000 })
    const step = page.locator('[data-testid="wizard-step-1"]')
    await expect(step).toContainText('Basketball')
    await expect(step).toContainText('Softball')
    await expect(step).toContainText('Football')
    await expect(step).toContainText('Soccer')
    await expect(step).toContainText('Pickleball')
    await expect(step).toContainText('Kickball')
  })

  test('next button disabled until sport is selected', async ({ page }) => {
    await page.click('[data-testid="create-program-btn"]', { timeout: 10000 })
    await page.fill('[data-testid="wizard-step-1"] input[type="text"]', 'Test Program')
    await expect(page.locator('[data-testid="wizard-step-1"] button.btn-wiz-next')).toBeDisabled()
  })

  test('can select sport and enable next', async ({ page }) => {
    await page.click('[data-testid="create-program-btn"]', { timeout: 10000 })
    await page.fill('[data-testid="wizard-step-1"] input[type="text"]', 'Test Program')
    await page.click('[data-testid="sport-card-soccer"]')
    await expect(page.locator('[data-testid="wizard-step-1"] button.btn-wiz-next')).toBeEnabled()
  })

  test('can navigate to step 2', async ({ page }) => {
    await page.click('[data-testid="create-program-btn"]', { timeout: 10000 })
    await page.fill('[data-testid="wizard-step-1"] input[type="text"]', 'Test Program')
    await page.click('[data-testid="sport-card-soccer"]')
    await page.click('[data-testid="wizard-step-1"] button.btn-wiz-next')
    await expect(page.locator('[data-testid="wizard-step-2"]')).toBeVisible()
  })

  test('step 2 shows session stepper', async ({ page }) => {
    await page.click('[data-testid="create-program-btn"]', { timeout: 10000 })
    await page.fill('[data-testid="wizard-step-1"] input[type="text"]', 'Test')
    await page.click('[data-testid="sport-card-basketball"]')
    await page.click('[data-testid="wizard-step-1"] button.btn-wiz-next')
    await expect(page.locator('[data-testid="wizard-step-2"]')).toContainText('Sessions')
  })
})
