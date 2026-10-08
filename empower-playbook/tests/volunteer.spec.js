import { test, expect } from '@playwright/test'

test.describe('Volunteer', () => {
  test.beforeEach(async ({ page }) => { await page.goto('./#/volunteer') })

  test('hero renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Volunteer')
    await expect(page.locator('.hero-badge')).toBeVisible()
  })

  test('page loads', async ({ page }) => {
    await expect(page.locator('[data-testid="volunteer-home"]')).toBeVisible()
  })

  test('core principles section is present', async ({ page }) => {
    await expect(page.locator('[data-testid="volunteer-home"]')).toContainText('Core Volunteer Principles')
  })

  test('person-first language section is present', async ({ page }) => {
    await expect(page.locator('[data-testid="volunteer-home"]')).toContainText('Person-First Language')
  })

  test('all 6 accordion items are present', async ({ page }) => {
    await expect(page.locator('[data-testid="accordion-physical"]')).toBeVisible()
    await expect(page.locator('[data-testid="accordion-intellectual"]')).toBeVisible()
    await expect(page.locator('[data-testid="accordion-asd"]')).toBeVisible()
    await expect(page.locator('[data-testid="accordion-deaf"]')).toBeVisible()
    await expect(page.locator('[data-testid="accordion-visual"]')).toBeVisible()
    await expect(page.locator('[data-testid="accordion-abi"]')).toBeVisible()
  })

  test('clicking accordion opens it', async ({ page }) => {
    const body = page.locator('[data-testid="accordion-physical"] + .accordion-body')
    await expect(body).not.toHaveClass(/open/)
    await page.click('[data-testid="accordion-physical"]')
    await expect(body).toHaveClass(/open/)
  })

  test('clicking open accordion closes it', async ({ page }) => {
    const body = page.locator('[data-testid="accordion-asd"] + .accordion-body')
    await page.click('[data-testid="accordion-asd"]')
    await expect(body).toHaveClass(/open/)
    await page.click('[data-testid="accordion-asd"]')
    await expect(body).not.toHaveClass(/open/)
  })

  test('opening one accordion closes another', async ({ page }) => {
    await page.click('[data-testid="accordion-physical"]')
    const physBody = page.locator('[data-testid="accordion-physical"] + .accordion-body')
    await expect(physBody).toHaveClass(/open/)
    await page.click('[data-testid="accordion-asd"]')
    await expect(physBody).not.toHaveClass(/open/)
  })
})
