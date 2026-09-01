document.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('intro');
  const panels = document.querySelectorAll('.panel');
  const navlinks = document.querySelectorAll('.navlink');
  const dots = document.querySelectorAll('.dot');
  const gotoButtons = document.querySelectorAll('[data-goto]');
  const navToggle = document.getElementById('navToggle');
  const navlinksWrap = document.querySelector('.navlinks');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const order = ['inicio','historia','menu','ubicacion','redes'];
  let current = 'inicio';
  let isAnimating = false;
  let countersDone = false;

  function runCounters(){
    if (countersDone) return;
    countersDone = true;
    document.querySelectorAll('.counter').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const isDecimal = String(target).includes('.');
      const duration = 900;
      const start = performance.now();
      function tick(now){
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = isDecimal ? val.toFixed(1) : Math.round(val);
        if (p < 1) requestAnimationFrame(tick);
      }
      if (reduceMotion) { el.textContent = isDecimal ? target.toFixed(1) : target; }
      else requestAnimationFrame(tick);
    });
  }

  function showPanel(id, opts = {}){
    if (id === current && !opts.force) return;
    if (!order.includes(id)) return;
    isAnimating = true;
    panels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === id));
    navlinks.forEach(b => b.classList.toggle('is-active', b.dataset.goto === id));
    dots.forEach(d => d.classList.toggle('is-active', d.dataset.goto === id));
    current = id;
    if (id === 'inicio') runCounters();
    if (navlinksWrap && navlinksWrap.classList.contains('is-open')) {
      navlinksWrap.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
    window.setTimeout(() => { isAnimating = false; }, 600);
  }

  gotoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.goto;
      if (!target) return;
      showPanel(target);
    });
  });

  navToggle && navToggle.addEventListener('click', () => {
    const open = navlinksWrap.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('keydown', (e) => {
    if (isAnimating) return;
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (['INPUT','TEXTAREA'].includes(tag)) return;
    const idx = order.indexOf(current);
    if (e.key === 'ArrowRight' && idx < order.length - 1) showPanel(order[idx + 1]);
    if (e.key === 'ArrowLeft' && idx > 0) showPanel(order[idx - 1]);
  });

  // Menu category tabs
  const mtabs = document.querySelectorAll('.mtab');
  const mpanels = document.querySelectorAll('.menugrid');
  mtabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.menu;
      mtabs.forEach(t => { t.classList.toggle('is-active', t === tab); t.setAttribute('aria-selected', t === tab); });
      mpanels.forEach(p => {
        const match = p.dataset.menupanel === target;
        p.classList.toggle('is-active', match);
        if (match) {
          // reset any flipped cards when a new category comes into view
          p.querySelectorAll('.prodCard.is-flipped').forEach(c => c.classList.remove('is-flipped'));
        }
      });
      // scroll the menu panel back to the top of the grid when switching categories
      const stagePanel = document.getElementById('menu');
      if (stagePanel) stagePanel.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  // Interactive product cards: click/tap flips the card to reveal the description
  document.querySelectorAll('.prodCard').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('is-flipped');
    });
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('is-flipped');
      }
    });
  });

  // Intro sequence
  const introDelay = reduceMotion ? 200 : 2300;
  window.setTimeout(() => { intro.classList.add('hide'); }, introDelay);
  intro.addEventListener('click', () => intro.classList.add('hide'));

  // Run counters immediately if starting on inicio
  runCounters();
});
