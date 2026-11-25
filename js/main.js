/* Casa Rural La Bodega · v2 */
(function () {
  'use strict';
  var root = document.documentElement;
  var MOTION = root.classList.contains('motion');
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- WhatsApp con texto ---------- */
  var WA = 'https://wa.me/34649111754?text=' + encodeURIComponent(
    'Hola, he visto la web de Casa Rural La Bodega y quería consultar disponibilidad. Somos __ personas, del __ al __. ¡Gracias!');
  $$('.js-wa').forEach(function (a) { a.href = WA; });

  /* ---------- Intro de carga ---------- */
  var heroImg = $('.hero__arch img');
  function loaded() { requestAnimationFrame(function () { root.classList.add('loaded'); }); }
  if (heroImg && !heroImg.complete) { heroImg.addEventListener('load', loaded); setTimeout(loaded, 1800); } else loaded();

  /* ---------- Menú móvil ---------- */
  var burger = $('#burger'), menu = $('#menu'), lenis = null;
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  burger.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Palabras del intro ---------- */
  var words = [];
  $$('[data-words]').forEach(function (el) {
    var html = el.innerHTML.replace(/&nbsp;/g, ' ');
    var tmp = document.createElement('div'); tmp.innerHTML = html;
    var text = tmp.textContent;
    el.innerHTML = text.split(' ').map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    words = words.concat($$('.w', el));
  });
  if (!MOTION) words.forEach(function (w) { w.classList.add('on'); });

  /* ---------- Reveals (IntersectionObserver) ---------- */
  var revealSel = '[data-reveal],[data-clip],[data-lines],[data-rise]';
  // stagger entre hermanos
  $$('.places, .rv__themes ul, .stats').forEach(function (p) {
    $$('[data-reveal]', p).forEach(function (el, i) { el.style.transitionDelay = (i * 0.08) + 's'; });
  });
  if (MOTION && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    $$(revealSel).forEach(function (el) { io.observe(el); });
  } else {
    $$(revealSel).forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Contadores ---------- */
  function countUp(el) {
    var to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), t0 = null, dur = 1600;
    function f(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = (to * e).toFixed(dec).replace('.', ',');
      if (p < 1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }
  if (MOTION && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Nav sólida ---------- */
  var nav = $('#nav');
  function solidCheck(y) {
    var hero = $('.hero');
    var limit = hero ? (hero.parentElement.classList.contains('pin-spacer') ? hero.parentElement.offsetHeight : hero.offsetHeight) - 70 : 200;
    nav.classList.toggle('solid', y > limit);
  }

  /* ---------- Galería en bucle ---------- */
  (function reel() {
    var view = $('#reel'), track = $('#reelTrack');
    if (!view || !window.FOTOS) return;
    var picks = ['a002', 'a004', 'a030', 'a009', 'a033', 'a001', 'a021', 'a018', 'a024', 'a037', 'a003', 'a006', 'a027', 'a025', 'a016', 'a015', 'a036', 'a014'];
    var tall = { a001: 1, a016: 1, a011: 1, a028: 1 };
    var items = picks.map(function (id) { return window.FOTOS.filter(function (f) { return f.id === id; })[0]; }).filter(Boolean);
    var html = items.map(function (f) {
      return '<a class="reel__item" draggable="false" href="galeria.html#' + f.id + '" style="aspect-ratio:' + (tall[f.id] ? '0.713' : '1.517') + '">' +
        '<img src="' + f.s + '" alt="' + f.t + '" loading="lazy" draggable="false"><span>' + f.t + '</span></a>';
    }).join('');
    track.innerHTML = html + html.replace(/<a /g, '<a aria-hidden="true" tabindex="-1" ');

    var x = 0, speed = MOTION ? 42 : 0, cur = speed, hover = false, visible = true;
    var dragging = false, startX = 0, lastX = 0, moved = 0, vel = 0, last = performance.now();
    function half() { return track.scrollWidth / 2; }
    function wrap() { var h = half(); if (h <= 0) return; while (x <= -h) x += h; while (x > 0) x -= h; }
    function frame(t) {
      var dt = Math.min((t - last) / 1000, 0.05); last = t;
      if (visible && !dragging) {
        var target = hover ? 0 : speed;
        cur += (target - cur) * (1 - Math.exp(-5 * dt));
        if (Math.abs(vel) > 1) { x += vel * dt; vel *= Math.exp(-3.2 * dt); } else vel = 0;
        x -= cur * dt; wrap();
        track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(view);
    view.addEventListener('mouseenter', function () { hover = true; });
    view.addEventListener('mouseleave', function () { hover = false; });
    view.addEventListener('focusin', function () { hover = true; });
    view.addEventListener('focusout', function () { hover = false; });

    var t0 = 0;
    view.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      dragging = true; startX = lastX = e.clientX; moved = 0; vel = 0; t0 = performance.now();
      view.classList.add('dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX; lastX = e.clientX;
      moved += Math.abs(dx); x += dx; wrap();
      var now = performance.now(), d = Math.max(now - t0, 1); t0 = now;
      vel = vel * 0.6 + (dx / d * 1000) * 0.4;
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
    });
    function end() { if (!dragging) return; dragging = false; view.classList.remove('dragging'); last = performance.now(); }
    window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
    view.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
  })();

  /* ---------- Reseñas ---------- */
  (function reviews() {
    var R = [
      { a: 'Agnieszka Znamirowska-Zawala', d: 'Agosto 2026', t: 'Hermosa villa, habitaciones cómodas, muy limpia. El dueño es muy amable, excelente comunicación. ¡La recomiendo!' },
      { a: 'Javier Sidrach de Cardona', d: 'Octubre 2025', t: 'Grande, limpia y muy tranquila. El propietario que nos atendió, muy servicial y discreto. Una piscina estupenda para el verano.' },
      { a: 'Eloisa Ruiz', d: 'Noviembre 2024', t: 'La casa está genial. Cada habitación dispone de un baño. Las zonas comunes como el salón y la cocina, muy bien equipada con todo lo necesario.' },
      { a: 'Marcin Zawala', d: 'Agosto 2026', t: 'La casa, los alrededores, los propietarios, todo de 10/10.' },
      { a: 'Pilar López Ruiz', d: 'Abril 2023', t: 'Totalmente recomendable. Amplia, confortable y los dueños muy amables. Volveremos.' },
      { a: 'Chiti Calvo', d: 'Junio 2025', t: 'Fenomenal en todos los sentidos.' }
    ];
    var box = $('#rvSlides'), bars = $('#rvBars'), stage = $('#rvStage');
    if (!box) return;
    box.innerHTML = R.map(function (r, i) {
      var w = r.t.split(' ').map(function (x, k) {
        return '<span class="ln" style="display:inline-block;vertical-align:top"><span style="transition-delay:' + (k * 0.025).toFixed(3) + 's">' + x + '</span></span>';
      }).join(' ');
      var ini = r.a.split(' ').slice(0, 2).map(function (s) { return s[0]; }).join('');
      return '<blockquote class="rv__slide" aria-hidden="true" style="margin:0"><p class="rv__text">' + w + '</p>' +
        '<footer class="rv__who"><span class="rv__av" aria-hidden="true">' + ini + '</span><p>' + r.a + '<small>★★★★★ · Reseña de Google · ' + r.d + '</small></p></footer></blockquote>';
    }).join('');
    bars.innerHTML = R.map(function (r, i) { return '<button class="rv__bar" aria-label="Ver opinión ' + (i + 1) + '"></button>'; }).join('');
    var slides = $$('.rv__slide', box), bs = $$('.rv__bar', bars), idx = -1;
    function go(n) {
      n = (n + R.length) % R.length;
      slides.forEach(function (s, i) { s.classList.toggle('on', i === n); s.setAttribute('aria-hidden', i !== n); });
      bs.forEach(function (b, i) {
        b.classList.remove('on'); b.classList.toggle('done', i < n);
        b.style.setProperty('--dur', MOTION ? '7s' : '0s');
      });
      void bars.offsetWidth;
      if (MOTION) bs[n].classList.add('on'); else bs.forEach(function (b, i) { b.classList.toggle('done', i <= n); });
      idx = n;
    }
    bs.forEach(function (b, i) {
      b.addEventListener('click', function () { go(i); });
      b.addEventListener('animationend', function () { if (i === idx) go(idx + 1); });
    });
    $('#rvPrev').addEventListener('click', function () { go(idx - 1); });
    $('#rvNext').addEventListener('click', function () { go(idx + 1); });
    stage.addEventListener('mouseenter', function () { stage.classList.add('paused'); });
    stage.addEventListener('mouseleave', function () { stage.classList.remove('paused'); });
    var sx = null;
    box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
    });
    // empieza cuando la sección entra
    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { go(0); o.disconnect(); } }, { threshold: 0.3 });
      o.observe(stage);
    } else go(0);
  })();

  /* ---------- FAQ: una abierta a la vez ---------- */
  $$('.qa').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) $$('.qa').forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ==========================================================
     GSAP + Lenis
     ========================================================== */
  function initMotion() {
    hasGSAP = !!(window.gsap && window.ScrollTrigger);
    if (!hasGSAP || !MOTION) {
      window.addEventListener('scroll', function () { solidCheck(scrollY); }, { passive: true });
      solidCheck(scrollY);
      return;
    }
    var gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });
    root.classList.add('gsap');

    // Lenis solo en escritorio con ratón
    if (window.Lenis && matchMedia('(pointer:fine)').matches) {
      lenis = new window.Lenis({ lerp: 0.095, wheelMultiplier: 1 });
      lenis.on('scroll', ST.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href'); if (id.length < 2) return;
        var t = document.querySelector(id); if (!t) return;
        e.preventDefault();
        var y = id === '#inicio' ? 0 : t.getBoundingClientRect().top + scrollY - 60;
        if (lenis) lenis.scrollTo(y, { duration: 1.6 }); else window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });

    /* Hero: el arco se abre a pantalla completa */
    var hero = $('.hero'), arch = $('#heroArch'), mobile = matchMedia('(max-width:820px)');
    var over = $('#heroOver');
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: hero, start: 'top top', end: '+=110%', pin: true, scrub: 0.7, invalidateOnRefresh: true,
        onUpdate: function (s) {
          var open = s.progress > 0.42;
          hero.classList.toggle('is-open', open);
          nav.classList.toggle('on-dark', open && s.progress < 1);
        }
      }
    });
    tl.fromTo(arch, {
      width: function () { return arch.offsetWidth; },
      height: function () { return arch.offsetHeight; },
      borderTopLeftRadius: function () { return arch.offsetWidth / 2; },
      borderTopRightRadius: function () { return arch.offsetWidth / 2; }
    }, {
      width: function () { return hero.offsetWidth; },
      height: function () { return hero.offsetHeight; },
      bottom: function () { return mobile.matches ? 0 : 'auto'; },
      borderTopLeftRadius: 0, borderTopRightRadius: 0, ease: 'power2.inOut', duration: 1, immediateRender: false
    }, 0)
      .fromTo('.hero__zoom', { scale: 1.15 }, { scale: 1, duration: 1, immediateRender: false }, 0)
      .to('.ht--l', { xPercent: -130, duration: 0.8, ease: 'power1.in' }, 0)
      .to('.ht--r', { xPercent: 130, duration: 0.8, ease: 'power1.in' }, 0)
      .fromTo('.hero__kicker', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.25, immediateRender: false }, 0)
      .fromTo('.hero__shade', { opacity: 0 }, { opacity: 1, duration: 0.5, immediateRender: false }, 0.4)
      .fromTo(over, { autoAlpha: 1, clipPath: 'inset(0 0 100% 0)', y: 30 }, { clipPath: 'inset(0 0 -10% 0)', y: 0, duration: 0.35, immediateRender: false }, 0.7)
      .to({}, { duration: 0.15 });
    if (mobile.matches) {
      tl.to('.ht', { yPercent: -60, duration: 0.8 }, 0);
    }

    /* Intro: palabras que se encienden con el scroll */
    if (words.length) {
      ST.create({
        trigger: '.intro__text', start: 'top 80%', end: 'bottom 45%', scrub: true,
        onUpdate: function (s) {
          var n = Math.round(s.progress * words.length);
          words.forEach(function (w, i) { w.classList.toggle('on', i < n); });
        }
      });
    }

    /* Parallax en imágenes */
    $$('.px img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    /* Piscina: la foto se abre y el 10×5 sube */
    gsap.fromTo('#poolFrame', { clipPath: 'inset(9% 7% 9% 7% round 18px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: '#poolPin', start: 'top bottom', end: 'top top', scrub: true }
    });
    gsap.fromTo('#poolFrame img', { scale: 1.25 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: '#poolPin', start: 'top bottom', end: 'bottom top', scrub: true }
    });
    gsap.fromTo('.pool__big', { yPercent: 35 }, {
      yPercent: -25, ease: 'none',
      scrollTrigger: { trigger: '#poolPin', start: 'top bottom', end: 'bottom top', scrub: true }
    });
    gsap.fromTo('.pool__cap', { clipPath: 'inset(0 0 100% 0)', y: 40 }, {
      clipPath: 'inset(0 0 -10% 0)', y: 0, ease: 'power2.out',
      scrollTrigger: { trigger: '#poolPin', start: 'top 40%', end: 'top 0%', scrub: true }
    });

    /* Rama de olivo dibujándose */
    $$('.branch path, .branch ellipse').forEach(function (p, i) {
      var L = p.getTotalLength ? p.getTotalLength() : 600;
      gsap.set(p, { strokeDasharray: L, strokeDashoffset: L });
      gsap.to(p, {
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: '.branch', start: 'top ' + (88 - i * 3) + '%', end: 'top ' + (40 - i * 2) + '%', scrub: true }
      });
    });

    /* Cierre */
    gsap.fromTo('.final__bg', { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: '.final', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    /* Nav sólida */
    ST.create({
      start: function () { var sp = hero.parentElement; return sp.offsetTop + sp.offsetHeight - 70; },
      end: 'max',
      onToggle: function (s) { nav.classList.toggle('solid', s.isActive); }
    });

    window.addEventListener('load', function () { ST.refresh(); });
  }

  if (document.readyState === 'complete' || window.gsap) initMotion();
  else window.addEventListener('load', initMotion);
})();
