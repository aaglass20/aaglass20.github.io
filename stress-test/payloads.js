/**
 * Stress Test Payloads
 * Shared between CLI runner and browser-based tester
 */
(function (exports) {
  'use strict';

  const PAYLOADS = {
    EMPTY: [
      { name: 'Empty string', value: '' },
      { name: 'Single space', value: ' ' },
      { name: 'Multiple spaces', value: '     ' },
      { name: 'Tab character', value: '\t' },
      { name: 'Newline', value: '\n' },
      { name: 'Carriage return + newline', value: '\r\n' },
      { name: 'Null character', value: '\x00' },
      { name: 'Zero-width space', value: '\u200B' },
      { name: 'Zero-width non-joiner', value: '\u200C\u200D' },
    ],

    BOUNDARY: [
      { name: '1 character', value: 'a' },
      { name: '50 characters', value: 'a'.repeat(50) },
      { name: '100 characters', value: 'a'.repeat(100) },
      { name: '255 characters', value: 'a'.repeat(255) },
      { name: '256 characters', value: 'a'.repeat(256) },
      { name: '500 characters', value: 'a'.repeat(500) },
      { name: '1000 characters', value: 'a'.repeat(1000) },
      { name: '5000 characters', value: 'a'.repeat(5000) },
      { name: '10000 characters', value: 'a'.repeat(10000) },
      { name: '50000 characters', value: 'a'.repeat(50000) },
    ],

    SPECIAL_CHARS: [
      { name: 'Common symbols', value: '!@#$%^&*()_+-=[]{}|;:\'",.<>?/' },
      { name: 'Backtick and tilde', value: '`~' },
      { name: 'Backslashes', value: '\\\\\\' },
      { name: 'Double quotes', value: '"""test"""' },
      { name: 'Single quotes', value: "'''test'''" },
      { name: 'Angle brackets', value: '<<<>>>' },
      { name: 'Pipe characters', value: '|||' },
      { name: 'Mixed special', value: 'test!@#$%test^&*(test)' },
      { name: 'Leading special chars', value: '---test' },
      { name: 'Trailing special chars', value: 'test---' },
    ],

    UNICODE: [
      { name: 'Emoji', value: '\u{1F600}\u{1F4A9}\u{1F680}\u{2764}\u{FE0F}\u{1F923}' },
      { name: 'Chinese characters', value: '\u4F60\u597D\u4E16\u754C' },
      { name: 'Arabic text', value: '\u0645\u0631\u062D\u0628\u0627 \u0628\u0627\u0644\u0639\u0627\u0644\u0645' },
      { name: 'Japanese text', value: '\u3053\u3093\u306B\u3061\u306F\u4E16\u754C' },
      { name: 'Korean text', value: '\uC548\uB155\uD558\uC138\uC694 \uC138\uACC4' },
      { name: 'RTL text', value: '\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645' },
      { name: 'Combining diacriticals', value: 'Z\u0351\u036B\u0343\u036B\u0302\u034Da\u0368l\u036Bg\u0351\u0344\u034Do\u036B' },
      { name: 'Math symbols', value: '\u2200x\u2208\u211D: x\u00B2\u2265\u2070' },
      { name: 'Box drawing', value: '\u250C\u2500\u2500\u2500\u2510\u2502test\u2502\u2514\u2500\u2500\u2500\u2518' },
      { name: 'Emoji sequence', value: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}' },
    ],

    SQL_INJECTION: [
      { name: 'Basic OR injection', value: "' OR '1'='1" },
      { name: 'Comment termination', value: "' OR 1=1--" },
      { name: 'Drop table', value: "'; DROP TABLE users;--" },
      { name: 'Union select', value: "' UNION SELECT * FROM users--" },
      { name: 'Double dash comment', value: 'admin\'--' },
      { name: 'Semicolon injection', value: '1; SELECT * FROM users' },
      { name: 'Batch injection', value: "1'; EXEC xp_cmdshell('dir');--" },
      { name: 'Boolean blind', value: "' AND 1=1--" },
      { name: 'Time-based blind', value: "' AND SLEEP(5)--" },
      { name: 'Hex encoding', value: "' OR 0x50=0x50--" },
      { name: 'Double encoding', value: '%27%20OR%20%271%27%3D%271' },
      { name: 'Null byte injection', value: "admin'\x00" },
    ],

    XSS: [
      { name: 'Basic script tag', value: '<script>alert("XSS")</script>' },
      { name: 'IMG onerror', value: '<img src=x onerror=alert("XSS")>' },
      { name: 'SVG onload', value: '<svg onload=alert("XSS")>' },
      { name: 'Event handler', value: '" onmouseover="alert(\'XSS\')"' },
      { name: 'JavaScript URI', value: 'javascript:alert("XSS")' },
      { name: 'Data URI', value: 'data:text/html,<script>alert("XSS")</script>' },
      { name: 'Encoded script', value: '&#x3C;script&#x3E;alert("XSS")&#x3C;/script&#x3E;' },
      { name: 'Body onload', value: '<body onload=alert("XSS")>' },
      { name: 'Input onfocus', value: '<input onfocus=alert("XSS") autofocus>' },
      { name: 'Iframe injection', value: '<iframe src="javascript:alert(\'XSS\')"></iframe>' },
      { name: 'Style expression', value: '<div style="background:url(javascript:alert(\'XSS\'))">' },
      { name: 'Template literal', value: '${alert("XSS")}' },
      { name: 'Polyglot', value: 'jaVasCript:/*-/*`/*\\`/*\'/*"/**/(/* */oNcliCk=alert() )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert()//>\\x3e' },
    ],

    NUMERIC: [
      { name: 'Zero', value: '0' },
      { name: 'Negative one', value: '-1' },
      { name: 'Large positive', value: '99999999999999999999' },
      { name: 'Large negative', value: '-99999999999999999999' },
      { name: 'Decimal', value: '3.14159265358979323846' },
      { name: 'Scientific notation', value: '1e308' },
      { name: 'NaN string', value: 'NaN' },
      { name: 'Infinity string', value: 'Infinity' },
      { name: 'Negative infinity', value: '-Infinity' },
      { name: 'Hex number', value: '0xDEADBEEF' },
      { name: 'Octal number', value: '0o777' },
      { name: 'Binary number', value: '0b11111111' },
      { name: 'MAX_SAFE_INTEGER+1', value: '9007199254740992' },
    ],

    FORMAT: [
      { name: 'Email-like', value: 'test@test.com' },
      { name: 'Malformed email', value: 'test@@test..com' },
      { name: 'URL-like', value: 'https://example.com' },
      { name: 'Path traversal', value: '../../../etc/passwd' },
      { name: 'Windows path', value: 'C:\\Windows\\System32' },
      { name: 'File URI', value: 'file:///etc/passwd' },
      { name: 'FTP URI', value: 'ftp://anonymous@ftp.example.com' },
      { name: 'JSON string', value: '{"key":"value","nested":{"a":1}}' },
      { name: 'XML string', value: '<?xml version="1.0"?><root><test/></root>' },
      { name: 'HTML entities', value: '&amp;&lt;&gt;&quot;&#039;' },
      { name: 'LDAP injection', value: '*()|&\'' },
      { name: 'Command injection', value: '; ls -la ; echo' },
      { name: 'Template injection', value: '{{7*7}}${7*7}<%= 7*7 %>' },
    ],
  };

  // Helper to get all payloads for a given category or all categories
  PAYLOADS.getByCategory = function (category) {
    if (category && this[category]) {
      return this[category];
    }
    const all = [];
    for (const key of Object.keys(this)) {
      if (Array.isArray(this[key])) {
        all.push(...this[key].map(p => ({ ...p, category: key })));
      }
    }
    return all;
  };

  // Export for both Node.js and browser
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PAYLOADS;
  } else {
    exports.PAYLOADS = PAYLOADS;
  }

})(typeof window !== 'undefined' ? window : global);
