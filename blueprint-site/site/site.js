// Interactivity for the preview site (the design canvas ran these through its own runtime).
(function () {
  // Phone menu: a Menu button that folds the nav links (hidden on wider screens by site.css)
  const nav = document.querySelector('header nav');
  const links = nav && nav.querySelector(':scope > div');
  if (nav && links && links.querySelector('a')) {
    links.id = links.id || 'site-links';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'menu-btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', links.id);
    btn.textContent = 'Menu';
    nav.querySelector(':scope > a').after(btn);
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('nav-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close' : 'Menu';
    });
  }

  // Audience tabs on the home page: swap in the pre-rendered view for the chosen tab
  const viewsEl = document.getElementById('tab-views');
  const tabs = document.querySelector('[data-tabs]');
  if (viewsEl && tabs) {
    const views = JSON.parse(viewsEl.textContent);
    tabs.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tab]');
      if (!b || !views[b.dataset.tab]) return;
      tabs.innerHTML = views[b.dataset.tab];
      const again = tabs.querySelector(`[data-tab="${b.dataset.tab}"]`);
      if (again) again.focus();
    });
  }

  // Hero video: make sure it plays muted, and let people pause it
  const video = document.querySelector('video');
  const toggle = document.querySelector('[data-video-toggle]');
  if (video) {
    video.muted = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.pause();
    else video.play().catch(() => {});
  }
  if (video && toggle) {
    toggle.addEventListener('click', () => {
      if (video.paused) { video.play().catch(() => {}); toggle.setAttribute('aria-label', 'Pause background video'); }
      else { video.pause(); toggle.setAttribute('aria-label', 'Play background video'); }
    });
  }

  // Logo reveal under the blueprint: burn open when it scrolls into view
  const reveal = document.getElementById('reveal');
  if (reveal) {
    const on = () => reveal.classList.add('rv-on');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { on(); io.disconnect(); } }, { threshold: 0.45 });
      io.observe(reveal);
    } else on();
    const replay = reveal.querySelector('[data-replay]');
    if (replay) replay.addEventListener('click', () => { reveal.classList.remove('rv-on'); setTimeout(on, 700); });
  }

  // Visit booking: day and time choices
  document.querySelectorAll('fieldset').forEach((fs) => {
    fs.addEventListener('click', (e) => {
      const b = e.target.closest('button.chip');
      if (!b) return;
      fs.querySelectorAll('button.chip').forEach((x) => x.classList.toggle('chip-on', x === b));
    });
  });

  // Design system: replayable burn demo
  const demo = document.querySelector('[data-burn-demo]');
  const reset = document.querySelector('[data-burn-reset]');
  if (demo) {
    demo.addEventListener('click', () => { demo.classList.remove('is-burning'); void demo.offsetWidth; demo.classList.add('is-burning'); });
    if (reset) reset.addEventListener('click', () => { demo.classList.remove('is-burning'); demo.blur(); });
  }

  // Button links play the burn before moving on, so the click effect is seen
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a.btn');
    if (!a || reduced || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const href = a.getAttribute('href') || '';
    if (!href || href === '#') return;
    e.preventDefault();
    a.classList.remove('is-burning'); void a.offsetWidth; a.classList.add('is-burning');
    setTimeout(() => { window.location.href = a.href; }, 1050);
  });
  // coming back with the browser's Back button: show the button fresh, not burnt
  window.addEventListener('pageshow', () => document.querySelectorAll('a.btn.is-burning').forEach((a) => a.classList.remove('is-burning')));

  // Forms are not wired up in the preview: burn the button, then say so
  document.querySelectorAll('form').forEach((f) => f.addEventListener('submit', (e) => e.preventDefault()));
  document.querySelectorAll('form button.btn').forEach((b) => {
    b.addEventListener('click', () => {
      b.classList.remove('is-burning'); void b.offsetWidth; b.classList.add('is-burning');
      const note = b.parentElement.querySelector('.preview-note') || Object.assign(document.createElement('p'), { className: 'preview-note' });
      note.setAttribute('role', 'status');
      note.style.cssText = 'margin:8px 0 0;font-size:13px;color:#E2BE86';
      b.after(note);
      setTimeout(() => { b.classList.add('is-burnt'); note.textContent = 'Preview: this form is not connected yet.'; }, 1100);
    });
  });
})();
