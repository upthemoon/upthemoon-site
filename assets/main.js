// Up the Moon corporate site — main interactions
// Loader / Custom cursor / Stagger reveal / Hero 3D tilt
(function() {
  // ── Mark JS ready (gate for fade-up / hero-cta / stagger / shimmer) ──
  document.body.classList.add('js-ready');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // ── Loader fade-out (initial reveal only — sessionStorage skip on subsequent navigation) ──
  var loader = document.getElementById('loader');
  if (loader) {
    var alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem('um-loader-seen') === '1'; } catch (e) {}
    if (reduce || alreadySeen) {
      loader.parentNode && loader.parentNode.removeChild(loader);
    } else {
      var dismissed = false;
      var dismiss = function() {
        if (dismissed) return;
        dismissed = true;
        loader.classList.add('is-done');
        try { sessionStorage.setItem('um-loader-seen', '1'); } catch (e) {}
        setTimeout(function() {
          loader.parentNode && loader.parentNode.removeChild(loader);
        }, 900);
      };
      var minTime = 2400;
      var start = performance.now();
      window.addEventListener('load', function() {
        var remain = Math.max(0, minTime - (performance.now() - start));
        setTimeout(dismiss, remain);
      });
      setTimeout(dismiss, 5000); // failsafe
    }
  }

  // ── Stagger / shimmer reveal ──
  var items = document.querySelectorAll('.stagger-item');
  var quotes = document.querySelectorAll('.philosophy blockquote');

  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function(el) { el.classList.add('is-in'); });
    quotes.forEach(function(el) { el.classList.add('is-lit'); });
  } else {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (!e.isIntersecting) return;
        var t = e.target;
        if (t.matches('.stagger-item')) t.classList.add('is-in');
        if (t.tagName === 'BLOCKQUOTE') t.classList.add('is-lit');
        io.unobserve(t);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function(el) { io.observe(el); });
    quotes.forEach(function(el) { io.observe(el); });
  }

  // ── Custom cursor (desktop only・goo blob via SVG filter) ──
  if (!isCoarse && !reduce) {
    var cursor = document.querySelector('.cursor');
    if (cursor) {
      var dot = cursor.querySelector('.cursor-dot');
      var ring = cursor.querySelector('.cursor-ring');
      var mx = window.innerWidth / 2, my = window.innerHeight / 2;
      var rx = mx, ry = my;
      window.addEventListener('mousemove', function(e) {
        mx = e.clientX; my = e.clientY;
        if (dot) dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      });
      var rafId = null, running = false;
      var tick = function() {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        if (ring) ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
        rafId = requestAnimationFrame(tick);
      };
      var startTick = function() { if (!running) { running = true; tick(); } };
      var stopTick = function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; running = false; } };
      startTick();
      document.addEventListener('visibilitychange', function() {
        if (document.hidden) stopTick(); else startTick();
      });
      window.addEventListener('pagehide', stopTick);
      var setHover = function(state) { cursor.classList.toggle('is-hover', state); };
      document.querySelectorAll('a, button, [role="button"], input, textarea, select, label').forEach(function(el) {
        el.addEventListener('mouseenter', function() { setHover(true); });
        el.addEventListener('mouseleave', function() { setHover(false); });
      });
      window.addEventListener('mouseleave', function() { cursor.style.opacity = '0'; });
      window.addEventListener('mouseenter', function() { cursor.style.opacity = '1'; });
    }

    // ── Hero logo subtle 3D tilt (Phase 2-3) ──
    var heroLogo = document.querySelector('.hero-logo');
    var hero = document.querySelector('.hero');
    if (heroLogo && hero) {
      heroLogo.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
      heroLogo.style.transformStyle = 'preserve-3d';
      hero.addEventListener('mousemove', function(e) {
        var rect = hero.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) / (rect.width / 2);
        var dy = (e.clientY - cy) / (rect.height / 2);
        var rotX = -dy * 8; // tilt up/down (degrees)
        var rotY = dx * 8;  // tilt left/right
        heroLogo.style.transform = 'perspective(800px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg)';
      });
      hero.addEventListener('mouseleave', function() {
        heroLogo.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
      });
    }
  }

  // Touch devices: gentle gyro tilt fallback (optional・defensive・only if permitted)
  // — kept minimal to avoid permission prompts; tilt is desktop-only feature.
})();
