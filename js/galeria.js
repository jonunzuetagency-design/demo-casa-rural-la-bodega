/* Galería: mosaico filtrable + visor a pantalla completa */
(function () {
  'use strict';
  var F = window.FOTOS || [];
  var MOTION = document.documentElement.classList.contains('motion');
  var $ = function (s) { return document.querySelector(s); };
  var WA = 'https://wa.me/34649111754?text=' + encodeURIComponent(
    'Hola, he visto la web de Casa Rural La Bodega y quería consultar disponibilidad. Somos __ personas, del __ al __. ¡Gracias!');
  Array.prototype.forEach.call(document.querySelectorAll('.js-wa'), function (a) { a.href = WA; });

  var dims = { a001: [2000, 2804], a016: [2000, 2804], a011: [500, 701], a028: [500, 701] };
  var grid = $('#grid'), filters = $('#filters');
  grid.innerHTML = F.map(function (f, i) {
    var d = dims[f.id] || (f.jpg ? [1024, 675] : [2000, 1318]);
    return '<figure class="g-item" tabindex="0" role="button" data-i="' + i + '" data-c="' + f.c + '" id="' + f.id + '" aria-label="Ampliar: ' + f.t + '">' +
      '<img src="' + f.s + '" alt="' + f.t + '" loading="' + (i < 6 ? 'eager' : 'lazy') + '" width="' + d[0] + '" height="' + d[1] + '">' +
      '<figcaption><span class="mono">' + f.c + '</span>' + f.t + '</figcaption></figure>';
  }).join('');
  var items = Array.prototype.slice.call(grid.children);

  // Filtros
  var cats = ['Todas', 'Casa', 'Dormitorios', 'Piscina', 'Exterior', 'Olivar', 'Entorno'];
  filters.innerHTML = cats.map(function (c, i) {
    var n = c === 'Todas' ? F.length : F.filter(function (f) { return f.c === c; }).length;
    return '<button class="g-chip" role="tab" aria-selected="' + (i === 0) + '" data-c="' + c + '">' + c + ' <sup>' + n + '</sup></button>';
  }).join('');
  var current = 'Todas';
  filters.addEventListener('click', function (e) {
    var b = e.target.closest('.g-chip'); if (!b) return;
    current = b.dataset.c;
    Array.prototype.forEach.call(filters.children, function (x) { x.setAttribute('aria-selected', x === b); });
    items.forEach(function (it) {
      var show = current === 'Todas' || it.dataset.c === current;
      it.classList.toggle('hide', !show);
      if (show && MOTION) { it.classList.remove('in'); void it.offsetWidth; requestAnimationFrame(function () { it.classList.add('in'); }); }
    });
  });

  // Reveals
  if (MOTION && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.05 });
    items.forEach(function (it) { io.observe(it); });
  } else items.forEach(function (it) { it.classList.add('in'); });

  // Visor
  var lb = $('#lb'), img = $('#lbImg'), cap = $('#lbCap'), cnt = $('#lbCount'), stage = $('#lbStage');
  var idx = 0, lastFocus = null;
  function visible() { return items.filter(function (it) { return !it.classList.contains('hide'); }).map(function (it) { return +it.dataset.i; }); }
  function show(i, dir) {
    var list = visible(), pos = list.indexOf(i);
    if (pos < 0) { pos = 0; i = list[0]; }
    idx = i;
    var f = F[i];
    var apply = function () {
      img.src = f.h; img.alt = f.t;
      cap.textContent = f.t;
      cnt.textContent = String(pos + 1).padStart(2, '0') + ' / ' + String(list.length).padStart(2, '0') + ' · ' + f.c;
      if (history.replaceState) history.replaceState(null, '', '#' + f.id);
    };
    if (dir && MOTION) {
      img.classList.add('swap'); img.classList.toggle('back', dir < 0);
      setTimeout(function () {
        apply();
        img.classList.remove('swap', 'back');
      }, 280);
    } else apply();
    // precarga vecinos
    [list[(pos + 1) % list.length], list[(pos - 1 + list.length) % list.length]].forEach(function (n) { var p = new Image(); p.src = F[n].h; });
  }
  function step(d) {
    var list = visible(), pos = list.indexOf(idx);
    show(list[(pos + d + list.length) % list.length], d);
  }
  function open(i) {
    lastFocus = document.activeElement;
    lb.hidden = false; document.documentElement.classList.add('lb-open');
    show(i);
    requestAnimationFrame(function () { requestAnimationFrame(function () { lb.classList.add('open'); }); });
    $('#lbClose').focus();
  }
  function close() {
    lb.classList.remove('open');
    document.documentElement.classList.remove('lb-open');
    setTimeout(function () { lb.hidden = true; }, MOTION ? 700 : 0);
    if (history.replaceState) history.replaceState(null, '', location.pathname);
    if (lastFocus) lastFocus.focus();
  }
  grid.addEventListener('click', function (e) { var it = e.target.closest('.g-item'); if (it) open(+it.dataset.i); });
  grid.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('g-item')) { e.preventDefault(); open(+e.target.dataset.i); }
  });
  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', function () { step(-1); });
  $('#lbNext').addEventListener('click', function () { step(1); });
  stage.addEventListener('click', function (e) { if (e.target === stage) close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Tab') { // foco atrapado
      var f = lb.querySelectorAll('button'), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var sx = null, sy = null;
  stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    else if (dy > 90) close();
  });

  // Abrir desde la portada (#a002)
  var h = location.hash.slice(1);
  if (h) {
    var n = F.map(function (f) { return f.id; }).indexOf(h);
    if (n >= 0) setTimeout(function () { open(n); }, 150);
  }
})();
