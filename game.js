/* ──────────────────────────────────────────────
   Bookworm — game logic
   read more, faster, forever
   ────────────────────────────────────────────── */
(() => {
'use strict';

/* ── data ─────────────────────────────────── */

const HELPERS = [
  { id:'worm',    name:'Bookworm',                 icon:'🪱', base:15,    wps:0.2,
    desc:'A literal worm with a library card. Slow but sincere.' },
  { id:'club',    name:'Book Club',                icon:'🍷', base:100,   wps:1,
    desc:'Brings wine. Brings opinions. Occasionally, books.' },
  { id:'lib',     name:'Librarian',                icon:'🤫', base:1100,  wps:8,
    desc:'Knows Dewey Decimal better than her own birthday.' },
  { id:'audio',   name:'Audiobook',                icon:'🎧', base:12000, wps:47,
    desc:'On 1.5×, naturally. 2× when nobody is listening.' },
  { id:'speed',   name:'Speed Reader',             icon:'💨', base:130000, wps:260,
    desc:'Eyes like helicopter blades. Already done.' },
  { id:'ai',      name:'AI Reading Assistant',     icon:'🤖', base:1.4e6, wps:1400,
    desc:'Hallucinates only the boring parts.' },
  { id:'home',    name:'Personal Library',         icon:'📚', base:2e7,   wps:7800,
    desc:'Smells like vanilla and forgotten Tuesdays.' },
  { id:'monks',   name:'Monastery of Monks',       icon:'🕯', base:3.3e8, wps:44000,
    desc:'Illuminating manuscripts since 800 AD. Quiet hours: all of them.' },
  { id:'alex',    name:'Library of Alexandria',    icon:'🏛', base:5.1e9, wps:260000,
    desc:'Restored. With smoke detectors this time.' },
  { id:'sentient',name:'Sentient Bookshelf',       icon:'🗄', base:7.5e10, wps:1.6e6,
    desc:'Judges your choices, but kindly.' },
  { id:'time',    name:'Time-Dilated Reading Room',icon:'🌀', base:1e12,   wps:1e7,
    desc:'An hour passes in a minute. Coffee cools faster.' },
  { id:'akashic', name:'The Akashic Records',      icon:'📜', base:1.4e13, wps:6.5e7,
    desc:'Every book ever written. And a few that weren’t.' },
];

const TAP_UPGRADES = [
  { id:'glasses', name:'Reading Glasses',           icon:'👓', cost:50,      wpc:1,
    desc:'The squinting era is officially over.' },
  { id:'mark',    name:'Bookmark',                  icon:'🔖', cost:300,     wpc:3,
    desc:'Never lose your place. Mostly.' },
  { id:'high',    name:'Highlighter',               icon:'🖍', cost:2000,    wpc:10,
    desc:'It’s always the yellow one. Always.' },
  { id:'sticky',  name:'Sticky Notes',              icon:'📝', cost:15000,   wpc:30,
    desc:'Marginalia for the modern mind.' },
  { id:'lamp',    name:'Reading Lamp',              icon:'💡', cost:100000,  wpc:100,
    desc:'Goodbye, eye strain. Hello, electric bill.' },
  { id:'chair',   name:'Ergonomic Chair',           icon:'🪑', cost:700000,  wpc:300,
    desc:'Your spine sends thanks.' },
  { id:'tea',     name:'Quiet Cup of Tea',          icon:'🍵', cost:5e6,     wpc:1000,
    desc:'Steeped strong, like the prose.' },
  { id:'dnd',     name:'Do-Not-Disturb Sign',       icon:'🚪', cost:40e6,    wpc:3000,
    desc:'Cuts interruptions by precisely 73%.' },
  { id:'desk',    name:'Standing Desk',             icon:'🧍', cost:300e6,   wpc:10000,
    desc:'You’ll regret it tomorrow. But not today.' },
  { id:'plug',    name:'Noise-Cancelling Earplugs', icon:'🎧', cost:2.5e9,   wpc:30000,
    desc:'Block out the world. Especially roommates.' },
];

const MULT_UPGRADES = [
  { id:'speed101',name:'Speed Reading 101',  icon:'⏱',  cost:250000,   x:1.5,
    desc:'Eyes officially go brrr.',                         req:{lifetime:100000} },
  { id:'margins', name:'Annotated Margins',  icon:'✍️', cost:4e6,      x:1.25,
    desc:'Future you will be furious. And grateful.',        req:{lifetime:1e6} },
  { id:'photo',   name:'Photographic Memory',icon:'📸', cost:80e6,     x:2,
    desc:'Remember every word. Including the typos.',        req:{lifetime:1e7} },
  { id:'caffeine',name:'Caffeine IV',        icon:'☕', cost:1.2e9,    x:1.5,
    desc:'Sleep is for the unread.',                         req:{lifetime:1e8} },
  { id:'lucid',   name:'Lucid Reading',      icon:'🌙', cost:2e10,     x:2,
    desc:'Books read in dreams count, apparently.',          req:{lifetime:1e9} },
  { id:'holo',    name:'Holographic Pages',  icon:'🪩', cost:4e11,     x:2,
    desc:'Pages float. So do the metaphors.',                req:{lifetime:1e10} },
  { id:'cyber',   name:'Cybernetic Eyes',    icon:'👁',  cost:1e13,    x:3,
    desc:'Warranty void if exposed to poetry.',              req:{lifetime:1e12} },
];

// One "school" upgrade per helper: ×2 per-unit, unlocked at 5 owned.
const HELPER_UPGRADES = HELPERS.map(h => ({
  id:    'h_' + h.id,
  name:  h.name + ' School',
  icon:  h.icon,
  desc:  'Twice as effective. Now with footnotes.',
  cost:  Math.ceil(h.base * 100),
  helper: h.id,
  x: 2,
  req: { helperCount: { id: h.id, count: 5 } },
}));

const UPGRADES = [
  ...TAP_UPGRADES.map(u => ({ ...u, kind:'tap' })),
  ...MULT_UPGRADES.map(u => ({ ...u, kind:'mult' })),
  ...HELPER_UPGRADES.map(u => ({ ...u, kind:'helperMult' })),
];

const BOOK_TITLES = [
  'Pride and Procrastination',
  'War and Peace and Snacks',
  'The Hitchhiker’s Guide to the Bookshelf',
  '1984 (the Year I Started Reading)',
  'Crime and Punctuation',
  'Of Mice and Manuscripts',
  'The Great Catspy',
  'A Tale of Two Tabs',
  'Brave New Word Count',
  'To Kill a Mocking Bookmark',
  'Wuthering Highlights',
  'The Catcher in the Wi-Fi',
  'Don Quixote of La Couch',
  'Anna Karenina, Reloaded',
  'The Sun Also Rises (At My Bedtime)',
  'Slaughterhouse-Bookmark',
  'Lord of the Rings (Director’s Cut)',
  'The Old Man and the Search Bar',
  'On the Couch (and the Road)',
  'The Picture of Dorian Bookmark',
  'Madame Bovary’s TBR Pile',
  'Frankenstein, Restated',
  'Gone with the Bookmark',
  'The Brothers Bookworm',
  'Beowulf: A Fast Read',
  'Catch-22 Pages Today',
  'The Iliad (Lite)',
  'Moby-Bookmark',
  'Les Misérables (Abridged Once More)',
  'Bleak Highlights',
  'A Brief History of Bookshelves',
  'The Sound and the Furry',
  'Infinite Margin Notes',
  'The Bell Jam',
  'Ulysses, Annotated to Death',
  'Notes from the Subway',
  'Heart of Marginalia',
  'Dune: The Sand Edition',
  'The Trial of Patience',
  'The Old Curiosity Tab',
  'Things Fall Apart at the Spine',
  'The Joy Luck Book Club',
  'The Glass Spine',
  'The Stranger (in Aisle 3)',
  'The Color Periwinkle',
  'Beloved Bookmarks',
  'On Beauty Sleep',
  'Middlemarch Madness',
  'The Right Stuff to Read',
  'Tender Is the Tab',
  'A Confederacy of Footnotes',
  'The Sound of Silent Reading',
  'Lolita’s Long Library Card',
  'A Room of One’s Own (With Wi-Fi)',
];

const ACHIEVEMENTS = [
  { id:'first',       name:'First Word',          desc:'Read your first word.',
    test: s => s.lifetime >= 1 },
  { id:'kilo',        name:'Page Turner',         desc:'Read 1,000 words.',
    test: s => s.lifetime >= 1000 },
  { id:'mega',        name:'Bookworm',            desc:'Read 1,000,000 words.',
    test: s => s.lifetime >= 1e6 },
  { id:'giga',        name:'Voracious',           desc:'Read 1,000,000,000 words.',
    test: s => s.lifetime >= 1e9 },
  { id:'firstHelper', name:'Hello, Helper',       desc:'Hire your first Bookworm.',
    test: s => (s.helpers.worm || 0) >= 1 },
  { id:'audio',       name:'Hands-Free',          desc:'Press play on your first audiobook.',
    test: s => (s.helpers.audio || 0) >= 1 },
  { id:'firstBook',   name:'Cover to Cover',      desc:'Finish your first book.',
    test: s => s.books.length >= 1 },
  { id:'shelf',       name:'Stocked',             desc:'Finish 50 books.',
    test: s => s.books.length >= 50 },
  { id:'fullShelf',   name:'A Full Library',      desc:'Finish 1,000 books.',
    test: s => s.books.length >= 1000 },
  { id:'wisdom',      name:'Knowledge Seeker',    desc:'Re-read for the first time.',
    test: s => s.knowledge >= 1 },
  { id:'sage',        name:'Sage',                desc:'Reach 100 knowledge.',
    test: s => s.knowledge >= 100 },
  { id:'fast',        name:'Page-Per-Heartbeat',  desc:'Reach 100 words per second.',
    test: s => totalWpsRaw() >= 100 },
  { id:'rapid',       name:'Rapid Reader',        desc:'Reach 10,000 words per second.',
    test: s => totalWpsRaw() >= 1e4 },
];

/* ── number formatting ────────────────────── */

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc',
                  'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd',
                  'Ocd', 'Nod', 'Vg'];
function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 0) return '-' + fmt(-n);
  if (n < 1)   return n === 0 ? '0' : n.toFixed(2).replace(/\.?0+$/, '');
  if (n < 1000) return Math.floor(n).toString();
  let i = Math.floor(Math.log10(n) / 3);
  if (i >= SUFFIXES.length) return n.toExponential(2);
  const v = n / Math.pow(10, i * 3);
  const d = v < 10 ? 2 : v < 100 ? 1 : 0;
  return v.toFixed(d) + SUFFIXES[i];
}
function fmtRate(n) { return fmt(n) + '/sec'; }

/* ── state ────────────────────────────────── */

const SAVE_KEY = 'bookworm.save.v1';
const DEFAULT_STATE = () => ({
  v: 1,
  words: 0,
  lifetime: 0,
  knowledge: 0,
  helpers: {},                  // id -> count
  upgrades: {},                 // id -> true
  achievements: {},             // id -> true
  books: [],                    // titles read
  bookProgress: 0,
  currentBookTitle: pickTitle(),
  lastSave: Date.now(),
  totalTaps: 0,
  prestiges: 0,
  settings: {
    haptics: true,
    reduceMotion: window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    floaters: true,
  },
});

let state = DEFAULT_STATE();

function pickTitle() {
  return BOOK_TITLES[Math.floor(Math.random() * BOOK_TITLES.length)];
}

function save() {
  state.lastSave = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    setSaveStatus('Saved.');
  } catch (e) {
    setSaveStatus('Could not save (storage full?).');
  }
}
function setSaveStatus(msg) {
  const el = document.getElementById('saveStatus');
  if (el) el.textContent = msg;
}
function load() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return false;
    // shallow merge into a fresh default so missing fields are filled in
    const fresh = DEFAULT_STATE();
    state = Object.assign(fresh, data);
    state.helpers = Object.assign({}, data.helpers || {});
    state.upgrades = Object.assign({}, data.upgrades || {});
    state.achievements = Object.assign({}, data.achievements || {});
    state.books = Array.isArray(data.books) ? data.books : [];
    state.settings = Object.assign(fresh.settings, data.settings || {});
    return true;
  } catch (e) {
    console.warn('save corrupt', e);
    return false;
  }
}

/* ── math helpers ─────────────────────────── */

function helperCount(id) { return state.helpers[id] || 0; }

function costForN(base, owned, n) {
  if (n <= 0) return 0;
  return Math.ceil(base * Math.pow(1.15, owned) * (Math.pow(1.15, n) - 1) / 0.15);
}
function maxAffordable(base, owned, words) {
  if (words <= 0) return 0;
  const v = 1 + words * 0.15 / (base * Math.pow(1.15, owned));
  if (v <= 1) return 0;
  return Math.floor(Math.log(v) / Math.log(1.15));
}

function helperWps(h) {
  let v = h.wps * helperCount(h.id);
  if (state.upgrades['h_' + h.id]) v *= 2;
  return v;
}
function totalWpsRaw() {
  let v = 0;
  for (const h of HELPERS) v += helperWps(h);
  return v;
}
function globalMult() {
  let m = 1 + 0.02 * state.knowledge;
  for (const u of MULT_UPGRADES) if (state.upgrades[u.id]) m *= u.x;
  return m;
}
function totalWps() { return totalWpsRaw() * globalMult(); }

function tapWordsBase() {
  let v = 1;
  for (const u of TAP_UPGRADES) if (state.upgrades[u.id]) v += u.wpc;
  return v;
}
function tapWords() { return tapWordsBase() * globalMult(); }

/* ── prestige ─────────────────────────────── */

function pendingKnowledge() {
  const target = Math.floor(Math.pow(Math.max(0, state.lifetime) / 1e6, 0.5));
  return Math.max(0, target - state.knowledge);
}
function doPrestige() {
  const gain = pendingKnowledge();
  if (gain <= 0) return;
  state.knowledge += gain;
  state.prestiges += 1;
  state.words = 0;
  state.bookProgress = 0;
  state.helpers = {};
  state.upgrades = {};
  state.currentBookTitle = pickTitle();
  toast(`Re-read · +${gain} knowledge`, 'achievement');
  haptic([0, 30, 40, 30]);
  rebuildLists();
  save();
  switchTab('helpers');
}

/* ── books / progress ─────────────────────── */

function currentBookLength() {
  const n = state.books.length;
  // grows gently; first book ~2,000 words, scales with shelf size
  return Math.floor(2000 * (1 + n * 0.1));
}
function completeBook() {
  const title = state.currentBookTitle || pickTitle();
  state.books.push(title);
  state.currentBookTitle = pickTitle();
  toast(`📖 Finished: ${title}`, 'book');
  haptic([0, 12, 30, 12]);
}

/* ── achievements ─────────────────────────── */

function checkAchievements() {
  for (const a of ACHIEVEMENTS) {
    if (state.achievements[a.id]) continue;
    if (a.test(state)) {
      state.achievements[a.id] = true;
      toast(`🏆 ${a.name} — ${a.desc}`, 'achievement');
    }
  }
}

/* ── words gain ───────────────────────────── */

function addWords(amt) {
  if (amt <= 0) return;
  state.words += amt;
  state.lifetime += amt;
  state.bookProgress += amt;
  let safety = 1000; // avoid infinite loops if very fast wps somehow
  while (state.bookProgress >= currentBookLength() && safety-- > 0) {
    state.bookProgress -= currentBookLength();
    completeBook();
  }
}

function spend(cost) {
  if (state.words + 1e-6 < cost) return false;
  state.words -= cost;
  return true;
}

/* ── unlock conditions ────────────────────── */

function helperVisible(h) {
  // Once you've earned at least cost/4 lifetime, the helper appears.
  const idx = HELPERS.indexOf(h);
  if (idx === 0) return true;
  return state.lifetime >= h.base * 0.25 || helperCount(h.id) > 0;
}
function upgradeVisible(u) {
  if (state.upgrades[u.id]) return false;
  if (u.kind === 'tap') {
    const idx = TAP_UPGRADES.indexOf(u);
    return state.lifetime >= u.cost * 0.25 ||
           (idx > 0 && state.upgrades[TAP_UPGRADES[idx - 1].id]);
  }
  if (u.kind === 'mult') {
    return state.lifetime >= (u.req?.lifetime ?? 0);
  }
  if (u.kind === 'helperMult') {
    const need = u.req?.helperCount;
    return need ? helperCount(need.id) >= need.count : true;
  }
  return true;
}

/* ── purchasing ───────────────────────────── */

let buyMode = '1';

function buyHelper(h) {
  const owned = helperCount(h.id);
  let n;
  if (buyMode === 'max') n = Math.max(0, maxAffordable(h.base, owned, state.words));
  else n = parseInt(buyMode, 10) || 1;
  if (n <= 0) return false;
  const cost = costForN(h.base, owned, n);
  if (!spend(cost)) {
    if (buyMode === '1') return false;
    // try to fit fewer
    n = maxAffordable(h.base, owned, state.words);
    if (n <= 0) return false;
    if (!spend(costForN(h.base, owned, n))) return false;
  }
  state.helpers[h.id] = owned + n;
  haptic(20);
  flashItem('helper-' + h.id);
  return true;
}

function buyUpgrade(u) {
  if (state.upgrades[u.id]) return false;
  if (!spend(u.cost)) return false;
  state.upgrades[u.id] = true;
  haptic(25);
  flashItem('upgrade-' + u.id);
  return true;
}

/* ── DOM cache ────────────────────────────── */

const $ = (id) => document.getElementById(id);
const wordsLabel       = $('wordsLabel');
const wpsLabel         = $('wpsLabel');
const wpcLabel         = $('wpcLabel');
const bookFill         = $('bookFill');
const bookTitle        = $('bookTitle');
const bookPct          = $('bookPct');
const booksReadLabel   = $('booksRead');
const knowledgeLabel   = $('knowledgeLabel');
const prestigePending  = $('prestigePending');
const prestigeCurrent  = $('prestigeCurrent');
const prestigeLifetime = $('prestigeLifetime');
const prestigeBtn      = $('prestigeBtn');
const helpersList      = $('helpersList');
const upgradesList     = $('upgradesList');
const shelfList        = $('shelfList');
const floatersEl       = $('floaters');
const bookEl           = $('book');
const toastsEl         = $('toasts');

/* ── rendering: top bar ───────────────────── */

let displayedWords = 0;
function renderTop(dt) {
  // smooth interpolation toward actual
  const target = state.words;
  const diff = target - displayedWords;
  if (Math.abs(diff) < 0.5) displayedWords = target;
  else displayedWords += diff * Math.min(1, dt * 8);
  wordsLabel.textContent = fmt(displayedWords);
  wpsLabel.textContent   = fmtRate(totalWps());
  wpcLabel.textContent   = '+' + fmt(tapWords()) + ' / tap';
  // book progress
  const len = currentBookLength();
  const pct = Math.min(100, (state.bookProgress / len) * 100);
  bookFill.style.width = pct.toFixed(2) + '%';
  bookTitle.textContent = state.currentBookTitle;
  bookPct.textContent   = pct.toFixed(0) + '%';
  booksReadLabel.textContent = state.books.length;
  knowledgeLabel.textContent = state.knowledge;
}

/* ── rendering: lists ─────────────────────── */

let listSignature = '';
function listsSignature() {
  // changes when visible items might change
  return [
    HELPERS.filter(helperVisible).map(h => h.id).join('|'),
    UPGRADES.filter(upgradeVisible).map(u => u.id).join('|'),
    Object.keys(state.helpers).sort().join('|'),
    Object.keys(state.upgrades).sort().join('|'),
    state.books.length,
  ].join('::');
}

function rebuildLists() {
  listSignature = listsSignature();
  renderHelpers();
  renderUpgrades();
  renderOwned();
  renderShelf();
}

function renderHelpers() {
  helpersList.innerHTML = '';
  // build buy-mode toggle once
  const head = helpersList.parentElement.querySelector('.panel-head');
  if (!head.querySelector('.buymode')) {
    const m = document.createElement('div');
    m.className = 'buymode';
    m.innerHTML = `
      <button data-buy="1" class="active">×1</button>
      <button data-buy="10">×10</button>
      <button data-buy="max">Max</button>`;
    m.addEventListener('click', e => {
      const b = e.target.closest('button[data-buy]');
      if (!b) return;
      buyMode = b.dataset.buy;
      m.querySelectorAll('button').forEach(x =>
        x.classList.toggle('active', x === b));
    });
    head.appendChild(m);
  }
  for (const h of HELPERS) {
    if (!helperVisible(h)) continue;
    const owned = helperCount(h.id);
    const li = document.createElement('button');
    li.type = 'button';
    li.className = 'item';
    li.id = 'helper-' + h.id;
    li.innerHTML = `
      <div class="icon">${h.icon}</div>
      <div class="body">
        <div class="name">${h.name}<span class="count">${owned}</span></div>
        <div class="desc">${h.desc}</div>
        <div class="meta-line">${fmt(h.wps)} w/s${state.upgrades['h_'+h.id] ? ' · ×2 trained' : ''}</div>
      </div>
      <div class="right">
        <span class="price"></span>
      </div>`;
    li.addEventListener('click', () => {
      if (buyHelper(h)) {
        renderHelpers(); // owned/count changed
        renderUpgrades(); // new helper-mult upgrades may unlock
      }
    });
    helpersList.appendChild(li);
  }
}

function renderUpgrades() {
  upgradesList.innerHTML = '';
  let any = false;
  for (const u of UPGRADES) {
    if (!upgradeVisible(u)) continue;
    any = true;
    const li = document.createElement('button');
    li.type = 'button';
    li.className = 'item';
    li.id = 'upgrade-' + u.id;
    let metaLine = '';
    if (u.kind === 'tap')        metaLine = `+${fmt(u.wpc)} / tap`;
    else if (u.kind === 'mult')  metaLine = `×${u.x} all production`;
    else if (u.kind === 'helperMult') {
      const h = HELPERS.find(x => x.id === u.helper);
      metaLine = `×${u.x} ${h ? h.name : ''} output`;
    }
    li.innerHTML = `
      <div class="icon">${u.icon}</div>
      <div class="body">
        <div class="name">${u.name}<span class="count badge">${
          u.kind === 'tap' ? 'tap' : u.kind === 'mult' ? 'global' : 'helper'
        }</span></div>
        <div class="desc">${u.desc}</div>
        <div class="meta-line">${metaLine}</div>
      </div>
      <div class="right">
        <span class="price"></span>
      </div>`;
    li.addEventListener('click', () => {
      if (buyUpgrade(u)) {
        renderUpgrades();
        renderOwned();
        renderHelpers(); // mult changes affect helper meta too
      }
    });
    upgradesList.appendChild(li);
  }
  if (!any) {
    const li = document.createElement('li');
    li.className = 'muted small';
    li.style.padding = '12px';
    li.textContent = 'Read more to unlock upgrades.';
    upgradesList.appendChild(li);
  }
}

function renderOwned() {
  const wrap  = document.getElementById('owned');
  const strip = document.getElementById('ownedStrip');
  const count = document.getElementById('ownedCount');
  if (!wrap || !strip) return;
  const owned = UPGRADES.filter(u => state.upgrades[u.id]);
  if (owned.length === 0) { wrap.hidden = true; return; }
  wrap.hidden = false;
  count.textContent = owned.length;
  strip.innerHTML = '';
  // group order: tap, mult, helperMult — same as UPGRADES already
  for (const u of owned) {
    const c = document.createElement('div');
    c.className = 'owned-chip';
    c.dataset.kind = u.kind;
    let detail;
    if (u.kind === 'tap')             detail = `+${fmt(u.wpc)} / tap`;
    else if (u.kind === 'mult')       detail = `×${u.x} all`;
    else if (u.kind === 'helperMult') {
      const h = HELPERS.find(x => x.id === u.helper);
      detail = `×${u.x} ${h ? h.name : 'helper'}`;
    }
    c.title = `${u.name} — ${u.desc} (${detail})`;
    c.setAttribute('aria-label', c.title);
    c.innerHTML =
      `<span class="ico">${u.icon}</span>` +
      `<span>${u.name}</span>`;
    c.addEventListener('click', () => toast(`${u.icon} ${u.name} · ${detail}`));
    strip.appendChild(c);
  }
}

function renderShelf() {
  shelfList.innerHTML = '';
  if (state.books.length === 0) {
    for (let i = 0; i < 8; i++) {
      const li = document.createElement('li');
      li.className = 'empty';
      shelfList.appendChild(li);
    }
    return;
  }
  // show most recent first, cap to 200 for performance
  const slice = state.books.slice(-200).reverse();
  for (const t of slice) {
    const li = document.createElement('li');
    li.title = t;
    li.textContent = t.length > 28 ? t.slice(0, 27) + '…' : t;
    li.style.background = bookSpineColor(t);
    li.style.height = (70 + (hash(t) % 40)) + 'px';
    shelfList.appendChild(li);
  }
}
function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function bookSpineColor(t) {
  const palette = [
    '#7d3a1a', '#4a1f0a', '#5a3a1f', '#7a5a32', '#8b3a2a',
    '#3d4f2a', '#2f4a4a', '#3a3760', '#5b2a4a', '#7a4f2a',
    '#3e2c1a', '#6b3a52',
  ];
  return palette[hash(t) % palette.length];
}

/* ── rendering: per-frame affordability ──── */

function refreshAffordability() {
  // helpers
  for (const h of HELPERS) {
    if (!helperVisible(h)) continue;
    const el = document.getElementById('helper-' + h.id);
    if (!el) continue;
    const owned = helperCount(h.id);
    const n = buyMode === 'max'
      ? Math.max(1, maxAffordable(h.base, owned, state.words))
      : (parseInt(buyMode, 10) || 1);
    const cost = costForN(h.base, owned, n);
    const priceEl = el.querySelector('.price');
    const can = state.words + 1e-6 >= cost;
    if (buyMode === 'max' && maxAffordable(h.base, owned, state.words) === 0) {
      priceEl.textContent = fmt(costForN(h.base, owned, 1));
      el.classList.toggle('affordable', false);
      priceEl.classList.toggle('too', true);
    } else {
      priceEl.textContent = (n > 1 ? `×${n} · ` : '') + fmt(cost);
      el.classList.toggle('affordable', can);
      priceEl.classList.toggle('too', !can);
    }
  }
  // upgrades
  for (const u of UPGRADES) {
    if (!upgradeVisible(u)) continue;
    const el = document.getElementById('upgrade-' + u.id);
    if (!el) continue;
    const can = state.words + 1e-6 >= u.cost;
    el.querySelector('.price').textContent = fmt(u.cost);
    el.classList.toggle('affordable', can);
    el.querySelector('.price').classList.toggle('too', !can);
  }

  // prestige
  const pend = pendingKnowledge();
  prestigePending.textContent  = pend;
  prestigeCurrent.textContent  = state.knowledge;
  prestigeLifetime.textContent = fmt(state.lifetime);
  prestigeBtn.disabled = pend <= 0;
  prestigeBtn.textContent = pend > 0 ? `Re-read · +${pend}` : 'Re-read';

  // tab glow if anything is freshly affordable in another tab
  const helperGlow = HELPERS.some(h => helperVisible(h) &&
    state.words >= costForN(h.base, helperCount(h.id), 1) &&
    helperCount(h.id) === 0); // only first-buy nudges
  const upgradeGlow = UPGRADES.some(u => upgradeVisible(u) &&
    state.words >= u.cost);
  setTabGlow('helpers',  helperGlow);
  setTabGlow('upgrades', upgradeGlow);
  setTabGlow('more',     pend > 0);
}

function setTabGlow(tab, on) {
  const el = document.querySelector(`.tab[data-tab="${tab}"]`);
  if (!el) return;
  if (el.classList.contains('active')) { el.removeAttribute('data-glow'); return; }
  if (on) el.setAttribute('data-glow', '1');
  else    el.removeAttribute('data-glow');
}

function flashItem(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}

/* ── tap juice ────────────────────────────── */

bookEl.addEventListener('pointerdown', e => {
  e.preventDefault();
  const w = tapWords();
  addWords(w);
  state.totalTaps += 1;
  bookEl.classList.add('read');
  if (!state.settings.reduceMotion) {
    bookEl.classList.remove('tap');
    void bookEl.offsetWidth;
    bookEl.classList.add('tap');
  }
  if (state.settings.floaters) spawnFloater(e.clientX, e.clientY, w);
  if (state.settings.floaters && !state.settings.reduceMotion) {
    spawnParticles(e.clientX, e.clientY, w);
  }
  haptic(state.settings.haptics ? 12 : 0);
});

let liveFloaters = 0;
const FLOATER_CAP = 14;
function spawnFloater(clientX, clientY, n) {
  if (liveFloaters >= FLOATER_CAP) return;
  const rect = floatersEl.getBoundingClientRect();
  const el = document.createElement('span');
  const big = n >= tapWordsBase() * 5 || n >= 50;
  el.className = 'floater' + (big ? ' crit' : '');
  el.textContent = '+' + fmt(n);
  // slight randomness so rapid taps don't stack
  const jx = (Math.random() - 0.5) * 30;
  el.style.left = (clientX - rect.left + jx) + 'px';
  el.style.top  = (clientY - rect.top  - 10) + 'px';
  floatersEl.appendChild(el);
  liveFloaters += 1;
  setTimeout(() => { el.remove(); liveFloaters -= 1; }, 950);
}

let liveParticles = 0;
const PARTICLE_CAP = 20;
function spawnParticles(clientX, clientY, n) {
  const count = n >= 100 ? 6 : n >= 10 ? 4 : 2;
  for (let i = 0; i < count; i++) {
    if (liveParticles >= PARTICLE_CAP) return;
    const rect = floatersEl.getBoundingClientRect();
    const el = document.createElement('span');
    el.className = 'particle';
    el.style.left = (clientX - rect.left) + 'px';
    el.style.top  = (clientY - rect.top)  + 'px';
    const a = (Math.random() * Math.PI) - Math.PI; // upward fan
    const d = 30 + Math.random() * 40;
    el.style.setProperty('--dx', (Math.cos(a) * d).toFixed(1) + 'px');
    el.style.setProperty('--dy', (Math.sin(a) * d - 30).toFixed(1) + 'px');
    el.style.setProperty('--r',  ((Math.random() * 360 - 180)|0) + 'deg');
    floatersEl.appendChild(el);
    liveParticles += 1;
    setTimeout(() => { el.remove(); liveParticles -= 1; }, 720);
  }
}

function haptic(pattern) {
  if (!state.settings.haptics) return;
  if (typeof navigator.vibrate !== 'function') return;
  try { navigator.vibrate(pattern); } catch (_) {}
}

/* ── toasts ───────────────────────────────── */

function toast(msg, kind) {
  const el = document.createElement('div');
  el.className = 'toast' + (kind ? ' ' + kind : '');
  el.textContent = msg;
  toastsEl.appendChild(el);
  setTimeout(() => el.remove(), 3000);
  // if there are too many, drop the oldest
  while (toastsEl.children.length > 4) toastsEl.firstElementChild.remove();
}

/* ── tabs ─────────────────────────────────── */

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => {
    const on = t.dataset.tab === name;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on ? 'true' : 'false');
    if (on) t.removeAttribute('data-glow');
  });
  document.querySelectorAll('.panel-page').forEach(p => {
    p.classList.toggle('hidden', p.dataset.page !== name);
  });
  // rebuild library each time it's opened (cheap, ensures freshness)
  if (name === 'library') renderShelf();
}
document.getElementById('tabs').addEventListener('click', e => {
  const t = e.target.closest('.tab');
  if (!t) return;
  switchTab(t.dataset.tab);
});

/* ── settings ─────────────────────────────── */

function bindToggle(id, key) {
  const el = document.getElementById(id);
  el.checked = !!state.settings[key];
  el.addEventListener('change', () => {
    state.settings[key] = el.checked;
    if (key === 'reduceMotion')
      document.body.classList.toggle('reduce-motion', el.checked);
    save();
  });
}

document.getElementById('prestigeBtn').addEventListener('click', () => {
  if (pendingKnowledge() <= 0) return;
  if (!confirm('Re-read with new eyes?\n\n' +
    'You’ll lose your words, helpers, and upgrades, but gain ' +
    pendingKnowledge() + ' permanent knowledge (+' +
    (pendingKnowledge() * 2) + '% to all production forever).')) return;
  doPrestige();
});

document.getElementById('wipeBtn').addEventListener('click', () => {
  if (!confirm('Erase your save? This cannot be undone.')) return;
  localStorage.removeItem(SAVE_KEY);
  state = DEFAULT_STATE();
  document.body.classList.toggle('reduce-motion', !!state.settings.reduceMotion);
  rebuildLists();
  toast('Save wiped. Fresh page.', 'achievement');
  save();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const text = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
  openIO('Export save', text, false);
});
document.getElementById('importBtn').addEventListener('click', () => {
  openIO('Import save', '', true);
});

const ioDialog  = document.getElementById('ioDialog');
const ioText    = document.getElementById('ioText');
const ioTitle   = document.getElementById('ioTitle');
const ioConfirm = document.getElementById('ioConfirm');
let ioImporting = false;

function openIO(title, value, importing) {
  ioTitle.textContent = title;
  ioText.value = value;
  ioText.readOnly = !importing;
  ioImporting = importing;
  ioConfirm.textContent = importing ? 'Import' : 'Copy';
  if (typeof ioDialog.showModal === 'function') ioDialog.showModal();
  else ioDialog.setAttribute('open', '');
  if (!importing) {
    ioText.focus();
    ioText.select();
  }
}
ioDialog.addEventListener('close', () => {
  if (ioDialog.returnValue !== 'ok') return;
  if (!ioImporting) {
    try { navigator.clipboard?.writeText(ioText.value); } catch (_) {}
    toast('Save copied to clipboard.');
    return;
  }
  try {
    const json = decodeURIComponent(escape(atob(ioText.value.trim())));
    const data = JSON.parse(json);
    if (!data || typeof data !== 'object') throw new Error('bad save');
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    if (load()) {
      document.body.classList.toggle('reduce-motion', !!state.settings.reduceMotion);
      rebuildLists();
      toast('Save imported.', 'achievement');
    }
  } catch (e) {
    toast('Could not parse save.', 'achievement');
  }
});

/* ── main loop ────────────────────────────── */

let lastFrame = performance.now();
let achTimer = 0;
let saveTimer = 0;
let listTimer = 0;

function frame(now) {
  const dt = Math.min(0.5, (now - lastFrame) / 1000);
  lastFrame = now;
  const wps = totalWps();
  if (wps > 0) addWords(wps * dt);

  renderTop(dt);
  refreshAffordability();

  achTimer += dt;
  if (achTimer > 0.5) { achTimer = 0; checkAchievements(); }

  listTimer += dt;
  if (listTimer > 1.5) {
    listTimer = 0;
    const sig = listsSignature();
    if (sig !== listSignature) rebuildLists();
  }

  saveTimer += dt;
  if (saveTimer > 5) { saveTimer = 0; save(); }

  requestAnimationFrame(frame);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) save();
});
window.addEventListener('beforeunload', save);

/* ── offline progress ─────────────────────── */

function applyOfflineProgress() {
  const now = Date.now();
  const elapsed = Math.max(0, Math.min(24 * 3600, (now - state.lastSave) / 1000));
  if (elapsed < 30) return;
  const wps = totalWps();
  if (wps <= 0) return;
  const earned = wps * elapsed * 0.5; // 50% efficiency offline
  if (earned <= 0) return;
  addWords(earned);
  toast(`While you were away · +${fmt(earned)} words`, 'achievement');
}

/* ── init ─────────────────────────────────── */

function init() {
  const had = load();
  document.body.classList.toggle('reduce-motion', !!state.settings.reduceMotion);
  bindToggle('setHaptics', 'haptics');
  bindToggle('setReduceMotion', 'reduceMotion');
  bindToggle('setFloaters', 'floaters');
  rebuildLists();
  if (had) applyOfflineProgress();
  displayedWords = state.words;
  if (!had) {
    toast('Welcome. Tap the book to start reading.', 'book');
  }
  requestAnimationFrame(frame);
}

// Add styles for the buy-mode toggle inline so we don't need a CSS round-trip.
(() => {
  const css = `
    .buymode { display: inline-flex; gap: 4px; margin-top: 6px;
      background: var(--paper-2); padding: 3px; border-radius: 999px;
      border: 1px solid var(--line); }
    .buymode button { -webkit-appearance: none; appearance: none;
      background: transparent; border: 0; padding: 6px 12px;
      border-radius: 999px; font: inherit; font-weight: 600; font-size: 12px;
      color: var(--muted); cursor: pointer; }
    .buymode button.active { background: var(--accent); color: #fff; }
    @media (prefers-color-scheme: dark) { .buymode button.active { color: #1a1410; } }
  `;
  const s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);
})();

init();

})();
