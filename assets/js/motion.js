(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) {
    document.documentElement.classList.remove('pre');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('gsap-on');

  const EASE = 'expo.out';
  const sections = [...document.querySelectorAll('.reveal-on-scroll')];
  const hero = sections[0];
  const header = document.querySelector('header');
  let ready = false;

  /* ---------- SMOOTH SCROLL (lower lerp = silkier) ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.9, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- HELPERS ---------- */
  function maskBlock(el) {
    const inner = document.createElement('span');
    inner.className = 'mask-in';
    while (el.firstChild) inner.appendChild(el.firstChild);
    const m = document.createElement('span');
    m.className = 'mask';
    m.appendChild(inner);
    el.appendChild(m);
    return inner;
  }

  /* ---------- HERO ---------- */
  const h1 = hero.querySelector('h1');
  const parts = h1.innerHTML.split(/<br\s*\/?>/i).map(s => s.trim()).filter(Boolean);
  h1.innerHTML = parts.map(p => '<span class="mask"><span class="mask-in">' + p + '</span></span>').join('');
  const h1Lines = h1.querySelectorAll('.mask-in');
  const heroText = hero.querySelectorAll('span.block, p, figcaption, .border-t');
  const heroFrame = hero.querySelector('.img-frame');
  const heroImg = heroFrame.querySelector('img');

  gsap.set(h1Lines, { yPercent: 110 });
  gsap.set(heroText, { opacity: 0, y: 24 });
  gsap.set(heroFrame, { clipPath: 'inset(100% 0 0 0)' });
  gsap.set(heroImg, { scale: 1.45 });
  gsap.set(header, { yPercent: -100 });

  function intro() {
    const tl = gsap.timeline({ defaults: { ease: EASE }, onComplete: () => { ready = true; } });
    tl.to(header, { yPercent: 0, duration: 1.2 }, 0)
      .to(heroFrame, { clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'expo.inOut' }, 0)
      .to(heroImg, { scale: 1.2, duration: 2.4 }, 0)
      .to(h1Lines, { yPercent: 0, duration: 1.5, stagger: 0.12 }, 0.15)
      .to(heroText, { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, 0.5);
  }

  /* initial states are set, so reveal the page and play the intro */
  document.documentElement.classList.remove('pre');
  gsap.delayedCall(0.15, intro);

  /* ---------- MASKED HEADINGS ---------- */
  document.querySelectorAll('section h2, .bg-cardamom p.font-serif').forEach(el => {
    const inner = maskBlock(el);
    gsap.set(inner, { yPercent: 110 });
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(inner, { yPercent: 0, duration: 1.4, ease: EASE })
    });
  });

  /* ---------- TEXT FADE-RISE (batched) ---------- */
  const textEls = sections.slice(1)
    .flatMap(s => [...s.querySelectorAll('h3, p, span.block, span.font-serif, figcaption, dl > div')])
    .filter(el => !el.closest('.mask') && !el.querySelector('.mask') && !el.closest('li'));
  textEls.push(...document.querySelectorAll('form'));
  gsap.set(textEls, { opacity: 0, y: 28 });
  ScrollTrigger.batch(textEls, {
    start: 'top 90%', once: true,
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1.2, ease: EASE, stagger: 0.08, overwrite: true })
  });

  /* ---------- PHOTOS: unveil + parallax ---------- */
  sections.forEach((s, i) => {
    s.querySelectorAll('.img-frame').forEach(frame => {
      const img = frame.querySelector('img');
      if (i > 0) {
        gsap.set(frame, { clipPath: 'inset(100% 0 0 0)' });
        gsap.set(img, { scale: 1.45 });
        ScrollTrigger.create({
          trigger: frame, start: 'top 88%', once: true,
          onEnter: () => {
            gsap.to(frame, { clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'expo.inOut' });
            gsap.to(img, { scale: 1.2, duration: 2.2, ease: EASE });
          }
        });
      }
      gsap.fromTo(img, { yPercent: 6 }, {
        yPercent: -6, ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  });

  /* ---------- STORY: depth drift on middle pillar ---------- */
  gsap.matchMedia().add('(min-width: 768px)', () => {
    gsap.to('#story .grid > div:nth-child(2)', {
      y: -70, ease: 'none',
      scrollTrigger: { trigger: '#story .grid', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- TERROIR COUNT-UP ---------- */
  const altP = [...document.querySelectorAll('p')].find(p => p.textContent.trim().startsWith('1,800m'));
  if (altP && altP.firstChild && altP.firstChild.nodeType === 3) {
    const node = altP.firstChild;
    const o2 = { v: 0 };
    node.nodeValue = '0m';
    ScrollTrigger.create({
      trigger: altP, start: 'top 85%', once: true,
      onEnter: () => gsap.to(o2, { v: 1800, duration: 2.4, ease: 'power3.out',
        onUpdate: () => { node.nodeValue = Math.round(o2.v).toLocaleString('en-US') + 'm'; } })
    });
  }

  /* ---------- MENU LEDGER ---------- */
  document.querySelectorAll('.menu-category').forEach(cat => {
    const rows = cat.querySelectorAll('li');
    gsap.set(rows, { clipPath: 'inset(0 100% 0 0)', y: 10 });
    ScrollTrigger.create({
      trigger: cat, start: 'top 82%', once: true,
      onEnter: () => {
        if (cat._shown) return;
        cat._shown = true;
        gsap.to(rows, { clipPath: 'inset(0 0% 0 0)', y: 0, duration: 1, ease: EASE, stagger: 0.04 });
      }
    });
  });

  function replayMenu() {
    document.querySelectorAll('.menu-category').forEach(cat => {
      if (cat.style.display === 'none') return;
      cat._shown = true;
      gsap.set(cat.querySelectorAll('h3, p'), { opacity: 1, y: 0 });
      gsap.fromTo(cat.querySelectorAll('li'),
        { clipPath: 'inset(0 100% 0 0)', y: 10 },
        { clipPath: 'inset(0 0% 0 0)', y: 0, duration: 0.9, ease: EASE, stagger: 0.035, overwrite: true });
    });
    ScrollTrigger.refresh();
  }
  const baseFilter = window.filterMenu;
  if (typeof baseFilter === 'function') {
    window.filterMenu = function (c) { baseFilter(c); requestAnimationFrame(replayMenu); };
  }

  /* ---------- HEADER, PROGRESS, MARQUEE, ANCHORS ---------- */
  const progress = document.createElement('div');
  progress.id = 'progress';
  header.appendChild(progress);

  if (lenis) {
        lenis.on('scroll', e => { gsap.set(progress, { scaleX: e.progress }); });

    const mq = document.querySelector('.animate-marquee');
    let boost = 0;
    lenis.on('scroll', e => { boost = Math.min(Math.abs(e.velocity) * 0.5, 8); });
    gsap.ticker.add(() => {
      boost *= 0.94;
      const a = mq && mq.getAnimations()[0];
      if (a) a.playbackRate = 1 + boost;
    });

    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id === '#') { e.preventDefault(); lenis.scrollTo(0); return; }
        const t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        lenis.scrollTo(t, { offset: -100, duration: 1.6 });
      });
    });
  }

  /* ---------- DRAWER: staggered content + scroll lock ---------- */
  const drawer = document.getElementById('spec-drawer');
  if (drawer) {
    drawer.setAttribute('data-lenis-prevent', '');
    let wasOpen = false;
    new MutationObserver(() => {
      const open = drawer.classList.contains('open');
      if (open === wasOpen) return;
      wasOpen = open;
      if (lenis) { open ? lenis.stop() : lenis.start(); }
      if (open) {
        gsap.fromTo(drawer.querySelectorAll('#spec-kicker, #spec-title, #spec-desc, dl > div, #spec-note'),
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: EASE, stagger: 0.07, delay: 0.3, overwrite: true });
      }
    }).observe(drawer, { attributes: true, attributeFilter: ['class'] });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();