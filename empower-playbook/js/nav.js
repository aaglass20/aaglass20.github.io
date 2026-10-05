// ============================================================
//  Empower Sports Playbook — Universal Nav
//
//  Usage (place where <nav> would be):
//    <script src="js/nav.js" data-page="soccer"></script>
//
//  data-page values:
//    home, basketball, softball, football, pickleball,
//    soccer, kickball, volunteer, empower-way,
//    programs, locations, practice-builder, plan-library, drill-admin
//
//  Setup sub-pages (programs, locations, practice-builder, etc.) show
//  Empower Way as the active nav item since they live under it.
// ============================================================
(function () {
  var script = document.currentScript;
  var page   = script ? (script.dataset.page || '') : '';

  // Sub-pages that live under Empower Way show it as active
  var parentOf = {
    'programs':         'empower-way',
    'locations':        'empower-way',
    'practice-builder': 'empower-way',
    'plan-library':     'empower-way',
    'drill-admin':      'empower-way',
  };
  var active = parentOf[page] || page;

  var NAV_LINKS = [
    { href: 'index.html',       icon: '🏠', label: 'Home',           id: 'home' },
    { href: 'basketball.html',  icon: '🏀', label: 'Basketball',     id: 'basketball' },
    { href: 'softball.html',    icon: '🥎', label: 'Softball',       id: 'softball' },
    { href: 'football.html',    icon: '🏈', label: 'Football',       id: 'football' },
    { href: 'pickleball.html',  icon: '🏓', label: 'Pickleball',     id: 'pickleball' },
    { href: 'soccer.html',      icon: '⚽', label: 'Soccer',         id: 'soccer' },
    { href: 'kickball.html',    icon: '🔴', label: 'Kickball',       id: 'kickball' },
    { href: 'volunteer.html',   icon: '🤝', label: 'Volunteer Guide', id: 'volunteer' },
    { href: 'empower-way.html', icon: '⚡', label: 'Empower Way',    id: 'empower-way' },
  ];

  var linksHtml = NAV_LINKS.map(function (l) {
    var cls = l.id === active ? ' class="active"' : '';
    return '<a href="' + l.href + '"' + cls + '>' +
           l.icon + ' <span class="link-label">' + l.label + '</span></a>';
  }).join('');

  document.write(
    '<nav class="nav">' +
    '<a href="index.html" class="nav-brand">' +
      '<img src="images/empower-logo.png" alt="Empower Sports" class="nav-brand-logo">' +
    '</a>' +
    '<button class="nav-hamburger" id="navHamburger" aria-expanded="false" aria-label="Toggle menu">' +
      '<span></span><span></span><span></span>' +
    '</button>' +
    '<div class="nav-links">' + linksHtml + '</div>' +
    '</nav>'
  );

  // Hamburger toggle — wired once after DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    var btn   = document.getElementById('navHamburger');
    var links = document.querySelector('.nav-links');
    if (!btn || !links) return;
    btn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open);
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  });
}());
