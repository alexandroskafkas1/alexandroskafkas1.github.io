/* =========================================================
   Shared site script. Load at the end of <body>:
     <script src="site.js"></script>      (homepage)
     <script src="../site.js"></script>   (pages inside folders)
   1. Moves talks whose date has passed from "Upcoming" to "Past".
   2. Drives the cursor-following background glows.
   ========================================================= */

/* ---- 1. Talks: <li data-date="YYYY-MM-DD"> inside #upcoming-talks ---- */
(function () {
  var upcoming = document.getElementById('upcoming-talks');
  var past = document.getElementById('past-talks');
  if (!upcoming || !past) return;

  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var moved = [];
  Array.prototype.slice.call(upcoming.querySelectorAll('li[data-date]')).forEach(function (li) {
    var p = li.getAttribute('data-date').split('-');
    var day = new Date(+p[0], +p[1] - 1, +p[2]);
    if (day < today) moved.push({ li: li, day: day });
  });
  // newest past talk first
  moved.sort(function (a, b) { return b.day - a.day; });
  moved.forEach(function (m) { past.appendChild(m.li); });

  function toggle(list) {
    var empty = !list.children.length;
    list.hidden = empty;
    var heading = document.querySelector('[data-heading-for="' + list.id + '"]');
    if (heading) heading.hidden = empty;
  }
  toggle(upcoming);
  toggle(past);
})();

/* ---- 2. Background glows that ease toward the pointer ---- */
(function () {
  if (!document.getElementById('field')) return;
  var root = document.documentElement.style;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.5 : 1;
  // each glow eases toward the pointer at its own speed; "m" is the near-instant spotlight
  var blobs = [
    { k: 'm', ease: 0.18,  ox:  0.00, oy:  0.00, x: 0.5, y: 0.4 },
    { k: 'a', ease: 0.050, ox:  0.00, oy:  0.00, x: 0.3, y: 0.3 },
    { k: 'b', ease: 0.030, ox:  0.14, oy: -0.10, x: 0.6, y: 0.5 },
    { k: 'c', ease: 0.018, ox: -0.16, oy:  0.12, x: 0.5, y: 0.7 }
  ];
  var target = { x: 0.5, y: 0.4 }, lastMove = 0;
  function onMove(e) {
    target.x = e.clientX / window.innerWidth;
    target.y = e.clientY / window.innerHeight;
    lastMove = performance.now();
  }
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerdown', onMove, { passive: true });
  function frame(t) {
    var idle = !lastMove || t - lastMove > 2500, tx = target.x, ty = target.y;
    if (idle) { tx = 0.5 + 0.28 * calm * Math.sin(t / 4200); ty = 0.45 + 0.28 * calm * Math.cos(t / 5300); }
    blobs.forEach(function (b, i) {
      var w = b.k === 'm' ? 0 : 0.07 * calm * Math.sin(t / 2600 + i * 2);
      b.x += (tx + b.ox + w - b.x) * b.ease;
      b.y += (ty + b.oy + w - b.y) * b.ease;
      root.setProperty('--' + b.k + 'x', (b.x * 100).toFixed(2) + '%');
      root.setProperty('--' + b.k + 'y', (b.y * 100).toFixed(2) + '%');
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();