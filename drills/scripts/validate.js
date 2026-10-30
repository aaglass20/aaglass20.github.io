// Validate drill data against RULES.md: required fields, unique ids, valid categories + ages.
// Run: node drills/scripts/validate.js
global.window = {};
const dir = require("path").resolve(__dirname, "..");
require(dir + '/js/sports.js');
const fs = require('fs');
fs.readdirSync(dir + '/data').forEach(f => require(dir + '/data/' + f));
const REQ = ['id','name','altNames','objective','setup','instructions','variations','coachingPoints','equipment','ages','categories'];
let bad = 0;
for (const s of window.SPORTS) {
  const list = window.DRILL_DATA[s.id] || [], ids = new Set();
  for (const d of list) {
    const err = [];
    REQ.forEach(k => d[k] === undefined && err.push('missing ' + k));
    if (ids.has(d.id)) err.push('dup id'); ids.add(d.id);
    (d.categories||[]).forEach(c => !s.categories.includes(c) && err.push('bad cat ' + c));
    (d.ages||[]).forEach(a => !window.AGE_BANDS.includes(a) && err.push('bad age ' + a));
    (d.sportFocus||[]).forEach(f => !window.SPORT_FOCUS.includes(f) && err.push('bad sportFocus ' + f));
    if (err.length) { bad++; console.log(s.id, d.id, err.join('; ')); }
  }
  console.log(s.id, list.length);
}
process.exit(bad ? 1 : 0);
