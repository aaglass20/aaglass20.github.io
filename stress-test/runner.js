#!/usr/bin/env node
/**
 * Stress Test Runner - Playwright-based CLI tool
 * Scans a web page for interactive elements and stress tests them
 *
 * Usage: node runner.js <url> [--output results/] [--headed] [--timeout 5000] [--no-reload]
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const PAYLOADS = require('./payloads');

// ── CLI Args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const url = args.find(a => !a.startsWith('--'));
const headed = args.includes('--headed');
const noReload = args.includes('--no-reload');
const timeout = parseInt(args.find(a => a.startsWith('--timeout='))?.split('=')[1] || '5000', 10);
const outputDir = args.find(a => a.startsWith('--output='))?.split('=')[1] || path.join(__dirname, 'results');

if (!url) {
  console.log(`
  Stress Test Runner
  ──────────────────
  Usage: node runner.js <url> [options]

  Options:
    --headed          Run browser in headed mode (visible)
    --no-reload       Skip page reload between tests (faster but may pollute state)
    --timeout=5000    Timeout per test in ms (default: 5000)
    --output=path     Output directory for reports (default: ./results)

  Examples:
    node runner.js https://example.com
    node runner.js https://mysite.com/login --headed --timeout=10000
  `);
  process.exit(0);
}

// ── Page Scanner ──────────────────────────────────────────────────────────────
async function scanPage(page) {
  // Scroll to bottom to trigger lazy-loaded elements
  await autoScroll(page);

  const elements = await page.evaluate(() => {
    function getSelector(el) {
      if (el.id) return '#' + CSS.escape(el.id);
      if (el.name) return `${el.tagName.toLowerCase()}[name="${CSS.escape(el.name)}"]`;

      const parent = el.parentElement;
      if (!parent) return el.tagName.toLowerCase();
      const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
      const index = siblings.indexOf(el);
      const base = el.tagName.toLowerCase();
      if (siblings.length === 1) return getSelector(parent) + ' > ' + base;
      return getSelector(parent) + ' > ' + base + ':nth-of-type(' + (index + 1) + ')';
    }

    function getElementInfo(el) {
      return {
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type') || '',
        name: el.getAttribute('name') || '',
        id: el.id || '',
        placeholder: el.getAttribute('placeholder') || '',
        selector: getSelector(el),
        text: el.textContent?.trim().substring(0, 100) || '',
        href: el.getAttribute('href') || '',
        maxLength: el.getAttribute('maxlength') || '',
        required: el.hasAttribute('required'),
        disabled: el.disabled || false,
        visible: el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0,
      };
    }

    const inputs = Array.from(document.querySelectorAll('input, textarea, select')).map(getElementInfo);
    const buttons = Array.from(document.querySelectorAll('button, [type="submit"], [type="button"], [role="button"]')).map(getElementInfo);
    const links = Array.from(document.querySelectorAll('a[href]')).map(getElementInfo);
    const forms = Array.from(document.querySelectorAll('form')).map(form => ({
      ...getElementInfo(form),
      action: form.getAttribute('action') || '',
      method: form.getAttribute('method') || 'GET',
      inputCount: form.querySelectorAll('input, textarea, select').length,
    }));

    return { inputs, buttons, links, forms };
  });

  // Filter to visible, enabled elements
  elements.inputs = elements.inputs.filter(e => e.visible && !e.disabled);
  elements.buttons = elements.buttons.filter(e => e.visible && !e.disabled);
  elements.links = elements.links.filter(e => e.visible);

  return elements;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight || totalHeight > 20000) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 50);
    });
  });
}

// ── Test Runner ───────────────────────────────────────────────────────────────
class TestRunner {
  constructor(page, targetUrl, options) {
    this.page = page;
    this.targetUrl = targetUrl;
    this.options = options;
    this.results = [];
    this.consoleErrors = [];
    this.pageErrors = [];
    this.dialogMessages = [];

    // Listen for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        this.consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', err => {
      this.pageErrors.push(err.message);
    });
    page.on('dialog', async dialog => {
      this.dialogMessages.push({ type: dialog.type(), message: dialog.message() });
      await dialog.dismiss();
    });
  }

  async reloadPage() {
    if (!this.options.noReload) {
      await this.page.goto(this.targetUrl, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
      await this.page.waitForTimeout(500);
    }
    // Clear error tracking for next test
    this.consoleErrors = [];
    this.pageErrors = [];
    this.dialogMessages = [];
  }

  addResult(elementType, selector, testName, category, payload, status, details, screenshot = null) {
    this.results.push({
      elementType,
      selector,
      testName,
      category,
      payload: typeof payload === 'string' && payload.length > 200 ? payload.substring(0, 200) + `... (${payload.length} chars)` : payload,
      status,
      details,
      screenshot,
      timestamp: new Date().toISOString(),
    });
  }

  async testInputs(inputs) {
    console.log(`\n  Testing ${inputs.length} input(s)...`);

    for (const input of inputs) {
      // Skip file inputs and hidden inputs
      if (input.type === 'file' || input.type === 'hidden') continue;

      const label = input.id || input.name || input.placeholder || input.selector;
      console.log(`    Input: ${label}`);

      const payloads = PAYLOADS.getByCategory();
      let testCount = 0;

      for (const payload of payloads) {
        testCount++;
        process.stdout.write(`\r    [${testCount}/${payloads.length}] ${payload.category}: ${payload.name}                    `);

        await this.reloadPage();

        try {
          const element = await this.page.$(input.selector);
          if (!element) {
            this.addResult('input', input.selector, payload.name, payload.category, payload.value, 'warning', 'Element not found after reload');
            continue;
          }

          // Clear existing value
          await element.click({ timeout: 3000 }).catch(() => {});
          await this.page.keyboard.press('Control+a');
          await this.page.keyboard.press('Backspace');

          // Type payload (use fill for long strings)
          if (payload.value.length > 500) {
            await element.fill(payload.value).catch(async () => {
              await element.type(payload.value.substring(0, 500), { timeout: this.options.timeout });
            });
          } else {
            await element.type(payload.value, { timeout: this.options.timeout }).catch(async () => {
              await element.fill(payload.value);
            });
          }

          // Brief wait to see if anything explodes
          await this.page.waitForTimeout(300);

          // Check for issues
          const issues = [];
          if (this.pageErrors.length > 0) {
            issues.push(`Page errors: ${this.pageErrors.join('; ')}`);
          }
          if (this.consoleErrors.length > 0) {
            issues.push(`Console errors: ${this.consoleErrors.join('; ')}`);
          }
          if (this.dialogMessages.length > 0) {
            issues.push(`Dialogs: ${this.dialogMessages.map(d => `${d.type}: ${d.message}`).join('; ')}`);
          }

          // Check if page is still responsive
          const responsive = await this.page.evaluate(() => document.readyState).catch(() => null);
          if (!responsive) {
            issues.push('Page became unresponsive');
          }

          // Check if we navigated away
          const currentUrl = this.page.url();
          if (currentUrl !== this.targetUrl && !currentUrl.startsWith(this.targetUrl + '#')) {
            issues.push(`Unexpected navigation to: ${currentUrl}`);
          }

          // XSS detection: check if our script executed
          if (payload.category === 'XSS') {
            const xssDetected = await this.page.evaluate(() => {
              return window.__xssTriggered === true;
            }).catch(() => false);
            if (xssDetected) {
              issues.push('XSS payload was executed!');
            }
          }

          const status = issues.length > 0 ? (issues.some(i => i.includes('XSS') || i.includes('unresponsive')) ? 'fail' : 'warning') : 'pass';
          let screenshot = null;
          if (status === 'fail') {
            screenshot = await this.page.screenshot({ encoding: 'base64' }).catch(() => null);
          }

          this.addResult('input', input.selector, payload.name, payload.category, payload.value, status, issues.join(' | ') || 'OK', screenshot);
        } catch (err) {
          this.addResult('input', input.selector, payload.name, payload.category, payload.value, 'warning', `Test error: ${err.message}`);
        }
      }
      console.log(''); // newline after progress
    }
  }

  async testButtons(buttons) {
    console.log(`\n  Testing ${buttons.length} button(s)...`);

    for (const btn of buttons) {
      const label = btn.text || btn.id || btn.selector;
      console.log(`    Button: ${label}`);

      await this.reloadPage();

      try {
        const element = await this.page.$(btn.selector);
        if (!element) {
          this.addResult('button', btn.selector, 'Click', 'INTERACTION', btn.text, 'warning', 'Element not found');
          continue;
        }

        const beforeUrl = this.page.url();

        // Set up navigation detection
        const [response] = await Promise.all([
          this.page.waitForNavigation({ timeout: 3000 }).catch(() => null),
          element.click({ timeout: 3000 }).catch(() => null),
        ]);

        await this.page.waitForTimeout(500);

        const afterUrl = this.page.url();
        const issues = [];
        const details = [];

        if (afterUrl !== beforeUrl) {
          details.push(`Navigated to: ${afterUrl}`);
          // Go back
          await this.page.goBack({ waitUntil: 'networkidle', timeout: 5000 }).catch(() => {});
        }

        if (response && response.status() >= 400) {
          issues.push(`HTTP ${response.status()} response`);
        }

        if (this.pageErrors.length > 0) {
          issues.push(`Page errors: ${this.pageErrors.join('; ')}`);
        }
        if (this.dialogMessages.length > 0) {
          details.push(`Dialogs: ${this.dialogMessages.map(d => `${d.type}: ${d.message}`).join('; ')}`);
        }

        const allDetails = [...details, ...issues].join(' | ') || 'Clicked successfully, no issues';
        const status = issues.length > 0 ? 'warning' : 'pass';
        this.addResult('button', btn.selector, 'Click', 'INTERACTION', btn.text, status, allDetails);
      } catch (err) {
        this.addResult('button', btn.selector, 'Click', 'INTERACTION', btn.text, 'warning', `Error: ${err.message}`);
      }
    }
  }

  async testLinks(links) {
    console.log(`\n  Testing ${links.length} link(s)...`);

    // Deduplicate by href
    const seen = new Set();
    const uniqueLinks = links.filter(l => {
      if (seen.has(l.href)) return false;
      seen.add(l.href);
      return true;
    });

    console.log(`    (${uniqueLinks.length} unique hrefs after dedup)`);

    for (const link of uniqueLinks) {
      const label = link.text || link.href;
      process.stdout.write(`    Link: ${label.substring(0, 60)}...`);

      await this.reloadPage();

      try {
        // Skip javascript: void, mailto:, tel: links
        if (link.href.startsWith('javascript:') || link.href.startsWith('mailto:') || link.href.startsWith('tel:')) {
          this.addResult('link', link.selector, 'Navigate', 'INTERACTION', link.href, 'pass', `Skipped (${link.href.split(':')[0]} link)`);
          console.log(' skipped');
          continue;
        }

        const element = await this.page.$(link.selector);
        if (!element) {
          this.addResult('link', link.selector, 'Navigate', 'INTERACTION', link.href, 'warning', 'Element not found');
          console.log(' not found');
          continue;
        }

        const beforeUrl = this.page.url();

        const [response] = await Promise.all([
          this.page.waitForNavigation({ timeout: 10000 }).catch(() => null),
          element.click({ timeout: 3000 }).catch(() => null),
        ]);

        await this.page.waitForTimeout(300);
        const afterUrl = this.page.url();
        const issues = [];
        const details = [];

        if (response) {
          const status = response.status();
          details.push(`HTTP ${status}`);
          if (status >= 400) {
            issues.push(`Broken link: HTTP ${status}`);
          }
        }

        if (afterUrl !== beforeUrl) {
          details.push(`Navigated to: ${afterUrl}`);
          await this.page.goBack({ waitUntil: 'networkidle', timeout: 5000 }).catch(async () => {
            await this.page.goto(this.targetUrl, { waitUntil: 'networkidle', timeout: 10000 });
          });
        }

        if (this.pageErrors.length > 0) {
          issues.push(`Page errors: ${this.pageErrors.join('; ')}`);
        }

        const status = issues.length > 0 ? 'fail' : 'pass';
        let screenshot = null;
        if (status === 'fail') {
          screenshot = await this.page.screenshot({ encoding: 'base64' }).catch(() => null);
        }

        this.addResult('link', link.selector, 'Navigate', 'INTERACTION', link.href, status, [...details, ...issues].join(' | ') || 'OK', screenshot);
        console.log(status === 'pass' ? ' OK' : ` ${status.toUpperCase()}`);
      } catch (err) {
        this.addResult('link', link.selector, 'Navigate', 'INTERACTION', link.href, 'warning', `Error: ${err.message}`);
        console.log(' error');
      }
    }
  }
}

// ── Report Generator ──────────────────────────────────────────────────────────
function generateReport(url, scanSummary, results) {
  const summary = {
    total: results.length,
    passed: results.filter(r => r.status === 'pass').length,
    failed: results.filter(r => r.status === 'fail').length,
    warnings: results.filter(r => r.status === 'warning').length,
  };

  const report = {
    url,
    timestamp: new Date().toISOString(),
    scanSummary,
    results,
    summary,
  };

  return report;
}

function generateHtmlReport(report) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Stress Test Report - ${report.url}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #e0e0e0; padding: 20px; }
  .container { max-width: 1200px; margin: 0 auto; }
  h1 { color: #52BAD5; margin-bottom: 5px; font-size: 24px; }
  .meta { color: #888; margin-bottom: 20px; font-size: 14px; }
  .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
  .card { padding: 20px; border-radius: 8px; text-align: center; }
  .card h2 { font-size: 36px; margin-bottom: 5px; }
  .card p { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
  .card.total { background: #16213e; color: #52BAD5; }
  .card.pass { background: #0a3d0a; color: #4caf50; }
  .card.fail { background: #3d0a0a; color: #f44336; }
  .card.warn { background: #3d3d0a; color: #ff9800; }
  .scan-summary { background: #16213e; padding: 15px 20px; border-radius: 8px; margin-bottom: 25px; display: flex; gap: 30px; }
  .scan-summary span { font-size: 14px; }
  .scan-summary strong { color: #52BAD5; }
  .filters { margin-bottom: 15px; display: flex; gap: 10px; flex-wrap: wrap; }
  .filters button { padding: 6px 14px; border: 1px solid #333; border-radius: 4px; background: #16213e; color: #e0e0e0; cursor: pointer; font-size: 13px; }
  .filters button.active { background: #52BAD5; color: #1a1a2e; border-color: #52BAD5; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #16213e; padding: 10px; text-align: left; position: sticky; top: 0; }
  td { padding: 8px 10px; border-bottom: 1px solid #2a2a3e; vertical-align: top; max-width: 300px; overflow: hidden; text-overflow: ellipsis; }
  tr:hover { background: #16213e44; }
  .badge { padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
  .badge.pass { background: #4caf5033; color: #4caf50; }
  .badge.fail { background: #f4433633; color: #f44336; }
  .badge.warning { background: #ff980033; color: #ff9800; }
  .payload { font-family: monospace; font-size: 12px; word-break: break-all; max-width: 250px; }
  .details { font-size: 12px; color: #aaa; }
  .screenshot-btn { padding: 2px 6px; font-size: 11px; cursor: pointer; background: #333; color: #ccc; border: 1px solid #555; border-radius: 3px; }
  .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; }
  .modal img { max-width: 90%; max-height: 90%; }
  .modal.open { display: flex; }
</style>
</head>
<body>
<div class="container">
  <h1>Stress Test Report</h1>
  <div class="meta">
    <strong>URL:</strong> ${report.url} &nbsp;|&nbsp;
    <strong>Date:</strong> ${new Date(report.timestamp).toLocaleString()} &nbsp;|&nbsp;
    <strong>Duration:</strong> ${report.duration || 'N/A'}
  </div>

  <div class="cards">
    <div class="card total"><h2>${report.summary.total}</h2><p>Total Tests</p></div>
    <div class="card pass"><h2>${report.summary.passed}</h2><p>Passed</p></div>
    <div class="card fail"><h2>${report.summary.failed}</h2><p>Failed</p></div>
    <div class="card warn"><h2>${report.summary.warnings}</h2><p>Warnings</p></div>
  </div>

  <div class="scan-summary">
    <span><strong>${report.scanSummary.inputs}</strong> Inputs</span>
    <span><strong>${report.scanSummary.buttons}</strong> Buttons</span>
    <span><strong>${report.scanSummary.links}</strong> Links</span>
    <span><strong>${report.scanSummary.forms}</strong> Forms</span>
  </div>

  <div class="filters">
    <button class="active" onclick="filterResults('all')">All</button>
    <button onclick="filterResults('fail')">Failures</button>
    <button onclick="filterResults('warning')">Warnings</button>
    <button onclick="filterResults('pass')">Passed</button>
    <button onclick="filterResults('input')">Inputs</button>
    <button onclick="filterResults('button')">Buttons</button>
    <button onclick="filterResults('link')">Links</button>
  </div>

  <table>
    <thead>
      <tr><th>Type</th><th>Element</th><th>Category</th><th>Test</th><th>Payload</th><th>Status</th><th>Details</th></tr>
    </thead>
    <tbody id="results">
    ${report.results.map((r, i) => `
      <tr class="result-row" data-status="${r.status}" data-type="${r.elementType}">
        <td>${r.elementType}</td>
        <td style="font-family:monospace;font-size:11px;">${escapeHtml(r.selector).substring(0, 50)}</td>
        <td>${r.category || ''}</td>
        <td>${escapeHtml(r.testName)}</td>
        <td class="payload">${escapeHtml(String(r.payload || '').substring(0, 100))}</td>
        <td><span class="badge ${r.status}">${r.status}</span></td>
        <td class="details">${escapeHtml(r.details || '')}${r.screenshot ? ` <button class="screenshot-btn" onclick="showScreenshot(${i})">📷</button>` : ''}</td>
      </tr>
    `).join('')}
    </tbody>
  </table>
</div>

<div class="modal" id="modal" onclick="this.classList.remove('open')">
  <img id="modal-img" src="">
</div>

<script>
const results = ${JSON.stringify(report.results)};
function filterResults(filter) {
  document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.querySelectorAll('.result-row').forEach(row => {
    if (filter === 'all') { row.style.display = ''; return; }
    const matchStatus = row.dataset.status === filter;
    const matchType = row.dataset.type === filter;
    row.style.display = (matchStatus || matchType) ? '' : 'none';
  });
}
function showScreenshot(i) {
  const ss = results[i]?.screenshot;
  if (ss) { document.getElementById('modal-img').src = 'data:image/png;base64,' + ss; document.getElementById('modal').classList.add('open'); }
}
</script>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n  ╔══════════════════════════════════════╗');
  console.log('  ║     Stress Test Runner v1.0          ║');
  console.log('  ╚══════════════════════════════════════╝\n');
  console.log(`  Target: ${url}`);
  console.log(`  Mode: ${headed ? 'Headed' : 'Headless'}`);
  console.log(`  Timeout: ${timeout}ms per test`);
  console.log(`  Reload between tests: ${!noReload}`);

  const startTime = Date.now();

  const browser = await chromium.launch({ headless: !headed });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  // Inject XSS detection
  await page.addInitScript(() => {
    const origAlert = window.alert;
    window.alert = function () { window.__xssTriggered = true; origAlert.apply(this, arguments); };
  });

  // ── Phase 1: Scan ──────────────────────────────────────────────────────────
  console.log('\n  Phase 1: Scanning page...');
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch {
    console.log('  Warning: Page did not reach network idle, continuing...');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  }

  const elements = await scanPage(page);
  const scanSummary = {
    inputs: elements.inputs.length,
    buttons: elements.buttons.length,
    links: elements.links.length,
    forms: elements.forms.length,
  };

  console.log('\n  ┌─ Scan Results ───────────────────────');
  console.log(`  │ Inputs:  ${scanSummary.inputs}`);
  elements.inputs.forEach(i => console.log(`  │   • ${i.type || 'text'} ${i.id || i.name || i.placeholder || '(unnamed)'}`));
  console.log(`  │ Buttons: ${scanSummary.buttons}`);
  elements.buttons.forEach(b => console.log(`  │   • ${b.text || b.id || '(unnamed)'}`));
  console.log(`  │ Links:   ${scanSummary.links}`);
  console.log(`  │ Forms:   ${scanSummary.forms}`);
  console.log('  └─────────────────────────────────────\n');

  const totalTests = elements.inputs.length * PAYLOADS.getByCategory().length
    + elements.buttons.length
    + elements.links.length;
  console.log(`  Estimated tests: ~${totalTests}`);

  // ── Phase 2: Run Tests ─────────────────────────────────────────────────────
  console.log('\n  Phase 2: Running stress tests...');
  const runner = new TestRunner(page, url, { noReload, timeout });

  await runner.testInputs(elements.inputs);
  await runner.testButtons(elements.buttons);
  await runner.testLinks(elements.links);

  // ── Phase 3: Report ────────────────────────────────────────────────────────
  const duration = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
  console.log(`\n  Phase 3: Generating report... (${duration})`);

  const report = generateReport(url, scanSummary, runner.results);
  report.duration = duration;

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const jsonPath = path.join(outputDir, `report-${timestamp}.json`);
  const htmlPath = path.join(outputDir, `report-${timestamp}.html`);

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(htmlPath, generateHtmlReport(report));

  console.log('\n  ┌─ Summary ───────────────────────────');
  console.log(`  │ Total:    ${report.summary.total}`);
  console.log(`  │ Passed:   ${report.summary.passed}`);
  console.log(`  │ Failed:   ${report.summary.failed}`);
  console.log(`  │ Warnings: ${report.summary.warnings}`);
  console.log(`  │ Duration: ${duration}`);
  console.log('  ├─────────────────────────────────────');
  console.log(`  │ JSON: ${jsonPath}`);
  console.log(`  │ HTML: ${htmlPath}`);
  console.log('  └─────────────────────────────────────\n');

  if (report.summary.failed > 0) {
    console.log('  ⚠ Failed tests:');
    report.results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`    • [${r.elementType}] ${r.testName}: ${r.details}`);
    });
    console.log('');
  }

  await browser.close();
  process.exit(report.summary.failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('  Fatal error:', err.message);
  process.exit(2);
});
