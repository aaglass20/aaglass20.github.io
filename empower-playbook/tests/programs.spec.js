import { test, expect } from '@playwright/test'

test.describe('Programs', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { window.__EMPOWER_NO_SUPABASE__ = true })
    await page.goto('./#/programs')
  })

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

// ── Mocked data: dashboard slide-in + edit overlay ──────────────

const SEEDED_PLAN = {
  id: 'test-plan-prog-1',
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
    steps: [],
  }],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const SEEDED_PROGRAM = {
  id: 'test-prog-1',
  name: 'Test Soccer Program',
  sport: 'soccer',
  sportIcon: '⚽',
  sportName: 'Soccer',
  locationId: null,
  numWeeks: 2,
  groups: ['Youngs'],
  weeks: [
    { weekNum: 1, date: null },
    { weekNum: 2, date: null },
  ],
  plans: { 'w1-Youngs': 'test-plan-prog-1' },
  createdAt: '2026-01-01T00:00:00.000Z',
}

test.describe('Programs — dashboard slide-in & edit overlay (mocked)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(({ plan, program }) => {
      window.__EMPOWER_NO_SUPABASE__ = true
      localStorage.setItem('empowerPlans', JSON.stringify({ [plan.id]: plan }))
      localStorage.setItem('empowerPrograms', JSON.stringify([program]))
    }, { plan: SEEDED_PLAN, program: SEEDED_PROGRAM })
    await page.route(/supabase\.co/, route =>
      route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"offline","code":"503"}' })
    )
    await page.goto('./#/programs')
  })

  test('seeded program card appears on home', async ({ page }) => {
    await expect(page.locator('[data-testid="programs-home"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.progs-grid')).toContainText('Test Soccer Program')
  })

  test('clicking program card opens dashboard slide-in panel', async ({ page }) => {
    await page.locator('.prog-card').click({ timeout: 10000 })
    await expect(page.locator('.view-overlay.open')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('[data-testid="dashboard-view"]')).toBeVisible()
  })

  test('dashboard shows the assigned plan cell', async ({ page }) => {
    await page.locator('.prog-card').click({ timeout: 10000 })
    await expect(page.locator('[data-testid="dashboard-table"]')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('[data-testid="dashboard-table"]')).toContainText('Test Soccer Plan')
  })

  test('clicking plan in dashboard opens plan view panel', async ({ page }) => {
    await page.locator('.prog-card').click({ timeout: 10000 })
    await expect(page.locator('[data-testid="dashboard-view"]')).toBeVisible({ timeout: 5000 })
    await page.locator('.plan-ready').click()
    await expect(page.locator('[data-testid="dashboard-view"] .view-overlay.open')).toBeVisible({ timeout: 3000 })
  })

  test('plan view panel in dashboard shows block name', async ({ page }) => {
    await page.locator('.prog-card').click({ timeout: 10000 })
    await expect(page.locator('[data-testid="dashboard-view"]')).toBeVisible({ timeout: 5000 })
    await page.locator('.plan-ready').click()
    await expect(page.locator('[data-testid="dashboard-view"] .view-panel')).toContainText('Warm Up Lap', { timeout: 3000 })
  })

  test('Edit Plan from dashboard plan view opens pb-overlay', async ({ page }) => {
    await page.locator('.prog-card').click({ timeout: 10000 })
    await expect(page.locator('[data-testid="dashboard-view"]')).toBeVisible({ timeout: 5000 })
    await page.locator('.plan-ready').click()
    await expect(page.locator('[data-testid="dashboard-view"] .view-overlay.open')).toBeVisible({ timeout: 3000 })
    await page.locator('[data-testid="dashboard-view"] .view-btn-edit').click()
    await expect(page.locator('.pb-overlay.open')).toBeVisible({ timeout: 5000 })
  })
})
