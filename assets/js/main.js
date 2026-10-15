/* MENU FILTER */
const TAB_ACTIVE = 'tab-btn font-medium text-terracotta border-b border-terracotta pb-1 transition duration-500';
const TAB_IDLE = 'tab-btn text-roast/60 hover:text-espresso pb-1 transition duration-500';

function filterMenu(category) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.className = btn.dataset.tab === category ? TAB_ACTIVE : TAB_IDLE;
  });
  document.querySelectorAll('.menu-category').forEach(card => {
    card.style.display = (category === 'all' || card.dataset.category === category) ? 'block' : 'none';
  });
}
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => filterMenu(btn.dataset.tab));
});

/* SCROLL REVEAL */
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    }
  });
}, { root: null, rootMargin: '0px', threshold: 0.1 });
document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

/* LIVE STORE STATUS (Europe/Brussels) */
const OPEN_MIN = 10 * 60, CLOSE_MIN = 19 * 60 + 30;
const fmt = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
function updateStatus() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Brussels', hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date());
  const h = +parts.find(p => p.type === 'hour').value % 24;
  const m = +parts.find(p => p.type === 'minute').value;
  const now = h * 60 + m;
  const isOpen = now >= OPEN_MIN && now < CLOSE_MIN;
  document.getElementById('status-dot').classList.toggle('open', isOpen);
  document.getElementById('status-label').textContent = isOpen ? 'Open now' : 'Closed';
  document.getElementById('status-sub').textContent = isOpen
    ? 'Until ' + fmt(CLOSE_MIN)
    : 'Opens ' + (now < OPEN_MIN ? 'today ' : 'tomorrow ') + fmt(OPEN_MIN);
}
updateStatus();
setInterval(updateStatus, 30000);

/* COPY ADDRESS */
const copyBtn = document.getElementById('copy-address');
const copyLabel = document.getElementById('copy-label');
let copyTimer;
copyBtn.addEventListener('click', async () => {
  const text = document.getElementById('address-text').textContent.trim();
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  copyLabel.textContent = 'Copied';
  copyBtn.classList.add('text-cardamom', 'border-cardamom');
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    copyLabel.textContent = 'Copy';
    copyBtn.classList.remove('text-cardamom', 'border-cardamom');
  }, 2000);
});

/* TERROIR & BREW DRAWER */
// PLACEHOLDER CONTENT (except altitude): verify with Danta's before launch.
const ALT = '1,800m+';
const SPECS = {
  'honey-pistachio': { kicker: 'Cardamom Infused · Iced', title: 'Honey Pistachio Cardamom Latte',
    desc: 'Raw honey, roasted pistachio and Guatemalan cardamom over espresso, finished with vanilla cream.',
    notes: 'Honey, toasted pistachio, warm cardamom', altitude: ALT, roast: 'Medium · espresso-calibrated',
    origin: 'Guatemalan highlands', note: 'Cardamom: 99% exported from Guatemala.' },
  'vanilla-cheesecake': { kicker: 'House Selection · Iced', title: 'Vanilla Honey Cheesecake Latte',
    desc: 'Vanilla-infused honey espresso under cheesecake cream and Lotus Biscoff dust.',
    notes: 'Vanilla, honey, biscuit, cream', altitude: ALT, roast: 'Medium · espresso-calibrated',
    origin: 'Guatemalan highlands', note: 'Dessert-forward, built on the house espresso.' },
  'cat-espresso': { kicker: 'Category', title: 'Espresso Bar',
    desc: 'Pure extractions and milk drinks built on the house Guatemalan espresso.',
    notes: 'Chocolate depth, bright fruit', altitude: ALT, roast: 'Medium · espresso-calibrated',
    origin: 'Guatemalan volcanic highlands', note: 'Chocolate depth. Bright fruit notes.' },
  'cat-iced': { kicker: 'Category', title: 'Iced Coffee & Frappes',
    desc: 'Cold extractions, honey blends and signature iced lattes.',
    notes: 'Cocoa, honey, citrus lift', altitude: ALT, roast: 'Medium · espresso-calibrated',
    origin: 'Guatemalan highlands', note: 'Honey Blended Coffee is the barista favorite.' },
  'cat-warm': { kicker: 'Category', title: 'Warm Drinks & Spices',
    desc: 'Chai, golden spice, cocoa and tea, with cardamom and cinnamon at the centre.',
    notes: 'Cardamom, cinnamon, turmeric', altitude: 'n/a (spice & tea)', roast: 'n/a',
    origin: 'Guatemalan cardamom', note: 'Golden Chai: turmeric, cardamom, cinnamon.' },
  'cat-smoothies': { kicker: 'Category', title: 'Smoothies & Refreshers',
    desc: 'Fresh fruit smoothies with yogurt or plant-based milk, plus iced non-coffee drinks.',
    notes: 'Fresh fruit, matcha, lemon', altitude: 'n/a (fruit & tea)', roast: 'n/a',
    origin: 'Fresh, made in house', note: 'Add oats or protein to any smoothie.' }
};

const drawer = document.getElementById('spec-drawer');
const backdrop = document.getElementById('spec-backdrop');
const closeBtn = document.getElementById('spec-close');
let lastFocus = null;

function openSpec(key) {
  const s = SPECS[key]; if (!s) return;
  lastFocus = document.activeElement;
  const set = (id, v) => { document.getElementById(id).textContent = v; };
  set('spec-kicker', s.kicker); set('spec-title', s.title); set('spec-desc', s.desc);
  set('spec-notes', s.notes); set('spec-altitude', s.altitude); set('spec-roast', s.roast);
  set('spec-origin', s.origin); set('spec-note', s.note);
  drawer.classList.add('open'); backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => closeBtn.focus(), 50);
}
function closeSpec() {
  drawer.classList.remove('open'); backdrop.classList.remove('open');
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-spec]');
  if (t) openSpec(t.dataset.spec);
});
backdrop.addEventListener('click', closeSpec);
closeBtn.addEventListener('click', closeSpec);
document.addEventListener('keydown', e => {
  if (!drawer.classList.contains('open')) return;
  if (e.key === 'Escape') closeSpec();
  if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); }
});