import { test, expect } from '@playwright/test'

test.describe('PlanLibrary', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { window.__EMPOWER_NO_SUPABASE__ = true })
    await page.goto('./#/plan-library')
  })


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

// ── Mocked data: view panel + edit overlay ──────────────────────

const SEEDED_PLAN = {
  id: 'test-plan-lib-1',
  name: 'Test Soccer Plan',
  sport: 'soccer',
  sportName: 'Soccer',
  sportIcon: '⚽',
  durationMinutes: 75,
  hasWarmup: true,
  blocks: [{
    type: 'standard',
    name: 'Warm Up Lap',
    icon: '🏃',
    durationMinutes: 10,
    description: 'Jog around the field',
    steps: [{ icon: '▸', text: 'Jog one lap' }],
    why: 'Prepares the body',
    volunteerTip: 'Keep energy high',
  }],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

test.describe('PlanLibrary — view panel & edit overlay (mocked)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((plan) => {
      window.__EMPOWER_NO_SUPABASE__ = true
      localStorage.setItem('empowerPlans', JSON.stringify({ [plan.id]: plan }))
    }, SEEDED_PLAN)
    await page.route(/supabase\.co/, route =>
      route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"offline","code":"503"}' })
    )
    await page.goto('./#/plan-library')
  })

  test('seeded plan card is visible', async ({ page }) => {
    await expect(page.locator('[data-testid="plan-card-test-plan-lib-1"]')).toBeVisible({ timeout: 10000 })
  })

  test('View button opens the slide-in view panel', async ({ page }) => {
    await page.locator('[data-testid="plan-card-test-plan-lib-1"] .view-btn').click({ timeout: 10000 })
    await expect(page.locator('.view-overlay.open')).toBeVisible({ timeout: 3000 })
  })

  test('view panel shows plan name and block name', async ({ page }) => {
    await page.locator('[data-testid="plan-card-test-plan-lib-1"] .view-btn').click({ timeout: 10000 })
    const panel = page.locator('.view-panel')
    await expect(panel).toContainText('Test Soccer Plan')
    await expect(panel).toContainText('Warm Up Lap')
  })

  test('vb-dur badge is inside vb-name-row, not a standalone row', async ({ page }) => {
    await page.locator('[data-testid="plan-card-test-plan-lib-1"] .view-btn').click({ timeout: 10000 })
    const nameRow = page.locator('.view-panel .vb-name-row').first()
    await expect(nameRow).toBeVisible({ timeout: 3000 })
    await expect(nameRow.locator('.vb-dur')).toBeVisible()
    await expect(nameRow.locator('.vb-name')).toContainText('Warm Up Lap')
  })

  test('Edit Plan button in view panel opens pb-overlay', async ({ page }) => {
    await page.locator('[data-testid="plan-card-test-plan-lib-1"] .view-btn').click({ timeout: 10000 })
    await page.locator('.view-panel .view-btn-edit').click({ timeout: 3000 })
    await expect(page.locator('.pb-overlay.open')).toBeVisible({ timeout: 5000 })
  })

  test('pb-overlay shows Close Editor bar with plan name', async ({ page }) => {
    await page.locator('[data-testid="plan-card-test-plan-lib-1"] .view-btn').click({ timeout: 10000 })
    await page.locator('.view-panel .view-btn-edit').click({ timeout: 3000 })
    // Wait for builder to load the plan from localStorage before asserting name
    await expect(page.locator('[data-testid="builder-view"]')).toBeVisible({ timeout: 8000 })
    await expect(page.locator('.pb-overlay-bar')).toBeVisible()
    await expect(page.locator('.btn-pb-overlay-close')).toContainText('Close Editor')
    await expect(page.locator('.pb-overlay-plan-name')).toContainText('Test Soccer Plan')
  })

  test('plan card Edit button opens pb-overlay directly (no view panel needed)', async ({ page }) => {
    await page.locator('[data-testid="plan-card-test-plan-lib-1"] .edit-btn').click({ timeout: 10000 })
    await expect(page.locator('.pb-overlay.open')).toBeVisible({ timeout: 5000 })
  })

  test('Close Editor button dismisses the overlay', async ({ page }) => {
    await page.locator('[data-testid="plan-card-test-plan-lib-1"] .view-btn').click({ timeout: 10000 })
    await page.locator('.view-panel .view-btn-edit').click({ timeout: 3000 })
    // Wait for builder to load before clicking close
    await expect(page.locator('[data-testid="builder-view"]')).toBeVisible({ timeout: 8000 })
    await page.locator('.btn-pb-overlay-close').click()
    await expect(page.locator('.pb-overlay.open')).not.toBeVisible({ timeout: 2000 })
  })
})
