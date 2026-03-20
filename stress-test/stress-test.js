/**
 * Stress Test - Browser-side logic
 * Handles same-origin iframe scanning, test execution, and report rendering
 */

// ── State ─────────────────────────────────────────────────────────────────────
let scannedElements = null;
let testResults = [];
let isRunning = false;

// ── Helpers ───────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function log(msg) {
  const el = document.getElementById('log-output');
  const line = document.createElement('div');
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}

function updateProgress(current, total, text) {
  const pct = Math.round((current / total) * 100);
  const bar = document.getElementById('progress-bar');
  bar.style.width = pct + '%';
  bar.textContent = pct + '%';
  document.getElementById('progress-text').textContent = text;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getSelectedCategories() {
  const map = {
    'cat-empty': 'EMPTY',
    'cat-boundary': 'BOUNDARY',
    'cat-special': 'SPECIAL_CHARS',
    'cat-unicode': 'UNICODE',
    'cat-sql': 'SQL_INJECTION',
    'cat-xss': 'XSS',
    'cat-numeric': 'NUMERIC',
    'cat-format': 'FORMAT',
  };
  const selected = [];
  for (const [id, cat] of Object.entries(map)) {
    if (document.getElementById(id).checked) selected.push(cat);
  }
  return selected;
}

function isSameOrigin(targetUrl) {
  try {
    const target = new URL(targetUrl, window.location.origin);
    return target.origin === window.location.origin;
  } catch {
    return false;
  }
}

// ── Scan ──────────────────────────────────────────────────────────────────────
async function startScan() {
  const urlInput = document.getElementById('target-url').value.trim();
  if (!urlInput) { alert('Please enter a URL'); return; }

  // Resolve relative URLs
  let targetUrl;
  try {
    targetUrl = new URL(urlInput, window.location.origin).href;
  } catch {
    alert('Invalid URL'); return;
  }

  // Check same-origin
  if (!isSameOrigin(targetUrl)) {
    document.getElementById('cross-origin-msg').style.display = 'block';
    document.getElementById('cli-command').textContent =
      `cd stress-test && npm install && node runner.js ${urlInput}`;
    document.getElementById('scan-results').style.display = 'none';
    return;
  }

  document.getElementById('cross-origin-msg').style.display = 'none';
  document.getElementById('scan-btn').disabled = true;
  document.getElementById('scan-btn').textContent = 'Scanning...';

  try {
    const iframe = document.getElementById('test-iframe');
    iframe.style.display = 'block';

    await new Promise((resolve, reject) => {
      iframe.onload = resolve;
      iframe.onerror = reject;
      iframe.src = targetUrl;
      setTimeout(reject, 15000);
    });

    // Wait a bit for JS to render
    await sleep(1000);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    scannedElements = scanIframeDocument(doc, targetUrl);

    displayScanResults(scannedElements);
  } catch (err) {
    alert('Failed to load page: ' + err.message);
  } finally {
    document.getElementById('scan-btn').disabled = false;
    document.getElementById('scan-btn').textContent = 'Scan Page';
  }
}

function scanIframeDocument(doc) {
  function getSelector(el) {
    if (el.id) return '#' + CSS.escape(el.id);
    if (el.getAttribute('name')) return el.tagName.toLowerCase() + '[name="' + CSS.escape(el.getAttribute('name')) + '"]';
    const parent = el.parentElement;
    if (!parent) return el.tagName.toLowerCase();
    const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
    const index = siblings.indexOf(el);
    if (siblings.length === 1) return getSelector(parent) + ' > ' + el.tagName.toLowerCase();
    return getSelector(parent) + ' > ' + el.tagName.toLowerCase() + ':nth-of-type(' + (index + 1) + ')';
  }

  function info(el) {
    return {
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type') || '',
      name: el.getAttribute('name') || '',
      id: el.id || '',
      placeholder: el.getAttribute('placeholder') || '',
      selector: getSelector(el),
      text: (el.textContent || '').trim().substring(0, 100),
      href: el.getAttribute('href') || '',
      maxLength: el.getAttribute('maxlength') || '',
      required: el.hasAttribute('required'),
      disabled: el.disabled || false,
      visible: el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0,
    };
  }

  const inputs = Array.from(doc.querySelectorAll('input, textarea, select'))
    .map(info).filter(e => e.visible && !e.disabled && e.type !== 'hidden' && e.type !== 'file');
  const buttons = Array.from(doc.querySelectorAll('button, [type="submit"], [type="button"], [role="button"]'))
    .map(info).filter(e => e.visible && !e.disabled);
  const links = Array.from(doc.querySelectorAll('a[href]'))
    .map(info).filter(e => e.visible);
  const forms = Array.from(doc.querySelectorAll('form'))
    .map(f => ({ ...info(f), action: f.getAttribute('action') || '', method: f.getAttribute('method') || 'GET', inputCount: f.querySelectorAll('input, textarea, select').length }));

  return { inputs, buttons, links, forms };
}

function displayScanResults(elements) {
  document.getElementById('scan-results').style.display = 'block';
  document.getElementById('count-inputs').textContent = elements.inputs.length;
  document.getElementById('count-buttons').textContent = elements.buttons.length;
  document.getElementById('count-links').textContent = elements.links.length;
  document.getElementById('count-forms').textContent = elements.forms.length;

  const categories = getSelectedCategories();
  let payloadCount = 0;
  categories.forEach(cat => { payloadCount += PAYLOADS[cat].length; });

  const tbody = document.getElementById('plan-body');
  tbody.innerHTML = '';

  elements.inputs.forEach(inp => {
    const label = inp.id || inp.name || inp.placeholder || '(unnamed)';
    tbody.innerHTML += `<tr>
      <td>Input</td>
      <td>${inp.type || 'text'}</td>
      <td class="element-detail">${escapeHtml(label)}</td>
      <td>${payloadCount} payload tests across ${categories.length} categories</td>
    </tr>`;
  });

  elements.buttons.forEach(btn => {
    tbody.innerHTML += `<tr>
      <td>Button</td>
      <td>${btn.tag}</td>
      <td class="element-detail">${escapeHtml(btn.text || btn.id || '(unnamed)')}</td>
      <td>Click interaction test</td>
    </tr>`;
  });

  // Dedupe links
  const seenHrefs = new Set();
  const uniqueLinks = elements.links.filter(l => {
    if (seenHrefs.has(l.href)) return false;
    seenHrefs.add(l.href);
    return true;
  });

  uniqueLinks.forEach(link => {
    tbody.innerHTML += `<tr>
      <td>Link</td>
      <td>a</td>
      <td class="element-detail">${escapeHtml((link.text || link.href).substring(0, 60))}</td>
      <td>Navigation + back test</td>
    </tr>`;
  });

  const totalTests = elements.inputs.length * payloadCount + elements.buttons.length + uniqueLinks.length;
  document.getElementById('estimate-text').textContent =
    `Approximately ${totalTests} tests will be executed. This may take a few minutes.`;
}

// ── Run Tests ─────────────────────────────────────────────────────────────────
async function runTests() {
  if (!scannedElements || isRunning) return;
  isRunning = true;
  testResults = [];

  document.getElementById('run-btn').disabled = true;
  document.getElementById('progress-section').style.display = 'block';
  document.getElementById('results-section').style.display = 'none';
  document.getElementById('log-output').innerHTML = '';

  const categories = getSelectedCategories();
  const payloads = [];
  categories.forEach(cat => {
    PAYLOADS[cat].forEach(p => payloads.push({ ...p, category: cat }));
  });

  const iframe = document.getElementById('test-iframe');
  const targetUrl = document.getElementById('target-url').value.trim();
  const fullUrl = new URL(targetUrl, window.location.origin).href;

  // Deduplicate links
  const seenHrefs = new Set();
  const uniqueLinks = scannedElements.links.filter(l => {
    if (seenHrefs.has(l.href)) return false;
    seenHrefs.add(l.href);
    return true;
  });

  const totalTests = scannedElements.inputs.length * payloads.length
    + scannedElements.buttons.length + uniqueLinks.length;
  let completed = 0;

  // ── Test Inputs ──
  for (const input of scannedElements.inputs) {
    const label = input.id || input.name || input.placeholder || input.selector;

    for (const payload of payloads) {
      completed++;
      updateProgress(completed, totalTests, `Testing input "${label}": ${payload.category} - ${payload.name}`);
      log(`Input [${label}] ${payload.category}: ${payload.name}`);

      try {
        // Reload iframe
        await reloadIframe(iframe, fullUrl);
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        const el = doc.querySelector(input.selector);

        if (!el) {
          addResult('input', input.selector, payload.name, payload.category, payload.value, 'warning', 'Element not found after reload');
          continue;
        }

        // Clear and type
        el.value = '';
        el.focus();

        const errors = [];

        // Listen for errors in iframe
        const errorHandler = (e) => errors.push(e.message || String(e));
        iframe.contentWindow.addEventListener('error', errorHandler);

        // Set value
        el.value = payload.value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));

        // Also try blur to trigger validation
        el.dispatchEvent(new Event('blur', { bubbles: true }));

        await sleep(200);

        iframe.contentWindow.removeEventListener('error', errorHandler);

        // Check page is still functional
        let responsive = true;
        try { doc.readyState; } catch { responsive = false; }

        const issues = [];
        if (errors.length > 0) issues.push('JS errors: ' + errors.join('; '));
        if (!responsive) issues.push('Page became unresponsive');

        const status = issues.length > 0 ? (issues.some(i => i.includes('unresponsive')) ? 'fail' : 'warning') : 'pass';
        addResult('input', input.selector, payload.name, payload.category, payload.value, status, issues.join(' | ') || 'OK');
      } catch (err) {
        addResult('input', input.selector, payload.name, payload.category, payload.value, 'warning', 'Test error: ' + err.message);
      }
    }
  }

  // ── Test Buttons ──
  for (const btn of scannedElements.buttons) {
    completed++;
    const label = btn.text || btn.id || btn.selector;
    updateProgress(completed, totalTests, `Testing button: ${label}`);
    log(`Button: ${label}`);

    try {
      await reloadIframe(iframe, fullUrl);
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const el = doc.querySelector(btn.selector);

      if (!el) {
        addResult('button', btn.selector, 'Click', 'INTERACTION', btn.text, 'warning', 'Element not found');
        continue;
      }

      const beforeUrl = iframe.contentWindow.location.href;
      el.click();
      await sleep(500);

      const afterUrl = iframe.contentWindow.location.href;
      const details = [];
      const issues = [];

      if (afterUrl !== beforeUrl) {
        details.push('Navigated to: ' + afterUrl);
      }

      const status = issues.length > 0 ? 'warning' : 'pass';
      addResult('button', btn.selector, 'Click', 'INTERACTION', btn.text, status,
        [...details, ...issues].join(' | ') || 'Clicked successfully');
    } catch (err) {
      addResult('button', btn.selector, 'Click', 'INTERACTION', btn.text, 'warning', 'Error: ' + err.message);
    }
  }

  // ── Test Links ──
  for (const link of uniqueLinks) {
    completed++;
    const label = link.text || link.href;
    updateProgress(completed, totalTests, `Testing link: ${label.substring(0, 50)}`);
    log(`Link: ${label.substring(0, 60)}`);

    if (link.href.startsWith('javascript:') || link.href.startsWith('mailto:') || link.href.startsWith('tel:')) {
      addResult('link', link.selector, 'Navigate', 'INTERACTION', link.href, 'pass', 'Skipped (' + link.href.split(':')[0] + ' link)');
      continue;
    }

    try {
      await reloadIframe(iframe, fullUrl);
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const el = doc.querySelector(link.selector);

      if (!el) {
        addResult('link', link.selector, 'Navigate', 'INTERACTION', link.href, 'warning', 'Element not found');
        continue;
      }

      // Try navigating
      const beforeUrl = iframe.contentWindow.location.href;
      el.click();
      await sleep(1000);

      let afterUrl;
      try { afterUrl = iframe.contentWindow.location.href; } catch { afterUrl = '(cross-origin)'; }

      const details = [];
      const issues = [];

      if (afterUrl !== beforeUrl) {
        details.push('Navigated to: ' + afterUrl);
      }

      addResult('link', link.selector, 'Navigate', 'INTERACTION', link.href, issues.length > 0 ? 'fail' : 'pass',
        [...details, ...issues].join(' | ') || 'OK');
    } catch (err) {
      addResult('link', link.selector, 'Navigate', 'INTERACTION', link.href, 'warning', 'Error: ' + err.message);
    }
  }

  // Done
  updateProgress(totalTests, totalTests, 'Complete!');
  log('All tests complete.');
  isRunning = false;
  document.getElementById('run-btn').disabled = false;

  displayResults();
}

function addResult(elementType, selector, testName, category, payload, status, details) {
  testResults.push({ elementType, selector, testName, category, payload: typeof payload === 'string' && payload.length > 200 ? payload.substring(0, 200) + '...' : payload, status, details, timestamp: new Date().toISOString() });
}

async function reloadIframe(iframe, url) {
  return new Promise((resolve, reject) => {
    iframe.onload = () => { setTimeout(resolve, 300); };
    iframe.onerror = reject;
    iframe.src = url;
    setTimeout(resolve, 10000); // fallback timeout
  });
}

// ── Display Results ───────────────────────────────────────────────────────────
function displayResults(results) {
  const data = results || testResults;
  document.getElementById('results-section').style.display = 'block';

  const total = data.length;
  const passed = data.filter(r => r.status === 'pass').length;
  const failed = data.filter(r => r.status === 'fail').length;
  const warnings = data.filter(r => r.status === 'warning').length;

  document.getElementById('sum-total').textContent = total;
  document.getElementById('sum-pass').textContent = passed;
  document.getElementById('sum-fail').textContent = failed;
  document.getElementById('sum-warn').textContent = warnings;

  // Build analysis
  buildAnalysis(data);

  // Render table
  const tbody = document.getElementById('results-body');
  tbody.innerHTML = '';
  data.forEach(r => {
    tbody.innerHTML += `<tr class="result-row" data-status="${r.status}" data-type="${r.elementType}">
      <td>${r.elementType}</td>
      <td class="element-detail">${escapeHtml(r.selector).substring(0, 50)}</td>
      <td>${r.category || ''}</td>
      <td>${escapeHtml(r.testName)}</td>
      <td class="payload-cell">${escapeHtml(String(r.payload || '').substring(0, 80))}</td>
      <td><span class="badge badge-${r.status}">${r.status}</span></td>
      <td>${escapeHtml(r.details || '')}</td>
    </tr>`;
  });
}

function buildAnalysis(data) {
  const card = document.getElementById('analysis-card');
  const body = document.getElementById('analysis-body');

  const failed = data.filter(r => r.status === 'fail');
  const warnings = data.filter(r => r.status === 'warning');
  const total = data.length;
  const passRate = total > 0 ? ((data.filter(r => r.status === 'pass').length / total) * 100).toFixed(1) : 0;

  let html = `<p><strong>Pass Rate:</strong> ${passRate}% (${data.filter(r => r.status === 'pass').length}/${total})</p>`;

  if (failed.length > 0) {
    html += `<h6 class="text-danger mt-3">Failures (${failed.length})</h6><ul>`;
    // Group by category
    const byCategory = {};
    failed.forEach(r => {
      const cat = r.category || 'UNKNOWN';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(r);
    });
    for (const [cat, items] of Object.entries(byCategory)) {
      html += `<li><strong>${cat}</strong>: ${items.length} failure(s)`;
      html += `<ul>${items.map(i => `<li>${escapeHtml(i.testName)} on <code>${escapeHtml(i.selector).substring(0, 40)}</code> - ${escapeHtml(i.details)}</li>`).join('')}</ul></li>`;
    }
    html += '</ul>';
  }

  if (warnings.length > 0) {
    html += `<h6 class="text-warning mt-3">Warnings (${warnings.length})</h6>`;
    const byCategory = {};
    warnings.forEach(r => {
      const cat = r.category || 'UNKNOWN';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(r);
    });
    html += '<ul>';
    for (const [cat, items] of Object.entries(byCategory)) {
      html += `<li><strong>${cat}</strong>: ${items.length} warning(s)</li>`;
    }
    html += '</ul>';
  }

  if (failed.length === 0 && warnings.length === 0) {
    html += '<p class="text-success mt-2">All tests passed. No issues detected.</p>';
  }

  // Recommendations
  html += '<h6 class="mt-3">Recommendations</h6><ul>';
  const hasSqlIssues = data.some(r => r.category === 'SQL_INJECTION' && r.status !== 'pass');
  const hasXssIssues = data.some(r => r.category === 'XSS' && r.status !== 'pass');
  const hasBoundaryIssues = data.some(r => r.category === 'BOUNDARY' && r.status !== 'pass');
  const hasLinkIssues = data.some(r => r.elementType === 'link' && r.status === 'fail');

  if (hasSqlIssues) html += '<li>Review input sanitization for SQL injection vectors. Use parameterized queries.</li>';
  if (hasXssIssues) html += '<li>Implement output encoding and Content-Security-Policy headers to mitigate XSS.</li>';
  if (hasBoundaryIssues) html += '<li>Add input length validation (both client and server side) to handle boundary cases.</li>';
  if (hasLinkIssues) html += '<li>Fix broken links identified in the link navigation tests.</li>';
  if (!hasSqlIssues && !hasXssIssues && !hasBoundaryIssues && !hasLinkIssues) {
    html += '<li>Page handled all test payloads gracefully. Consider running with the CLI tool for deeper testing.</li>';
  }
  html += '</ul>';

  body.innerHTML = html;
  card.style.display = 'block';
}

// ── Filters ───────────────────────────────────────────────────────────────────
function filterResults(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.querySelectorAll('.result-row').forEach(row => {
    if (filter === 'all') { row.style.display = ''; return; }
    const matchStatus = row.dataset.status === filter;
    const matchType = row.dataset.type === filter;
    row.style.display = (matchStatus || matchType) ? '' : 'none';
  });
}

// ── Load Report ───────────────────────────────────────────────────────────────
function loadReport(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const report = JSON.parse(e.target.result);

      // Update label
      input.nextElementSibling.textContent = file.name;

      // Display scan summary if available
      if (report.scanSummary) {
        document.getElementById('scan-results').style.display = 'block';
        document.getElementById('count-inputs').textContent = report.scanSummary.inputs || 0;
        document.getElementById('count-buttons').textContent = report.scanSummary.buttons || 0;
        document.getElementById('count-links').textContent = report.scanSummary.links || 0;
        document.getElementById('count-forms').textContent = report.scanSummary.forms || 0;
        document.getElementById('plan-body').innerHTML = '<tr><td colspan="4" class="text-muted">Loaded from CLI report</td></tr>';
        document.getElementById('run-btn').style.display = 'none';
        document.getElementById('estimate-text').textContent = `Report from: ${report.url} | ${report.timestamp} | Duration: ${report.duration || 'N/A'}`;
      }

      // Display results
      testResults = report.results || [];
      displayResults(testResults);
      document.getElementById('progress-section').style.display = 'none';
    } catch (err) {
      alert('Invalid JSON report: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// ── Export ─────────────────────────────────────────────────────────────────────
function exportReport() {
  const report = {
    url: document.getElementById('target-url').value,
    timestamp: new Date().toISOString(),
    scanSummary: scannedElements ? {
      inputs: scannedElements.inputs.length,
      buttons: scannedElements.buttons.length,
      links: scannedElements.links.length,
      forms: scannedElements.forms.length,
    } : null,
    results: testResults,
    summary: {
      total: testResults.length,
      passed: testResults.filter(r => r.status === 'pass').length,
      failed: testResults.filter(r => r.status === 'fail').length,
      warnings: testResults.filter(r => r.status === 'warning').length,
    },
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'stress-test-report-' + new Date().toISOString().substring(0, 19).replace(/[:.]/g, '-') + '.json';
  a.click();
}

function copyCliCommand() {
  const text = document.getElementById('cli-command').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy Command'; }, 2000);
  });
}
