import { test, expect } from '@playwright/test'

test.describe('PracticeBuilder', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { window.__EMPOWER_NO_SUPABASE__ = true })
    await page.goto('./#/practice-builder')
  })

  test('hero renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Practice')
    await expect(page.locator('.hero-badge')).toContainText('Practice Builder')
  })

  test('step 1 renders all 6 sport cards', async ({ page }) => {
    const step = page.locator('[data-testid="wizard-step-1"]')
    await expect(step).toContainText('Basketball')
    await expect(step).toContainText('Softball')
    await expect(step).toContainText('Football')
    await expect(step).toContainText('Soccer')
    await expect(step).toContainText('Pickleball')
    await expect(step).toContainText('Kickball')
  })

  test('next button is disabled until sport selected', async ({ page }) => {
    await expect(page.locator('[data-testid="wizard-next-1"]')).toBeDisabled()
  })

  test('selecting a sport enables next button', async ({ page }) => {
    await page.click('[data-testid="sport-card-soccer"]')
    await expect(page.locator('[data-testid="wizard-next-1"]')).toBeEnabled()
  })

  test('can go to step 2 after selecting sport', async ({ page }) => {
    await page.click('[data-testid="sport-card-basketball"]')
    await page.click('[data-testid="wizard-next-1"]')
    await expect(page.locator('[data-testid="wizard-step-2"]')).toBeVisible()
  })

  test('step 2 shows duration pills including 75 min', async ({ page }) => {
    await page.click('[data-testid="sport-card-soccer"]')
    await page.click('[data-testid="wizard-next-1"]')
    await expect(page.locator('[data-testid="wizard-step-2"]')).toContainText('75')
  })

  test('can navigate back from step 2 to step 1', async ({ page }) => {
    await page.click('[data-testid="sport-card-soccer"]')
    await page.click('[data-testid="wizard-next-1"]')
    await page.click('[data-testid="wizard-back-2"]')
    await expect(page.locator('[data-testid="wizard-step-1"]')).toBeVisible()
  })

  test('can reach step 3 warmup choice', async ({ page }) => {
    await page.click('[data-testid="sport-card-football"]')
    await page.click('[data-testid="wizard-next-1"]')
    await page.click('[data-testid="wizard-next-2"]')
    await expect(page.locator('[data-testid="wizard-step-3"]')).toContainText('warmup')
  })

  test('can reach step 4 summary', async ({ page }) => {
    await page.click('[data-testid="sport-card-pickleball"]')
    await page.click('[data-testid="wizard-next-1"]')
    await page.click('[data-testid="wizard-next-2"]')
    await page.click('[data-testid="wizard-next-3"]')
    const step4 = page.locator('[data-testid="wizard-step-4"]')
    await expect(step4).toBeVisible()
    await expect(step4).toContainText('Pickleball')
  })

  test('can start builder and see builder view', async ({ page }) => {
    await page.click('[data-testid="sport-card-kickball"]')
    await page.click('[data-testid="wizard-next-1"]')
    await page.click('[data-testid="wizard-next-2"]')
    await page.click('[data-testid="wizard-next-3"]')
    await page.click('[data-testid="wizard-next-4"]')
    await expect(page.locator('[data-testid="builder-view"]')).toBeVisible({ timeout: 5000 })
  })

  test('builder shows Add Block button', async ({ page }) => {
    await page.click('[data-testid="sport-card-soccer"]')
    await page.click('[data-testid="wizard-next-1"]')
    await page.click('[data-testid="wizard-next-2"]')
    await page.click('[data-testid="wizard-next-3"]')
    await page.click('[data-testid="wizard-next-4"]')
    await expect(page.locator('[data-testid="add-block-btn"]')).toBeVisible({ timeout: 5000 })
  })

  test('Add Block opens modal', async ({ page }) => {
    await page.click('[data-testid="sport-card-soccer"]')
    await page.click('[data-testid="wizard-next-1"]')
    await page.click('[data-testid="wizard-next-2"]')
    await page.click('[data-testid="wizard-next-3"]')
    await page.click('[data-testid="wizard-next-4"]')
    await page.click('[data-testid="add-block-btn"]', { timeout: 5000 })
    await expect(page.locator('[data-testid="modal-overlay"]')).toBeVisible()
  })
})
