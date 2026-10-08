import { test, expect } from '@playwright/test'

// --- Basketball ---

test.describe('Basketball', () => {
  test.beforeEach(async ({ page }) => { await page.goto('./#/basketball') })

  test('hero renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Basketball')
    await expect(page.locator('.hero-badge')).toContainText('Basketball Program')
  })

  test('drills — default tab shows Individual Dribbling Practice', async ({ page }) => {
    await expect(page.locator('[data-testid="drills-section"]')).toContainText('Individual Dribbling Practice')
  })

  test('drills — Passing tab shows Stationary Partner Passing', async ({ page }) => {
    await page.click('[data-testid="drills-section"] button.tab-btn:has-text("Passing")')
    const drills = page.locator('[data-testid="drills-section"]')
    await expect(drills).toContainText('Stationary Partner Passing')
    await expect(drills).not.toContainText('Individual Dribbling Practice')
  })

  test('plans — Week 1 shows Stationary Partner Passing for Youngs', async ({ page }) => {
    await expect(page.locator('[data-testid="plans-section"]')).toContainText('Stationary Partner Passing')
  })

  test('plans — Week 3 shows Dribbling Hungry Hippos', async ({ page }) => {
    await page.click('[data-testid="plans-section"] button.tab-btn:has-text("Week 3")')
    await expect(page.locator('[data-testid="plans-section"]')).toContainText('Dribbling Hungry Hippos')
  })

  test('equipment renders basketballs and cones', async ({ page }) => {
    await expect(page.locator('.equipment-grid')).toContainText('Basketballs')
    await expect(page.locator('.equipment-grid')).toContainText('Cones')
  })

  test('scrimmage card is present', async ({ page }) => {
    await expect(page.locator('.scrimmage-card')).toContainText('Scrimmage Format')
  })
})

// --- Softball ---

test.describe('Softball', () => {
  test.beforeEach(async ({ page }) => { await page.goto('./#/softball') })

  test('hero renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Softball')
    await expect(page.locator('.hero-badge')).toContainText('Softball Program')
  })

  test('drills — default tab shows Ground Ball', async ({ page }) => {
    await expect(page.locator('[data-testid="drills-section"]')).toContainText('Ground Ball')
  })

  test('drills — Hitting tab shows Tee Hitting with coach tip', async ({ page }) => {
    await page.click('[data-testid="drills-section"] button.tab-btn:has-text("Hitting")')
    const drills = page.locator('[data-testid="drills-section"]')
    await expect(drills).toContainText('Tee Hitting')
    await expect(drills).toContainText('Celebrate every solid hit')
  })

  test('plans — Week 1 shows Partner Catching', async ({ page }) => {
    await expect(page.locator('[data-testid="plans-section"]')).toContainText('Partner Catching')
  })

  test('plans — Week 4 shows Tee Hitting for Youngs', async ({ page }) => {
    await page.click('[data-testid="plans-section"] button.tab-btn:has-text("Week 4")')
    await expect(page.locator('[data-testid="plans-section"]')).toContainText('Tee Hitting')
  })

  test('Experienced tier label appears in plan columns', async ({ page }) => {
    await expect(page.locator('[data-testid="plans-section"]')).toContainText('Experienced')
  })

  test('equipment renders softballs and batting tees', async ({ page }) => {
    await expect(page.locator('.equipment-grid')).toContainText('Softballs')
    await expect(page.locator('.equipment-grid')).toContainText('Batting Tees')
  })
})

// --- Football ---

test.describe('Football', () => {
  test.beforeEach(async ({ page }) => { await page.goto('./#/football') })

  test('hero renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Football')
    await expect(page.locator('.hero-badge')).toContainText('Football Program')
  })

  test('drills — default tab shows QB Throwing Nets', async ({ page }) => {
    await expect(page.locator('[data-testid="drills-section"]')).toContainText('QB Throwing Nets')
  })

  test('drills — Catching tab shows WR Route Running with coach tip', async ({ page }) => {
    await page.click('[data-testid="drills-section"] button.tab-btn:has-text("Catching")')
    const drills = page.locator('[data-testid="drills-section"]')
    await expect(drills).toContainText('WR Route Running')
    await expect(drills).toContainText('end zone celebration')
  })

  test('plans — Week 1 shows WR Route Running for Youngs', async ({ page }) => {
    await expect(page.locator('[data-testid="plans-section"]')).toContainText('WR Route Running')
  })

  test('plans — Week 2 shows Circle Passing', async ({ page }) => {
    await page.click('[data-testid="plans-section"] button.tab-btn:has-text("Week 2")')
    await expect(page.locator('[data-testid="plans-section"]')).toContainText('Circle Passing')
  })

  test('equipment renders footballs and throwing nets', async ({ page }) => {
    await expect(page.locator('.equipment-grid')).toContainText('Footballs')
    await expect(page.locator('.equipment-grid')).toContainText('Throwing Nets')
  })
})

// --- Pickleball ---

test.describe('Pickleball', () => {
  test.beforeEach(async ({ page }) => { await page.goto('./#/pickleball') })

  test('hero renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Pickleball')
    await expect(page.locator('.hero-badge')).toContainText('Pickleball Program')
  })

  test('drills — default tab shows Balloon Drills with coach tip', async ({ page }) => {
    const drills = page.locator('[data-testid="drills-section"]')
    await expect(drills).toContainText('Balloon Drills')
    await expect(drills).toContainText('Balloons are magic')
  })

  test('drills — Serving tab shows Serving Into Buckets', async ({ page }) => {
    await page.click('[data-testid="drills-section"] button.tab-btn:has-text("Serving")')
    await expect(page.locator('[data-testid="drills-section"]')).toContainText('Serving Into Buckets')
  })

  test('plans — Week 1 shows Balloon Drills for Youngs', async ({ page }) => {
    await expect(page.locator('[data-testid="plans-section"]')).toContainText('Balloon Drills')
  })

  test('plans — Week 3 shows Wall Ball', async ({ page }) => {
    await page.click('[data-testid="plans-section"] button.tab-btn:has-text("Week 3")')
    await expect(page.locator('[data-testid="plans-section"]')).toContainText('Wall Ball')
  })

  test('equipment renders pickleballs and paddles', async ({ page }) => {
    await expect(page.locator('.equipment-grid')).toContainText('Pickleballs')
    await expect(page.locator('.equipment-grid')).toContainText('Paddles')
  })
})

// --- Kickball ---

test.describe('Kickball', () => {
  test.beforeEach(async ({ page }) => { await page.goto('./#/kickball') })

  test('hero renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Kickball')
    await expect(page.locator('.hero-badge')).toContainText('Kickball Program')
  })

  test('staggered schedule alert is shown', async ({ page }) => {
    await expect(page.locator('.alert-blue')).toContainText('Staggered Schedule')
    await expect(page.locator('.alert-blue')).toContainText('5:30')
  })

  test('drills — default tab shows Fielding Bucket Drill with coach tip', async ({ page }) => {
    const drills = page.locator('[data-testid="drills-section"]')
    await expect(drills).toContainText('Fielding Bucket Drill')
    await expect(drills).toContainText('bucket is a genius adaptation')
  })

  test('plans — time notes show 5:30 PM and 6:30 PM', async ({ page }) => {
    await expect(page.locator('[data-testid="plans-section"]')).toContainText('5:30 PM')
    await expect(page.locator('[data-testid="plans-section"]')).toContainText('6:30 PM')
  })

  test('scrimmage rules card shows no-strikeouts rule', async ({ page }) => {
    await expect(page.locator('.card-orange')).toContainText('No strikeouts')
  })

  test('equipment renders kickballs and buckets', async ({ page }) => {
    await expect(page.locator('.equipment-grid')).toContainText('Kickballs')
    await expect(page.locator('.equipment-grid')).toContainText('Buckets')
  })
})
