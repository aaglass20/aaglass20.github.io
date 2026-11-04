/* Balance — category definitions + demo seed data */

window.RECURRING_CATS = {
  streaming:  { label: 'Streaming',        icon: '📺' },
  music:      { label: 'Music & audio',    icon: '🎧' },
  phone:      { label: 'Phone',            icon: '📱' },
  internet:   { label: 'Internet & TV',    icon: '🌐' },
  utilities:  { label: 'Utilities',        icon: '💡' },
  insurance:  { label: 'Insurance',        icon: '🛡️' },
  loan:       { label: 'Loans & payoffs',  icon: '🏦' },
  software:   { label: 'Apps & cloud',     icon: '☁️' },
  membership: { label: 'Memberships',      icon: '🏋️' },
  kids:       { label: 'Kids & activities', icon: '⚽' },
  news:       { label: 'News & magazines', icon: '📰' },
  other:      { label: 'Other',            icon: '🔁' },
};

window.SPEND_CATS = {
  restaurants: { label: 'Restaurants',       icon: '🍽️' },
  takeout:     { label: 'Takeout & delivery', icon: '🥡' },
  coffee:      { label: 'Coffee',            icon: '☕' },
  treats:      { label: 'Treats & snacks',   icon: '🍦' },
  beer:        { label: 'Beer & drinks',     icon: '🍺' },
  fun:         { label: 'Entertainment',     icon: '🎟️' },
  impulse:     { label: 'Impulse buys',      icon: '🛍️' },
  other:       { label: 'Other',             icon: '💸' },
};

window.CADENCE = {
  weekly:    { label: 'week',    perMonth: 52 / 12 },
  monthly:   { label: 'month',   perMonth: 1 },
  quarterly: { label: 'quarter', perMonth: 1 / 3 },
  yearly:    { label: 'year',    perMonth: 1 / 12 },
};

window.VERDICTS = {
  keep:   { label: 'Keep',   hint: 'Worth it — no action' },
  review: { label: 'Review', hint: 'Not sure — look at it' },
  rotate: { label: 'Rotate', hint: 'Pause between shows/seasons' },
  cancel: { label: 'Cancel', hint: 'Should go' },
};

/* Demo data — dates are relative to today so the demo always has upcoming events */
window.buildDemoData = function () {
  const t = new Date();
  const d = (days) => { const x = new Date(t); x.setDate(x.getDate() + days); return x.toISOString().slice(0, 10); };
  let n = 0; const id = () => 'demo-' + (++n);
  const recurring = [
    { name: 'Netflix', category: 'streaming', amount: 22.99, prev_amount: 19.99, cadence: 'monthly', anchor_date: d(6), worth: 4, verdict: 'keep',
      justification: 'Family movie night, kids shows', uses: 'Stranger Things, Wednesday, kids cartoons', who: 'Everyone', last_used: d(-1) },
    { name: 'Disney+', category: 'streaming', amount: 15.99, cadence: 'monthly', anchor_date: d(12), worth: 3, verdict: 'rotate',
      justification: 'Marvel + Pixar', uses: 'Waiting on next Marvel series', who: 'Kids', last_used: d(-38), cancel_by: d(10) },
    { name: 'Max', category: 'streaming', amount: 16.99, cadence: 'monthly', anchor_date: d(-9), worth: 2, verdict: 'review',
      justification: '', uses: 'Finished House of the Dragon', who: '', last_used: d(-70) },
    { name: 'Peacock', category: 'streaming', amount: 7.99, cadence: 'monthly', anchor_date: d(3), worth: 2, verdict: 'cancel',
      justification: 'Signed up for one game', uses: 'Sunday Night Football (season ends Jan)', who: 'Me', last_used: d(-20) },
    { name: 'Spotify Family', category: 'music', amount: 19.99, cadence: 'monthly', anchor_date: d(15), worth: 5, verdict: 'keep',
      justification: 'Used daily by everyone', uses: 'Car, workouts, kids playlists', who: 'Everyone', last_used: d(0) },
    { name: 'Verizon (3 lines)', category: 'phone', amount: 185.0, cadence: 'monthly', anchor_date: d(18), worth: 4, verdict: 'review',
      justification: 'Phones', uses: '', who: 'Everyone', promo_end_date: d(25), promo_amount: 210.0,
      notes: 'Autopay discount ends. Shop Visible/Mint?' },
    { name: 'iPhone payoff', category: 'loan', amount: 41.66, cadence: 'monthly', anchor_date: d(18), end_date: d(48), worth: 4, verdict: 'keep',
      justification: 'Device installment — drops off soon', who: 'Me' },
    { name: 'Car insurance', category: 'insurance', amount: 1140.0, cadence: 'yearly', anchor_date: d(22), renewal_date: d(22), worth: 4, verdict: 'review',
      justification: 'Required', notes: 'Get 2 quotes before renewal' },
    { name: 'Comcast internet', category: 'internet', amount: 89.0, cadence: 'monthly', anchor_date: d(-4), worth: 5, verdict: 'keep',
      justification: 'Work from home' },
    { name: 'Planet Fitness', category: 'membership', amount: 24.99, cadence: 'monthly', anchor_date: d(8), worth: 1, verdict: 'cancel',
      justification: 'New year resolution', last_used: d(-120), notes: 'Must cancel in person or certified letter' },
    { name: 'Amazon Prime', category: 'membership', amount: 139.0, cadence: 'yearly', anchor_date: d(140), renewal_date: d(140), worth: 4, verdict: 'keep',
      justification: 'Shipping + Prime Video' },
    { name: 'iCloud 2TB', category: 'software', amount: 9.99, cadence: 'monthly', anchor_date: d(1), worth: 5, verdict: 'keep',
      justification: 'Family photo backup' },
    { name: 'Club soccer dues', category: 'kids', amount: 125.0, cadence: 'monthly', anchor_date: d(26), end_date: d(150), worth: 5, verdict: 'keep',
      justification: 'Season fees — ends after spring' },
    { name: 'Hulu', category: 'streaming', amount: 9.99, cadence: 'monthly', anchor_date: d(-20), status: 'cancelled', cancelled_on: d(-75), worth: 2, verdict: 'cancel',
      justification: 'Cancelled after season finale' },
    { name: 'Paramount+', category: 'streaming', amount: 7.99, cadence: 'monthly', anchor_date: d(-30), status: 'paused', paused_until: d(9), worth: 3, verdict: 'rotate',
      justification: 'Only for Yellowstone', uses: 'Resubscribe when new season drops' },
  ].map(r => ({ id: id(), status: 'active', created_at: d(-200), cancel_url: '', notes: '', uses: '', who: '', ...r }));

  const spendSeed = [
    ['restaurants', 68, 'Olive Garden', 'meh'], ['restaurants', 112, 'Date night', 'yes'], ['takeout', 38, 'DoorDash', 'no'],
    ['takeout', 27, 'Pizza Friday', 'yes'], ['coffee', 6.5, 'Starbucks', 'meh'], ['coffee', 7.25, 'Starbucks', 'no'],
    ['treats', 14, 'Ice cream after game', 'yes'], ['beer', 32, 'Brewery', 'yes'], ['beer', 24, '12-pack', 'meh'],
    ['impulse', 46, 'Target run', 'no'], ['fun', 54, 'Movies', 'yes'], ['treats', 9, 'Gas station snacks', 'no'],
  ];
  const spend = [];
  for (let m = 0; m < 6; m++) {
    spendSeed.forEach(([category, amount, merchant, worth_it], i) => {
      const day = -(m * 30) - ((i * 7 + m * 3) % 28);
      if (day > 0) return;
      const wobble = 1 + (((i + m) % 5) - 2) * 0.08;
      spend.push({ id: id(), spent_on: d(day), category, amount: Math.round(amount * wobble * 100) / 100, merchant, worth_it, note: '', who: '' });
    });
  }
  const targets = { restaurants: 180, takeout: 60, coffee: 25, treats: 30, beer: 50, fun: 80, impulse: 40 };
  return { recurring, spend, targets };
};
