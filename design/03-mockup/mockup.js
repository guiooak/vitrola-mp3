/* Vitrola Mp3 clickable mockup.
   Only for validating screens and interactions: none of this is app code. */
(() => {
'use strict';

const D = window.DATA;
const T = window.TOKENS;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const screensEl = $('#screens');
const npEl = $('#np');
const overlayEl = $('#overlay');
const driveEl = document.createElement('div'); driveEl.className = 'drive'; driveEl.id = 'drive'; driveEl.setAttribute('aria-hidden', 'true');
$('#np').after(driveEl);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOCALE = 'en-US';

/* ============================================================
   Utilities
   ============================================================ */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const plural = (n, one, many) => `${n.toLocaleString(LOCALE)} ${n === 1 ? one : many}`;
function totalDuration(sec) {
  const min = Math.round(sec / 60);
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`;
}
let _uid = 0; const uid = () => ++_uid;
const clone = o => JSON.parse(JSON.stringify(o));
const shuffled = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function highlight(text, q) {
  if (!q) return esc(text);
  const i = norm(text).indexOf(norm(q));
  if (i < 0) return esc(text);
  return esc(text.slice(0, i)) + `<mark class="hl">${esc(text.slice(i, i + q.length))}</mark>` + esc(text.slice(i + q.length));
}

/* ============================================================
   State
   ============================================================ */
const INITIAL_STATE = () => ({
  configured: false,
  folders: [],
  subfolders: true,
  resume: true,
  pauseOnUnplug: true,
  useFolderImages: true,
  playlists: clone(D.playlists),
  favoriteSongs: new Set(D.favoriteSongs),
  favoriteAlbums: new Set(D.favoriteAlbums),
  recentSearches: ['Milton', 'Águas de Março', 'Caetano'],
  libTab: 'artists', // default filter when the app opens
  sort: 'az',
  showAllSongs: false,
  // player
  queue: [], originalQueue: [], idx: 0, playing: false, pos: 0,
  shuffle: false, repeat: 0, source: null,
  timer: null,
  lyricsOpen: false, // the lyrics view replaces the record in Now playing
  lyricsAutoScroll: true, // global setting, saved: synced lyrics follow the song
  spinRecord: true, // global setting, saved (D25): when off, the record stays still
  // driving mode (D24): manual, or automatic when the chosen car's Bluetooth connects
  drive: { on: false, tab: 'playing', sub: null, auto: false, car: null, autoEntered: false, btGranted: false, landscape: false },
  // equalizer (D23): global, saved; hidden on Android 8
  eq: { on: false, preset: 'flat', bands: Array(10).fill(0), custom: Array(10).fill(0), bass: 0 },
  angle: 0, spinningSince: 0,
});
let S = INITIAL_STATE();

const album = id => D.albums.find(a => a.id === id);
const song = id => D.songs.find(m => m.id === id);
const current = () => S.queue.length ? song(S.queue[S.idx]) : null;

function inLibrary(m) {
  return S.folders.some(p => S.subfolders ? (m.folder === p.path || m.folder.startsWith(p.path + '/')) : m.folder === p.path);
}
const library = () => D.songs.filter(inLibrary);
const visibleAlbums = () => D.albums.filter(a => library().some(m => m.album === a.id));
function artists() {
  const map = new Map();
  library().forEach(m => {
    if (!map.has(m.artist)) map.set(m.artist, { name: m.artist, songs: [], albums: new Set() });
    const a = map.get(m.artist); a.songs.push(m.id); a.albums.add(m.album);
  });
  // "Unknown artist" (files without metadata) always goes last
  const last = a => a.name === 'Unknown artist' ? 1 : 0;
  return [...map.values()].sort((a, b) => last(a) - last(b) || a.name.localeCompare(b.name, LOCALE));
}
const songsInFolder = (folder, sub) => library().filter(m => sub ? (m.folder === folder || m.folder.startsWith(folder + '/')) : m.folder === folder);
function subfoldersOf(folder) {
  const set = new Set();
  library().forEach(m => { if (m.folder.startsWith(folder + '/')) set.add(m.folder.slice(folder.length + 1).split('/')[0]); });
  return [...set].sort((a, b) => a.localeCompare(b, LOCALE));
}

/* ============================================================
   Covers and photos
   ============================================================ */
const P = T.primitives;
// Generated cover (no image in the folder): same rule as the style guide
const COMBOS = [
  [P.wine[600], P.neutral[100], P.mustard[400]], [P.mustard[400], P.neutral[900], P.wine[600]],
  [P.neutral[900], P.mustard[300], P.wine[400]], [P.neutral[100], P.wine[600], P.mustard[500]],
  [P.neutral[700], P.neutral[100], P.mustard[400]], [P.wine[800], P.mustard[300], P.neutral[100]],
];
// Colors for simulated "real" images from the folders
const PHOTO_COLORS = [['#1F3A5F', '#E8B04B'], ['#0F5257', '#F2C57C'], ['#5B2333', '#F7B267'], ['#2D3A2E', '#D9C5A0'],
  ['#3B1F4A', '#F28C8C'], ['#7A3E1D', '#F4D35E'], ['#24476B', '#9AD1D4'], ['#4A3B2A', '#E07A5F']];
const hash = s => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const initials = s => s.split(/\s+/).filter(w => w.length > 2 || /^[A-Z0-9]/.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const hasImage = x => S.useFolderImages && !!(x.url || x.cover || x.photo);
const albumColor = a => a.noMetadata ? P.neutral[500]
  : (S.useFolderImages && a.cover) ? PHOTO_COLORS[hash(a.title + '#') % PHOTO_COLORS.length][0]
  : COMBOS[hash(a.title) % COMBOS.length][0];

// Album cover: image from the album folder (simulated) → generated cover (fallback)
function folderCover(a) {
  // Simulates a real, photographic cover: varied colors and shapes, with a small title
  const h = hash(a.title + '#'); const [c1, c2] = PHOTO_COLORS[h % PHOTO_COLORS.length];
  const shapes = [
    `<circle cx="${120 + h % 40}" cy="${70 + h % 30}" r="58" fill="${c2}"/><rect y="132" width="200" height="68" fill="#000" fill-opacity=".28"/><rect y="148" width="200" height="6" fill="${c2}" fill-opacity=".5"/>`,
    [0, 1, 2, 3, 4].map(i => `<polygon points="${-40 + i * 56},200 ${i * 56},200 ${100 + i * 56},0 ${60 + i * 56},0" fill="${c2}" fill-opacity="${0.15 + (i % 2) * 0.35}"/>`).join(''),
    [80, 60, 40, 20].map((r, i) => `<rect x="${100 - r}" y="${100 - r}" width="${r * 2}" height="${r * 2}" fill="${i % 2 ? c1 : c2}" transform="rotate(${12 + h % 30} 100 100)"/>`).join(''),
  ][h % 3];
  return `<rect width="200" height="200" fill="${c1}"/>${shapes}
    <text x="14" y="26" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="15" fill="#FFFDF8" fill-opacity=".92">${esc(a.title)}</text>`;
}
function generatedCover(a) {
  if (a.noMetadata) {
    return `<rect width="200" height="200" fill="${P.neutral[300]}"/>
      ${[80, 60, 40].map(r => `<circle cx="100" cy="100" r="${r}" fill="none" stroke="${P.neutral[500]}" stroke-opacity=".35" stroke-width="8"/>`).join('')}
      <path d="M112 62v52a16 16 0 1 1-8-14V70h-20V62z" fill="${P.neutral[600]}"/>`;
  }
  const h = hash(a.title); const [bg, fg, ac] = COMBOS[h % COMBOS.length];
  const cx = 30 + (h >> 3) % 140, cy = 30 + (h >> 7) % 140;
  return `<rect width="200" height="200" fill="${bg}"/>
    ${[150, 120, 90, 60].map((r, i) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${fg}" stroke-opacity="${0.08 + i * 0.04}" stroke-width="10"/>`).join('')}
    <circle cx="${cx}" cy="${cy}" r="14" fill="${ac}"/>
    <text x="100" y="122" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="800" font-size="60" fill="${fg}">${esc(initials(a.title))}</text>`;
}
function coverInner(a) {
  if (S.useFolderImages && a.url) return `<image href="${esc(a.url)}" width="200" height="200" preserveAspectRatio="xMidYMid slice"/>`;
  if (S.useFolderImages && a.cover) return folderCover(a);
  return generatedCover(a);
}
const cover = a => `<svg viewBox="0 0 200 200" aria-hidden="true">${coverInner(a)}</svg>`;

// Artist photo: image from the artist folder (simulated) → first album cover (fallback)
const artistInfo = name => D.artists.find(a => a.name === name) || { name, photo: null };
function folderPhoto(info) {
  // Simulates a portrait: colored background, light and silhouette
  const h = hash(info.name + '@'); const [c1, c2] = PHOTO_COLORS[h % PHOTO_COLORS.length];
  return `<rect width="200" height="200" fill="${c1}"/>
    <circle cx="${130 + h % 40}" cy="${40 + h % 30}" r="80" fill="${c2}" fill-opacity=".35"/>
    <circle cx="100" cy="86" r="36" fill="#000" fill-opacity=".42"/>
    <path d="M24 210 C30 146 66 128 100 128 C134 128 170 146 176 210 Z" fill="#000" fill-opacity=".42"/>`;
}
function photoInner(name) {
  const info = artistInfo(name);
  if (S.useFolderImages && info.url) return `<image href="${esc(info.url)}" width="200" height="200" preserveAspectRatio="xMidYMin slice"/>`;
  if (S.useFolderImages && info.photo) return folderPhoto(info);
  const first = D.albums.find(a => a.artistName === name && library().some(m => m.album === a.id)) || D.albums.find(a => a.artistName === name);
  return first ? coverInner(first) : generatedCover({ title: name });
}
// Record label (D26): album image → artist image → the generated cover (the usual fallback look)
function labelInner(a) {
  if (a.noMetadata || hasImage(a)) return coverInner(a);
  const info = artistInfo(a.artistName);
  if (S.useFolderImages && (info.url || info.photo)) return photoInner(a.artistName);
  return coverInner(a);
}
const photo = (name, fit = 'xMidYMid slice') => `<svg viewBox="0 0 200 200" preserveAspectRatio="${fit}" aria-hidden="true">${photoInner(name)}</svg>`;

// Artist and album folders (to show the right image while browsing folders)
const artistOfFolder = c => D.artists.find(a => a.folder === c);
const albumOfFolder = c => D.albums.find(a => a.folder === c && !a.noMetadata);
function folderThumb(c, icon = 'folder') {
  const ar = artistOfFolder(c); if (ar) return `<div class="ic round">${photo(ar.name)}</div>`;
  const al = albumOfFolder(c); if (al) return `<div class="ic">${cover(al)}</div>`;
  return `<div class="ic">${iconHtml(icon)}</div>`;
}
// Images picked for a folder (D19 rule is applied in data.js)
function folderImages(c) {
  const ar = artistOfFolder(c), al = albumOfFolder(c), out = [];
  if (ar && ar.photo) out.push({ file: ar.photo, use: 'artist photo', only: ar.photoReason === 'only' });
  if (al && al.cover) out.push({ file: al.cover, use: 'album cover', only: al.coverReason === 'only' });
  return out;
}
// Every image file in a folder (for the system picker and the folder page)
function allFolderImages(c) {
  const ar = artistOfFolder(c), al = albumOfFolder(c);
  return [...(ar ? ar.images : []), ...(al ? al.images : [])];
}

/* ============================================================
   Record with tonearm (player, welcome, scan)
   ============================================================ */
function record({ a = null, withArm = true, player = false, demo = false } = {}) {
  const id = uid();
  const cx = withArm ? 150 : 100, cy = withArm ? 160 : 100, R = withArm ? 130 : 96, L = withArm ? 50 : 38;
  const vb = withArm ? '0 0 320 300' : '0 0 200 200';
  const grooves = [];
  for (let r = R - 10; r > L + 6; r -= (withArm ? 9 : 8)) grooves.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" style="stroke:var(--color-groove)" stroke-width="1.3" stroke-opacity="${grooves.length % 2 ? .55 : 1}"/>`);
  const label = a
    ? `<g clip-path="url(#lb${id})"><svg x="${cx - L}" y="${cy - L}" width="${L * 2}" height="${L * 2}" viewBox="0 0 200 200">${labelInner(a)}</svg></g>`
    : `<circle cx="${cx}" cy="${cy}" r="${L}" fill="#7A1F2B"/>`;
  const armSvg = withArm ? `
    <g class="tonearm" style="transform-origin:296px 24px">
      <rect x="288" y="0" width="16" height="15" rx="4" fill="#8E8676"/>
      <path d="M296 24 L282 150 L240 190" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" transform="translate(3 4)"/>
      <path d="M296 24 L282 150 L240 190" fill="none" stroke="#CFC8B8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="228" y="183" width="24" height="14" rx="3.5" transform="rotate(-45 240 190)" fill="#E0A526"/>
      <circle cx="296" cy="24" r="17" fill="#8E8676"/><circle cx="296" cy="24" r="12.5" fill="#E0A526"/><circle cx="296" cy="24" r="5" fill="#1B1714"/>
    </g>` : '';
  return `<svg viewBox="${vb}" class="${demo ? 'demo' : ''}" ${player ? 'data-record' : ''} aria-hidden="true">
    <defs><clipPath id="lb${id}"><circle cx="${cx}" cy="${cy}" r="${L}"/></clipPath></defs>
    <g class="rotor" style="transform-origin:${cx}px ${cy}px">
      <circle cx="${cx}" cy="${cy}" r="${R}" style="fill:var(--color-record)"/>
      <circle cx="${cx}" cy="${cy}" r="${R - 1.5}" fill="none" stroke="#6A5B50" stroke-width="3"/>
      ${grooves.join('')}
      <path d="M${cx - R * .78} ${cy - R * .34} A${R * .85} ${R * .85} 0 0 1 ${cx - R * .34} ${cy - R * .78}" fill="none" stroke="#fff" stroke-opacity=".17" stroke-width="${withArm ? 10 : 8}" stroke-linecap="round"/>
      <path d="M${cx + R * .78} ${cy + R * .34} A${R * .85} ${R * .85} 0 0 1 ${cx + R * .34} ${cy + R * .78}" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="${withArm ? 10 : 8}" stroke-linecap="round"/>
      ${label}
      <circle cx="${cx}" cy="${cy}" r="${L}" fill="none" stroke="#E0A526" stroke-width="2" stroke-opacity=".85"/>
      <circle cx="${cx}" cy="${cy}" r="${withArm ? 5 : 4}" style="fill:var(--color-background)"/>
    </g>
    ${armSvg}
  </svg>`;
}

/* Continuous rotation of the player records: the angle is global, so the
   mini player and the full screen spin together and never "jump" on re-render. */
const TURN = T.motion.duration['record-spin'];
const currentAngle = () => S.playing && S.spinRecord && !scratch ? S.angle + (performance.now() - S.spinningSince) / TURN * 360 : S.angle;
// When the record stops (pause, or "Spinning record" turned off) it coasts to the next upright
// angle, so the label image always rests in its normal position (D26). The coast starts at the
// spinning speed and eases out; the stop angle is a multiple of 360°.
const SPIN_SPEED = 360 / TURN; // degrees per ms
function coastTo(cur) {
  const to = Math.ceil((cur + 30) / 360) * 360;
  const dist = to - cur, dur = 600 + dist * 3;
  const y1 = Math.min(1, SPIN_SPEED * dur / dist * 0.25); // initial slope matches the spinning speed
  S.coast = { from: cur, to, dur, easing: `cubic-bezier(.25,${y1.toFixed(3)},.4,1)` };
  return to;
}
// Tonearm (D27): on the record whenever music plays (also while the record is held); back at its
// rest, off the record, when playback stops and waits for the user. A freshly drawn record starts
// from the position last shown, so the arm always moves with its 700 ms animation.
let armShown = false;
function syncRecords(slowDown = false, scope = document) {
  const coast = slowDown ? S.coast : null;
  if (slowDown) S.coast = null;
  $$('svg[data-record]', scope).forEach(svg => {
    const g = $('.rotor', svg);
    if (!svg.dataset.armReady) { svg.classList.toggle('down', armShown); svg.getBoundingClientRect(); svg.dataset.armReady = '1'; }
    svg.classList.toggle('down', S.playing);
    svg.classList.toggle('scratchable', S.playing && S.spinRecord && !reduceMotion);
    if (scratch) { g.style.animation = 'none'; g.style.transform = `rotate(${S.angle}deg)`; return; }
    if (S.playing && S.spinRecord && !reduceMotion) {
      g.style.transform = '';
      g.style.animation = `spin ${TURN}ms linear ${-((currentAngle() % 360) / 360) * TURN}ms infinite`;
      return;
    }
    g.style.animation = 'none';
    if (coast && !reduceMotion) g.animate([{ transform: `rotate(${coast.from}deg)` }, { transform: `rotate(${coast.to}deg)` }], { duration: coast.dur, easing: coast.easing });
    g.style.transform = `rotate(${S.angle}deg)`;
  });
}

/* Touching the record (D27) — a playful gesture, not a control. While music plays and the record
   spins, a finger on the big record in Now playing holds it: the music stops. Turning it faster or
   slower than normal speeds the music up or slows it down (rate = finger speed / normal speed,
   0–3×; turning backwards counts as holding). Letting go returns to normal playback and spin. */
let scratch = null;
function bindScratch(svg) {
  const C = { x: 150, y: 160 }, R = 130; // disc center and radius in the record's viewBox
  const toView = ev => { const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
  const angleAt = v => Math.atan2(v.y - C.y, v.x - C.x) * 180 / Math.PI;
  const rateEl = $('.scratch-rate', svg.parentElement);
  const showRate = r => { if (!rateEl) return; rateEl.textContent = r < 0.05 ? 'Held' : `${r.toFixed(1)}×`; };
  const tick = () => {
    if (!scratch) return;
    const idle = performance.now() - scratch.lastMove;
    if (idle > 80) scratch.rate *= 0.6; // finger still → the music stops
    showRate(scratch.rate);
    scratch.raf = requestAnimationFrame(tick);
  };
  svg.addEventListener('pointerdown', ev => {
    if (!S.playing || !S.spinRecord || reduceMotion || scratch) return;
    const v = toView(ev);
    if (Math.hypot(v.x - C.x, v.y - C.y) > R) return; // only on the record itself
    ev.preventDefault();
    svg.setPointerCapture(ev.pointerId);
    S.angle = S.angle + (performance.now() - S.spinningSince) / TURN * 360; // freeze where it is
    scratch = { id: ev.pointerId, last: angleAt(v), lastMove: performance.now(), rate: 0 };
    svg.classList.add('scratching'); rateEl && rateEl.classList.add('on');
    syncRecords(); tick();
  });
  svg.addEventListener('pointermove', ev => {
    if (!scratch || ev.pointerId !== scratch.id) return;
    const now = performance.now(), a = angleAt(toView(ev));
    let d = a - scratch.last; if (d > 180) d -= 360; if (d < -180) d += 360;
    const dt = Math.max(1, now - scratch.lastMove);
    scratch.last = a; scratch.lastMove = now;
    S.angle += d;
    $$('svg[data-record] .rotor').forEach(g => { g.style.transform = `rotate(${S.angle}deg)`; });
    const r = Math.max(0, Math.min(3, (d / dt) / SPIN_SPEED));
    scratch.rate = scratch.rate * 0.7 + r * 0.3;
    // the music moves with the record: one turn = 1.8 s of the song (backwards = held)
    const m = current();
    if (m && d > 0) { S.pos = Math.min(m.duration - 0.5, S.pos + d / 360 * TURN / 1000); updateProgress(); }
  });
  const release = ev => {
    if (!scratch || ev.pointerId !== scratch.id) return;
    cancelAnimationFrame(scratch.raf);
    scratch = null;
    svg.classList.remove('scratching'); rateEl && rateEl.classList.remove('on');
    S.spinningSince = performance.now(); // back to normal speed from where it was let go
    syncRecords();
  };
  svg.addEventListener('pointerup', release);
  svg.addEventListener('pointercancel', release);
}

/* ============================================================
   Navigation
   ============================================================ */
let stack = [];
let currentScreen = null;
let contexts = {}; // playable lists on the current screen

function go(name, params = {}, anim = 'push') {
  stack.push({ name, params });
  render(anim);
}
function back() {
  if (closeOverlay()) return;
  if (S.drive.on) return S.drive.sub ? (S.drive.sub = null, renderDrive()) : exitDrive();
  if (npEl.classList.contains('open')) return S.lyricsOpen ? toggleLyrics(false) : closeNowPlaying();
  if (stack.length > 1) { stack.pop(); render('pop'); }
}
function tab(name) {
  if (stack[0] && stack[0].name === name && stack.length === 1) { const sc = $('.screen', screensEl); sc && sc.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  stack = [{ name, params: {} }];
  render('fade');
}
function root(name, params = {}) { stack = [{ name, params }]; render('fade'); }

function render(anim = 'fade') {
  const { name, params } = stack[stack.length - 1];
  const def = SCREENS[name];
  contexts = {};
  const old = $('.screen:last-child', screensEl);
  const el = document.createElement('div');
  el.className = 'screen';
  el.innerHTML = def.render(params);
  screensEl.appendChild(el);
  if (old) {
    if (anim === 'push') { el.classList.add('push-in'); old.classList.add('push-out'); }
    else if (anim === 'pop') { el.classList.add('pop-in'); old.classList.add('pop-out'); }
    else el.classList.add('fade-in');
    const delay = anim === 'none' ? 0 : T.motion.duration.medium + 30;
    setTimeout(() => old.remove(), delay);
    $$('.screen', screensEl).slice(0, -2).forEach(s => s.remove());
  }
  currentScreen = name;
  def.mount && def.mount(el, params);
  const bar = $('.topbar', el);
  if (bar) el.addEventListener('scroll', () => bar.classList.toggle('scrolled', el.scrollTop > 4), { passive: true });
  updateChrome();
  markActive();
  markFavorites();
  syncRecords();
  updatePanel(def.key ? def.key(params) : name);
}

function updateChrome() {
  const def = SCREENS[currentScreen];
  $('#bottom').hidden = !!def.noChrome;
  const rootName = stack[0] && stack[0].name;
  $$('#bnav button').forEach(b => b.dataset.tab === rootName ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
  renderMini();
  positionSnackbar();
}

/* Playable list: stores the ids so a click knows what to play */
function ctx(ids, source) { const k = 'c' + uid(); contexts[k] = { ids, source }; return k; }

/* ============================================================
   UI pieces
   ============================================================ */
const iconHtml = (n, extra = '') => `<span class="ms ${extra}">${n}</span>`;
const topbar = (title, { back: showBack = true, actions = '', small = false, overPhoto = false } = {}) => `
  <header class="topbar ${overPhoto ? 'over-photo' : ''}">
    ${showBack ? `<button class="icon-btn" data-action="back" aria-label="Back">${iconHtml('arrow_back')}</button>` : ''}
    <h1 class="${small ? 'small' : ''}">${title}</h1>${actions}
  </header>`;
const eq = '<div class="eq"><i></i><i></i><i></i></div>';

function songRow(m, k, i, { numbered = false, q = '' } = {}) {
  const a = album(m.album);
  return `<div class="track" data-mid="${m.id}" data-action="play-from" data-ctx="${k}" data-i="${i}" tabindex="0">
    ${numbered ? `<div class="num"><span class="n">${m.number}</span>${eq}</div>` : `<div class="cover">${cover(a)}${eq}</div>`}
    <div style="min-width:0"><div class="ti">${highlight(m.title, q)}</div><div class="ar">${numbered ? subtitleFor(m) : highlight(m.artist, q)}</div></div>
    <span class="du">${iconHtml('favorite', 'fill fav-mini')}${fmt(m.duration)}</span>
    <button class="icon-btn" data-action="menu" data-mid="${m.id}" aria-label="More options for ${esc(m.title)}">${iconHtml('more_vert')}</button>
  </div>`;
}
const subtitleFor = m => album(m.album).noMetadata ? esc(m.file) : esc(m.artist);

function albumCard(a) {
  return `<div class="album" data-action="album" data-id="${a.id}" tabindex="0">
    <div class="art">${cover(a)}<span class="fav-badge" aria-label="Favorite album">${iconHtml('favorite', 'fill')}</span></div>
    <div class="ti">${esc(a.title)}</div>
    <div class="ar">${esc(a.artistName)}${a.year ? ' · ' + a.year : ''}</div>
  </div>`;
}
function emptyRecord(title, text, button = true) {
  return `<div class="empty">
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="84" fill="none" style="stroke:var(--color-border-strong)" stroke-width="2" stroke-dasharray="6 6"/>
      <circle cx="100" cy="100" r="58" style="fill:var(--color-surface-2)"/>
      <circle cx="100" cy="100" r="40" fill="none" style="stroke:var(--color-border)" stroke-width="2"/>
      <circle cx="100" cy="100" r="18" style="fill:var(--color-primary-container)"/>
      <circle cx="100" cy="100" r="4" style="fill:var(--color-primary)"/>
    </svg>
    <h3>${title}</h3><p>${text}</p>
    ${button ? `<button class="btn btn-primary" data-action="choose-folder">${iconHtml('folder_open')}Choose folder</button>` : ''}
  </div>`;
}
const playActions = (k, albumId) => `<div class="detail-actions">
  <button class="btn btn-accent" data-action="play-all" data-ctx="${k}">${iconHtml('play_arrow', 'fill')}Play</button>
  <button class="btn btn-tonal" data-action="shuffle-all" data-ctx="${k}">${iconHtml('shuffle')}Shuffle</button>
  ${albumId ? favoriteAlbumButton(albumId) : ''}
</div>`;
function favoriteAlbumButton(id) {
  const on = S.favoriteAlbums.has(id);
  return `<button class="icon-btn fav-album ${on ? 'fav-on' : ''}" data-action="favorite-album" data-id="${id}" aria-pressed="${on}" aria-label="${on ? 'Remove from favorite albums' : 'Add to favorite albums'}">${iconHtml('favorite', on ? 'fill' : '')}</button>`;
}
// Updates the hearts on screen without re-rendering (keeps the scroll position)
function markFavorites() {
  $$('.track[data-mid]').forEach(r => r.classList.toggle('fav', S.favoriteSongs.has(r.dataset.mid)));
  $$('.album[data-id]').forEach(c => c.classList.toggle('fav', S.favoriteAlbums.has(c.dataset.id)));
  $$('[data-action="favorite-album"]').forEach(b => {
    const on = S.favoriteAlbums.has(b.dataset.id);
    b.classList.toggle('fav-on', on); b.setAttribute('aria-pressed', on);
    b.setAttribute('aria-label', on ? 'Remove from favorite albums' : 'Add to favorite albums');
    const ic = $('.ms', b); ic && ic.classList.toggle('fill', on);
  });
}

/* ============================================================
   Screens
   ============================================================ */
const SORTS = { az: 'A–Z', recent: 'Recently added', plays: 'Most played' };
function sortSongs(ms) {
  ms = ms.slice();
  if (S.sort === 'az') ms.sort((a, b) => a.title.localeCompare(b.title, LOCALE));
  if (S.sort === 'recent') ms.reverse();
  if (S.sort === 'plays') ms.sort((a, b) => b.plays - a.plays);
  return ms;
}

const SCREENS = {
  /* ---------- 1. Welcome ---------- */
  'welcome': {
    noChrome: true,
    render: () => `<div class="welcome">
      <div class="hero">
        ${record({ demo: true })}
        <h1>Vitrola <span>Mp3</span></h1>
        <p>Your music, your way. No account, no internet, no ads.</p>
      </div>
      <div class="promises">
        <div>${iconHtml('folder_special')}<span><b>Only the folders you choose</b>WhatsApp audio and voice recordings stay out.</span></div>
        <div>${iconHtml('headphones')}<span><b>Plays with the screen off</b>Controls in the notification, on the lock screen and on your headphones.</span></div>
        <div>${iconHtml('lock')}<span><b>Nothing leaves your phone</b>No account and no data collection.</span></div>
      </div>
      <button class="btn btn-primary" style="width:100%" data-action="choose-folder" data-origin="onboarding">${iconHtml('folder_open')}Choose music folder</button>
    </div>`,
    mount: el => { const svg = $('svg', el); setTimeout(() => svg.classList.add('down'), 500); },
  },

  /* ---------- 3. Scan ---------- */
  'scan': {
    noChrome: true,
    render: () => `<div class="scan" id="scan">
      ${record({ demo: true })}
      <h2>Looking for songs…</h2>
      <div class="count" id="scan-count">0 songs</div>
      <div class="bar"><i id="scan-bar"></i></div>
      <div class="file" id="scan-file"></div>
    </div>`,
    mount: el => {
      const svg = $('svg', el); svg.classList.add('down');
      const list = library();
      const total = list.length;
      let i = 0;
      const step = Math.max(40, 2400 / Math.max(total, 1));
      const t = setInterval(() => {
        if (!el.isConnected) return clearInterval(t);
        if (i < total) {
          i++;
          $('#scan-count', el).textContent = `${plural(i, 'song', 'songs')}`;
          $('#scan-bar', el).style.width = (i / total * 100) + '%';
          const m = list[i - 1]; const im = folderImages(m.folder)[0];
          $('#scan-file', el).textContent = m.number === 1 && im && S.useFolderImages ? `${m.folder}/${im.file}` : `${m.folder}/${m.file}`;
          return;
        }
        clearInterval(t);
        const scan = $('#scan', el);
        if (!total) {
          scan.innerHTML = emptyRecord('No music here', `We couldn't find any music files in "${esc(S.folders.map(p => p.name).join('", "'))}". Choose the folder where your music lives.`)
            .replace('data-action="choose-folder"', 'data-action="choose-folder" data-origin="onboarding"');
          return;
        }
        const nAlbums = visibleAlbums().length;
        scan.innerHTML = `${record({ demo: true })}<div class="done">
          <h2>All set!</h2>
          <div class="count">${plural(total, 'song', 'songs')} in ${plural(nAlbums, 'album', 'albums')}</div>
          ${S.useFolderImages ? `<div class="file" style="height:auto">Found ${plural(visibleAlbums().filter(a => a.cover).length, 'cover', 'covers')} and ${plural(artists().filter(a => artistInfo(a.name).photo).length, 'artist photo', 'artist photos')}</div>` : ''}
          <button class="btn btn-primary" data-action="go-library">${iconHtml('library_music')}Open library</button>
        </div>`;
        $('svg', scan).classList.add('down');
      }, step);
    },
  },

  /* ---------- 4. Library ---------- */
  'library': {
    key: () => 'library-' + S.libTab,
    render: () => {
      const empty = !S.folders.length || !library().length;
      const chips = [['artists', 'Artists'], ['songs', 'Songs'], ['albums', 'Albums'], ['folders', 'Folders']]
        .map(([k, n]) => `<button class="chip-f" data-action="lib-tab" data-tab="${k}" aria-pressed="${S.libTab === k}">${iconHtml('check')}${n}</button>`).join('');
      let body = '';
      if (!S.folders.length) body = emptyRecord('No record on the turntable', 'Choose the folder where your music lives. Only that folder is read, nothing else on your phone.');
      else if (empty) body = emptyRecord('No songs found', S.subfolders ? 'The chosen folders have no music files.' : 'Your music is in subfolders. Turn on "Include subfolders" in Settings.', false)
        + (S.subfolders ? '' : `<div style="text-align:center"><button class="btn btn-tonal" data-action="tab" data-tab="settings">${iconHtml('settings')}Open Settings</button></div>`);
      else if (S.libTab === 'songs') {
        const ms = sortSongs(library());
        const k = ctx(ms.map(m => m.id), { type: 'Playing from', name: 'All songs' });
        body = `<div class="list-head"><span class="count">${plural(ms.length, 'song', 'songs')}</span>
            <button class="sort" data-action="sort">${iconHtml('swap_vert')}${SORTS[S.sort]}</button></div>
          ${playActions(k)}
          ${ms.map((m, i) => songRow(m, k, i)).join('')}`;
      } else if (S.libTab === 'albums') {
        const as = visibleAlbums().sort((a, b) => a.title.localeCompare(b.title, LOCALE));
        body = `<div class="list-head"><span class="count">${plural(as.length, 'album', 'albums')}</span></div><div class="albums">${as.map(albumCard).join('')}</div>`;
      } else if (S.libTab === 'artists') {
        const ar = artists();
        body = `<div class="list-head"><span class="count">${plural(ar.length, 'artist', 'artists')}</span></div><div class="artists-grid">` + ar.map(a => `
          <div class="artist-card" data-action="artist" data-name="${esc(a.name)}" tabindex="0">
            <div class="photo">${photo(a.name)}</div>
            <div class="ti">${esc(a.name)}</div><div class="sb">${plural(a.albums.size, 'album', 'albums')}</div>
          </div>`).join('') + '</div>';
      } else {
        body = S.folders.map(p => `<div class="group-title">${esc(p.location)}</div><div class="group">
          <div class="row-i" data-action="folder" data-path="${esc(p.path)}"><div class="ic">${iconHtml('folder_special')}</div>
            <div><div class="ti">${esc(p.name)}</div><div class="sb">Chosen folder · ${plural(songsInFolder(p.path, S.subfolders).length, 'song', 'songs')}</div></div>${iconHtml('chevron_right', 'chev')}</div>
          ${subfoldersOf(p.path).map(sp => `<div class="row-i" data-action="folder" data-path="${esc(p.path + '/' + sp)}">${folderThumb(p.path + '/' + sp)}
            <div><div class="ti">${esc(sp)}</div><div class="sb">${plural(songsInFolder(p.path + '/' + sp, true).length, 'song', 'songs')}</div></div>${iconHtml('chevron_right', 'chev')}</div>`).join('')}
        </div>`).join('');
      }
      return `${topbar('Library', { back: false })}
        ${S.folders.length && !empty ? `<div class="chips">${chips}</div>` : ''}${body}`;
    },
  },

  /* ---------- 5. Album ---------- */
  'album': {
    render: ({ id }) => {
      const a = album(id);
      const ms = library().filter(m => m.album === id);
      const k = ctx(ms.map(m => m.id), { type: 'Playing from album', name: a.title });
      const total = ms.reduce((s, m) => s + m.duration, 0);
      return `${topbar('', { actions: `<button class="icon-btn" data-action="album-menu" data-id="${id}" aria-label="More options">${iconHtml('more_vert')}</button>` })}
        <div class="detail-head">
          <div class="art">${cover(a)}</div>
          <h2>${esc(a.title)}</h2>
          ${a.noMetadata ? `<span class="by">${esc(a.artistName)}</span>` : `<button class="artist-chip" data-action="artist" data-name="${esc(a.artistName)}"><span class="av">${photo(a.artistName)}</span>${esc(a.artistName)}</button>`}
          <div class="meta">${a.year ? a.year + ' · ' : ''}${plural(ms.length, 'song', 'songs')} · ${totalDuration(total)}</div>
        </div>
        ${playActions(k, a.noMetadata ? null : id)}
        ${a.noMetadata ? `<p class="pad" style="font:var(--type-body-s);color:var(--color-text-2);margin:0 0 8px">These files have no album or artist information. The app shows the file name.</p>` : ''}
        ${ms.map((m, i) => songRow(m, k, i, { numbered: true })).join('')}
        <div class="crumbs" style="padding-top:16px">${iconHtml('folder')} ${esc(a.folder)}</div>`;
    },
  },

  /* ---------- 6. Artist ---------- */
  'artist': {
    render: ({ name }) => {
      const ms = library().filter(m => m.artist === name);
      const as = [...new Set(ms.map(m => m.album))].map(album);
      const k = ctx(ms.map(m => m.id), { type: 'Playing from artist', name });
      const withPhoto = hasImage(artistInfo(name));
      return `${topbar('', { overPhoto: true })}
        <div class="artist-hero ${withPhoto ? '' : 'no-photo'}">
          <div class="bg">${photo(name, 'xMidYMin slice')}</div>
          <div class="grad"></div>
          <div class="info"><h2>${esc(name)}</h2>
            <div class="meta">${plural(as.length, 'album', 'albums')} · ${plural(ms.length, 'song', 'songs')}</div></div>
        </div>
        ${playActions(k)}
        <div class="sec-title">Albums</div>
        <div class="hscroll">${as.map(albumCard).join('')}</div>
        <div class="sec-title">Songs</div>
        ${ms.map((m, i) => songRow(m, k, i)).join('')}`;
    },
  },

  /* ---------- 7. Folder ---------- */
  'folder': {
    render: ({ path }) => {
      const parts = path.split('/');
      const subs = subfoldersOf(path);
      const direct = songsInFolder(path, false);
      const all = songsInFolder(path, true);
      const k = ctx(all.map(m => m.id), { type: 'Playing from folder', name: parts[parts.length - 1] });
      const k2 = ctx(direct.map(m => m.id), { type: 'Playing from folder', name: parts[parts.length - 1] });
      return `${topbar(esc(parts[parts.length - 1]))}
        <div class="crumbs">${iconHtml('smartphone')} Internal storage ${parts.map(p => `${iconHtml('chevron_right')} ${esc(p)}`).join(' ')}</div>
        ${all.length ? playActions(k) : ''}
        ${folderImages(path).map(im => `<div class="img-file">${iconHtml('image')}<span><b>${esc(im.file)}</b> · used as the ${im.use}${im.only ? ' (only image in the folder)' : ''}</span></div>`).join('')}
        ${!folderImages(path).length && allFolderImages(path).length > 1 ? `<div class="img-file">${iconHtml('image')}<span>${allFolderImages(path).length} images and no <b>folder.jpg</b> · using the generated cover</span></div>` : ''}
        ${subs.length ? `<div class="group">${subs.map(sp => `<div class="row-i" data-action="folder" data-path="${esc(path + '/' + sp)}">${folderThumb(path + '/' + sp)}
          <div><div class="ti">${esc(sp)}</div><div class="sb">${plural(songsInFolder(path + '/' + sp, true).length, 'song', 'songs')}</div></div>${iconHtml('chevron_right', 'chev')}</div>`).join('')}</div>` : ''}
        ${direct.map((m, i) => `<div class="track" data-mid="${m.id}" data-action="play-from" data-ctx="${k2}" data-i="${i}" tabindex="0">
            <div class="cover">${cover(album(m.album))}${eq}</div>
            <div style="min-width:0"><div class="ti">${esc(m.file)}</div><div class="ar">${esc(m.title)} · ${esc(m.artist)}</div></div>
            <span class="du">${fmt(m.duration)}</span>
            <button class="icon-btn" data-action="menu" data-mid="${m.id}" aria-label="More options">${iconHtml('more_vert')}</button></div>`).join('')}
        ${!subs.length && !direct.length ? emptyRecord('Empty folder', 'No songs in this folder.', false) : ''}`;
    },
  },

  /* ---------- 8. Search ---------- */
  'search': {
    render: ({ q = '' }) => `${topbar('Search', { back: false })}
      <label class="search">${iconHtml('search')}<input id="q" placeholder="Song, artist or album" value="${esc(q)}" autocomplete="off" enterkeyhint="search">
        <button class="icon-btn" data-action="clear-search" aria-label="Clear" style="width:44px;height:44px${q ? '' : ';visibility:hidden'}">${iconHtml('close')}</button></label>
      <div id="results"></div>`,
    mount: (el, params) => {
      const input = $('#q', el);
      const paint = () => {
        const q = input.value.trim();
        if (norm(input.value.trim()) !== norm((params.q || '').trim())) S.showAllSongs = false;
        params.q = input.value;
        $('[data-action="clear-search"]', el).style.visibility = q ? 'visible' : 'hidden';
        $('#results', el).innerHTML = searchResults(q);
        markActive(); markFavorites();
      };
      input.addEventListener('input', paint);
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && input.value.trim()) {
          const q = input.value.trim();
          S.recentSearches = [q, ...S.recentSearches.filter(r => norm(r) !== norm(q))].slice(0, 6);
          input.blur();
        }
      });
      paint();
      if (!params.q) setTimeout(() => input.focus({ preventScroll: true }), 350);
    },
  },

  /* ---------- 9. Playlists ---------- */
  'playlists': {
    render: () => {
      const favSongs = [...S.favoriteSongs].filter(id => inLibrary(song(id)));
      const favAlbums = [...S.favoriteAlbums].filter(id => visibleAlbums().some(a => a.id === id));
      const auto = [
        ['favorite-songs', 'Favorite songs', 'favorite', favSongs.length],
        ['favorite-albums', 'Favorite albums', 'album', favAlbums.length, 'album', 'albums'],
        ['most-played', 'Most played', 'trending_up', Math.min(20, library().length)],
        ['recently-added', 'Recently added', 'schedule', Math.min(20, library().length)],
      ];
      return `${topbar('Playlists', { back: false, actions: `<button class="icon-btn" data-action="new-playlist" aria-label="New playlist">${iconHtml('add')}</button>` })}
        <div class="group-title">Automatic</div>
        <div class="group">${auto.map(([id, n, ic, c, one = 'song', many = 'songs']) => `<div class="row-i" data-action="${id === 'favorite-albums' ? 'favorite-albums' : 'playlist'}" data-id="${id}" tabindex="0">
          <div class="ic tinted">${iconHtml(ic, 'fill')}</div><div><div class="ti">${n}</div><div class="sb">${plural(c, one, many)}</div></div>${iconHtml('chevron_right', 'chev')}</div>`).join('')}</div>
        <div class="group-title">Your playlists</div>
        <div class="group">${S.playlists.map(p => `<div class="row-i" data-action="playlist" data-id="${p.id}" tabindex="0">
          <div class="ic">${mosaic(p.songs)}</div><div style="min-width:0"><div class="ti">${esc(p.name)}</div><div class="sb">${plural(p.songs.length, 'song', 'songs')}</div></div>${iconHtml('chevron_right', 'chev')}</div>`).join('')}
          <div class="row-i" data-action="new-playlist" tabindex="0"><div class="ic tinted">${iconHtml('add')}</div><div><div class="ti">New playlist</div></div><span></span></div>
        </div>`;
    },
  },

  /* ---------- 9b. Favorite albums ---------- */
  'favorite-albums': {
    key: () => 'favorite-albums',
    render: () => {
      const as = [...S.favoriteAlbums].map(album).filter(a => visibleAlbums().includes(a));
      return `${topbar('Favorite albums', { small: true })}
        ${as.length ? `<div class="list-head"><span class="count">${plural(as.length, 'album', 'albums')}</span></div><div class="albums">${as.map(albumCard).join('')}</div>`
          : `<div class="empty"><span class="ms big">album</span><h3>No favorite albums</h3><p>Tap the heart on an album page, or use its ⋮ menu, to see it here.</p></div>`}`;
    },
  },

  /* ---------- 10. Playlist ---------- */
  'playlist': {
    render: ({ id }) => {
      const info = playlistData(id);
      if (!info) return `${topbar('')}${emptyRecord('Playlist deleted', '', false)}`;
      const ids = info.ids.filter(i => inLibrary(song(i)));
      const k = ctx(ids, { type: 'Playing from playlist', name: info.name });
      const total = ids.reduce((s, i) => s + song(i).duration, 0);
      const art = info.icon
        ? `<div class="pl-art" style="background:var(--color-primary-container);color:var(--color-on-primary-container)">${iconHtml(info.icon, 'fill')}</div>`
        : `<div class="pl-art" style="overflow:hidden">${mosaic(ids)}</div>`;
      return `${topbar('', { actions: info.editable ? `<button class="icon-btn" data-action="playlist-menu" data-id="${id}" aria-label="Playlist options">${iconHtml('more_vert')}</button>` : '' })}
        <div class="detail-head">${art}<h2>${esc(info.name)}</h2>
          <div class="meta">${info.desc ? info.desc + ' · ' : ''}${plural(ids.length, 'song', 'songs')}${ids.length ? ' · ' + totalDuration(total) : ''}</div></div>
        ${ids.length ? playActions(k) + ids.map((mid, i) => songRow(song(mid), k, i)).join('')
          : `<div class="empty"><span class="ms big">${info.icon || 'queue_music'}</span><h3>Nothing here yet</h3><p>${id === 'favorite-songs' ? 'Tap the heart on a song, in the player or in the ⋮ menu, to see it here.' : 'Use the ⋮ menu on any song and choose "Add to playlist".'}</p></div>`}`;
    },
  },

  /* ---------- 11. Settings ---------- */
  'equalizer': {
    render: () => `${topbar('Equalizer', { small: true })}<div class="eqz-page">${eqHtml()}</div>`,
    mount: el => bindEq(el),
  },
  'settings': {
    render: () => {
      const theme = document.documentElement.dataset.theme || 'auto';
      const timerText = S.timer ? timerLabel() : 'Off';
      return `${topbar('Settings', { back: false })}
        <div class="group-title">Library folders</div>
        <div class="group">
          ${S.folders.map(p => `<div class="row-i" style="cursor:default"><div class="ic">${iconHtml(p.location === 'SD card' ? 'sd_card' : 'folder')}</div>
            <div style="min-width:0"><div class="ti">${esc(p.name)}</div><div class="sb">${esc(p.location)} · ${plural(songsInFolder(p.path, S.subfolders).length, 'song', 'songs')}</div></div>
            <button class="icon-btn" data-action="remove-folder" data-id="${p.id}" aria-label="Remove folder ${esc(p.name)}">${iconHtml('remove_circle_outline')}</button></div>`).join('')}
          <div class="row-i" data-action="choose-folder" data-origin="settings" tabindex="0"><div class="ic tinted">${iconHtml('create_new_folder')}</div><div><div class="ti">Add folder</div><div class="sb">Only chosen folders go into the library</div></div><span></span></div>
          <div class="row-i" data-action="toggle" data-k="subfolders"><div class="ic tinted">${iconHtml('subdirectory_arrow_right')}</div><div><div class="ti">Include subfolders</div><div class="sb">Look for songs inside the chosen folders</div></div><button class="switch" role="switch" aria-checked="${S.subfolders}" aria-label="Include subfolders"></button></div>
          <div class="row-i" data-action="toggle" data-k="useFolderImages"><div class="ic tinted">${iconHtml('photo_library')}</div><div><div class="ti">Use folder photos and covers</div><div class="sb">folder.jpg in each artist and album folder, or the folder's only image</div></div><button class="switch" role="switch" aria-checked="${S.useFolderImages}" aria-label="Use folder photos and covers"></button></div>
          <div class="row-i" data-action="rescan" tabindex="0"><div class="ic tinted">${iconHtml('refresh')}</div><div><div class="ti">Look for new songs</div><div class="sb">Also happens automatically when you open the app</div></div><span></span></div>
        </div>
        <div class="group-title">Playback</div>
        <div class="group">
          <div class="row-i" data-action="timer" tabindex="0"><div class="ic tinted">${iconHtml('bedtime')}</div><div><div class="ti">Sleep timer</div><div class="sb" id="timer-status">${timerText}</div></div>${iconHtml('chevron_right', 'chev')}</div>
          <div class="row-i" data-action="equalizer" tabindex="0"><div class="ic tinted">${iconHtml('tune')}</div><div><div class="ti">Equalizer</div><div class="sb">${eqStatus()}</div></div>${iconHtml('chevron_right', 'chev')}</div>
          <div class="row-i" data-action="toggle" data-k="resume"><div class="ic tinted">${iconHtml('history')}</div><div><div class="ti">Resume where you left off</div><div class="sb">When the app opens, the last song is ready to play</div></div><button class="switch" role="switch" aria-checked="${S.resume}" aria-label="Resume where you left off"></button></div>
          <div class="row-i" data-action="toggle" data-k="pauseOnUnplug"><div class="ic tinted">${iconHtml('headset_off')}</div><div><div class="ti">Pause when headphones disconnect</div><div class="sb">Wired or Bluetooth</div></div><button class="switch" role="switch" aria-checked="${S.pauseOnUnplug}" aria-label="Pause when headphones disconnect"></button></div>
        </div>
        <div class="group-title">Driving</div>
        <div class="group">
          <div class="row-i" data-action="drive-open" tabindex="0"><div class="ic tinted">${iconHtml('directions_car')}</div><div><div class="ti">Driving mode</div><div class="sb">Big buttons and only the essentials while you drive</div></div>${iconHtml('chevron_right', 'chev')}</div>
          <div class="row-i" data-action="drive-auto"><div class="ic tinted">${iconHtml('bluetooth')}</div><div><div class="ti">Start automatically in the car</div><div class="sb">${S.drive.auto && S.drive.car ? `When ${esc(S.drive.car)} connects` : 'When your phone connects to your car\'s Bluetooth'}</div></div><button class="switch" role="switch" aria-checked="${S.drive.auto}" aria-label="Start automatically in the car"></button></div>
          ${S.drive.auto ? `<div class="row-i" data-action="drive-car" tabindex="0"><div class="ic tinted">${iconHtml('directions_car')}</div><div><div class="ti">Car</div><div class="sb">${esc(S.drive.car)}</div></div>${iconHtml('chevron_right', 'chev')}</div>` : ''}
        </div>
        <div class="tip">${iconHtml('battery_alert')}<div><b>Music stops on its own?</b>Some phones (Xiaomi, Samsung, Motorola…) close background apps to save battery. Exempt Vitrola Mp3 from battery optimization.<br><button data-action="battery">Open battery settings</button></div></div>
        <div class="group-title">Appearance</div>
        <div class="seg theme-seg" role="group" aria-label="Theme">
          ${[['auto', 'Automatic'], ['light', 'Light'], ['dark', 'Dark']].map(([k, n]) => `<button data-action="theme" data-theme-choice="${k}" aria-pressed="${theme === k}">${n}</button>`).join('')}
        </div>
        <div class="group">
          <div class="row-i" data-action="toggle" data-k="spinRecord"><div class="ic tinted">${iconHtml('album')}</div><div><div class="ti">Spinning record</div><div class="sb">The record turns while music plays</div></div><button class="switch" role="switch" aria-checked="${S.spinRecord}" aria-label="Spinning record"></button></div>
        </div>
        <div class="about">
          <img class="logo-p" src="../01-logo/export/vitrola-mp3-horizontal-positive.svg" alt="Vitrola Mp3">
          <img class="logo-n" src="../01-logo/export/vitrola-mp3-horizontal-negative.svg" alt="Vitrola Mp3" style="margin:0 auto 8px">
          <div>Version 0.1 · mockup</div><div>No ads. Nothing leaves your phone.</div>
        </div>`;
    },
    mount: el => {
      const t = setInterval(() => { if (!el.isConnected) return clearInterval(t); const sb = $('#timer-status', el); if (sb && S.timer && !S.timer.endOfSong) sb.textContent = timerLabel(); }, 1000);
    },
  },
};

function searchResults(q) {
  if (!q) {
    return `${S.recentSearches.length ? `<div class="sec-title">Recent searches<button data-action="clear-recents">Clear</button></div>
      <div class="recent">${S.recentSearches.map(r => `<button class="chip-f" data-action="recent" data-q="${esc(r)}">${iconHtml('history')}${esc(r)}</button>`).join('')}</div>` : ''}
      <div class="sec-title">Artists</div>
      <div class="hscroll">${artists().map(a => `<div class="album" data-action="artist" data-name="${esc(a.name)}" style="width:96px;text-align:center"><div class="art" style="border-radius:50%">${photo(a.name)}</div><div class="ti">${esc(a.name)}</div></div>`).join('')}</div>`;
  }
  // 1) Direct matches
  const n = norm(q);
  const weight = t => norm(t).startsWith(n) ? 0 : 1; // "starts with" ranks above "contains"
  const byWeight = field => (a, b) => weight(field(a)) - weight(field(b));
  const lib = library();
  const directSongs = lib.filter(m => norm(m.title).includes(n) || norm(m.file).includes(n)).sort(byWeight(m => m.title));
  const directAlbums = visibleAlbums().filter(a => norm(a.title).includes(n)).sort(byWeight(a => a.title));
  const directArtists = artists().filter(a => norm(a.name).includes(n)).sort(byWeight(a => a.name));
  if (!directSongs.length && !directAlbums.length && !directArtists.length) {
    return `<div class="empty"><span class="ms big">search_off</span><h3>Nothing found</h3><p>No song, album or artist matches "${esc(q)}". Check the spelling or try another word.</p></div>`;
  }
  // 2) Each layer also brings what is linked to the other layers' results
  const artistNames = new Set([...directArtists.map(a => a.name), ...directAlbums.map(a => a.artistName), ...directSongs.map(m => m.artist)]);
  const albumIds = new Set([...directAlbums.map(a => a.id), ...directSongs.map(m => m.album)]);
  visibleAlbums().forEach(a => { if (directArtists.some(x => x.name === a.artistName)) albumIds.add(a.id); });
  const ar = [...directArtists, ...artists().filter(a => artistNames.has(a.name) && !directArtists.some(x => x.name === a.name))];
  const as = [...directAlbums, ...[...albumIds].map(album).filter(a => !directAlbums.includes(a))];
  const related = lib.filter(m => !directSongs.includes(m) && (directAlbums.some(a => a.id === m.album) || directArtists.some(a => a.name === m.artist)));
  const ms = [...directSongs, ...related];

  const LIMIT = 6;
  const shown = S.showAllSongs ? ms : ms.slice(0, LIMIT);
  const k = ctx(ms.map(m => m.id), { type: 'Playing from search', name: `"${q}"` });
  const heading = (name, qty) => `<div class="sec-title">${name} <span class="qty">${qty}</span></div>`;
  return `<section aria-label="Artists">${heading('Artists', ar.length)}
      ${ar.map(a => `<div class="row-i" data-action="artist" data-name="${esc(a.name)}"><div class="ic round">${photo(a.name)}</div>
        <div style="min-width:0"><div class="ti">${highlight(a.name, q)}</div><div class="sb">${plural(a.albums.size, 'album', 'albums')} · ${plural(a.songs.length, 'song', 'songs')}</div></div>${iconHtml('chevron_right', 'chev')}</div>`).join('')}
    </section>
    <section aria-label="Albums">${heading('Albums', as.length)}
      <div class="hscroll">${as.map(a => albumCard(a).replace(`<div class="ti">${esc(a.title)}</div>`, `<div class="ti">${highlight(a.title, q)}</div>`)).join('')}</div>
    </section>
    <section aria-label="Songs">${heading('Songs', ms.length)}
      ${shown.map((m, i) => songRow(m, k, i, { q })).join('')}
      ${ms.length > LIMIT && !S.showAllSongs ? `<div style="padding:4px 16px"><button class="btn btn-outline" style="width:100%" data-action="show-all-songs">See all ${ms.length} songs</button></div>` : ''}
    </section>`;
}

function mosaic(ids) {
  const as = [...new Set(ids.map(i => song(i).album))].slice(0, 4).map(album);
  if (!as.length) return iconHtml('queue_music');
  if (as.length < 4) return cover(as[0]);
  return `<div class="pl-mosaic" style="width:100%;height:100%">${as.map(cover).join('')}</div>`;
}
function playlistData(id) {
  if (id === 'favorite-songs') return { name: 'Favorite songs', icon: 'favorite', ids: [...S.favoriteSongs], desc: 'Automatic' };
  if (id === 'most-played') return { name: 'Most played', icon: 'trending_up', ids: library().slice().sort((a, b) => b.plays - a.plays).slice(0, 20).map(m => m.id), desc: 'Automatic' };
  if (id === 'recently-added') return { name: 'Recently added', icon: 'schedule', ids: library().slice().reverse().slice(0, 20).map(m => m.id), desc: 'Automatic' };
  const p = S.playlists.find(x => x.id === id);
  return p && { name: p.name, ids: p.songs, editable: true };
}

/* ============================================================
   Player (simulated: time passes, but there is no sound)
   ============================================================ */
function playList(ids, i, source, shuffle = S.shuffle) {
  if (!ids.length) return;
  S.originalQueue = ids.slice();
  S.shuffle = shuffle;
  if (shuffle) {
    const first = ids[i];
    S.queue = [first, ...shuffled(ids.filter((_, j) => j !== i))];
    S.idx = 0;
  } else { S.queue = ids.slice(); S.idx = i; }
  S.source = source; S.pos = 0;
  play(true);
}
function play(on = !S.playing) {
  if (!current()) return;
  if (on === S.playing) { updatePlayer(); return; }
  if (on) { S.spinningSince = performance.now(); S.playing = true; }
  else { const cur = currentAngle(); S.angle = S.spinRecord && !reduceMotion ? coastTo(cur) : Math.ceil(cur / 360) * 360; S.playing = false; }
  updatePlayer(!on);
}
function next(auto = false) {
  if (!current()) return;
  if (auto && S.repeat === 2) { S.pos = 0; return updatePlayer(); }
  if (S.idx < S.queue.length - 1) { S.idx++; S.pos = 0; }
  else if (S.repeat === 1 || !auto) { S.idx = 0; S.pos = 0; }
  else { S.pos = 0; play(false); return; }
  updatePlayer();
}
function previous() {
  if (!current()) return;
  if (S.pos > 3 || S.idx === 0) S.pos = 0; else { S.idx--; S.pos = 0; }
  updatePlayer();
}
function toggleShuffle() {
  const id = S.queue[S.idx];
  S.shuffle = !S.shuffle;
  if (S.shuffle) S.queue = [id, ...shuffled(S.originalQueue.filter(x => x !== id))], S.idx = 0;
  else S.queue = S.originalQueue.slice(), S.idx = Math.max(0, S.queue.indexOf(id));
  snackbar(S.shuffle ? 'Shuffle on' : 'Shuffle off');
  updatePlayer();
}
function toggleRepeat() {
  S.repeat = (S.repeat + 1) % 3;
  snackbar(['Repeat off', 'Repeating the queue', 'Repeating this song'][S.repeat]);
  updatePlayer();
}

setInterval(() => {
  // status bar clock
  const d = new Date(); $('#clock').textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (S.timer && !S.timer.endOfSong && Date.now() >= S.timer.end) { S.timer = null; if (S.playing) play(false); snackbar('Sleep timer ended. Good night!'); }
  if (!S.playing || !current() || scratch) return;
  S.pos += 1;
  if (S.pos >= current().duration) {
    if (S.timer && S.timer.endOfSong) { S.timer = null; S.pos = 0; play(false); snackbar('Sleep timer ended. Good night!'); return; }
    next(true);
  } else updateProgress();
}, 1000);

function updatePlayer(slowDown = false) {
  renderMini();
  if (npEl.classList.contains('open')) renderNowPlaying();
  markActive();
  syncRecords(slowDown);
  updateProgress();
  const sh = $('.shade, .lock', app); if (sh) sh.dispatchEvent(new CustomEvent('refresh'));
  const q = $('#queue-list'); if (q) q.innerHTML = queueRows();
  if (S.drive.on) renderDrive();
}
function updateProgress() {
  const m = current(); if (!m) return;
  const pct = (S.pos / m.duration * 100) + '%';
  const bar = $('#mini .prog i'); if (bar) bar.style.width = pct;
  const seek = $('#np-seek'); if (seek && !seek.matches(':active')) { seek.value = S.pos; seek.style.setProperty('--p', pct); }
  const t = $('#np-pos'); if (t) t.textContent = fmt(S.pos);
  const tt = $('#np-timer'); if (tt) tt.textContent = S.timer ? timerLabel() : '';
  $$('.notif .bar i').forEach(b => b.style.width = pct);
  const dv = $('.dv-prog i'); if (dv) dv.style.width = pct;
  const dvt = $('#dv-pos'); if (dvt) dvt.textContent = fmt(S.pos);
  updateLyrics();
}
function markActive() {
  const m = current();
  $$('[data-mid].track, .q-row[data-mid]').forEach(r => r.classList.toggle('active', !!m && r.dataset.mid === m.id));
  app.classList.toggle('paused', !S.playing);
}
const timerLabel = () => !S.timer ? '' : S.timer.endOfSong ? 'Pauses at the end of this song' : `Pauses in ${fmt(Math.max(0, (S.timer.end - Date.now()) / 1000))}`;

/* ---------- Mini player ---------- */
function renderMini() {
  const mini = $('#mini');
  const m = current();
  const hide = !m || SCREENS[currentScreen] && SCREENS[currentScreen].noChrome;
  mini.hidden = !!hide;
  if (hide) return positionSnackbar();
  mini.innerHTML = `<div class="prog"><i style="width:${S.pos / m.duration * 100}%"></i></div>
    <div class="row" data-action="open-np">
      ${record({ a: album(m.album), withArm: false, player: true }).replace('<svg ', '<svg class="mdisc" ')}
      <div style="min-width:0"><div class="ti">${esc(m.title)}</div><div class="ar">${esc(m.artist)}</div></div>
      <button class="icon-btn" data-action="play" aria-label="${S.playing ? 'Pause' : 'Play'}">${iconHtml(S.playing ? 'pause' : 'play_arrow', 'fill')}</button>
      <button class="icon-btn" data-action="next" aria-label="Next song">${iconHtml('skip_next', 'fill')}</button>
    </div>`;
  syncRecords(false, mini);
  positionSnackbar();
}

/* ---------- Now playing ---------- */
function openNowPlaying() {
  if (!current()) return;
  renderNowPlaying();
  npEl.classList.remove('closing');
  npEl.classList.add('open');
  npEl.setAttribute('aria-hidden', 'false');
  updatePanel(npPanelKey());
  positionSnackbar();
}
function closeNowPlaying() {
  npEl.classList.add('closing');
  npEl.classList.remove('open');
  npEl.setAttribute('aria-hidden', 'true');
  updatePanelForCurrent();
  positionSnackbar();
}
const seekHtml = m => `<div class="np-seek">
      <input type="range" id="np-seek" min="0" max="${m.duration}" value="${S.pos}" aria-label="Song position" style="--p:${S.pos / m.duration * 100}%">
      <div class="times"><span id="np-pos">${fmt(S.pos)}</span><span>${fmt(m.duration)}</span></div>
    </div>`;
function renderNowPlaying() {
  const m = current(); if (!m) return;
  const a = album(m.album);
  const fav = S.favoriteSongs.has(m.id);
  npEl.style.setProperty('--np-background', `color-mix(in srgb, ${albumColor(a)} 16%, var(--color-background))`);
  npEl.classList.toggle('lyrics-mode', S.lyricsOpen);
  const oldDisc = $('.np-disc svg[data-record]', npEl);
  if (oldDisc) armShown = oldDisc.classList.contains('down'); // the new record starts where the arm was
  if (S.lyricsOpen) renderLyricsView(m, a);
  else npEl.innerHTML = `
    <div class="np-top">
      <button class="icon-btn" data-action="close-np" aria-label="Collapse player">${iconHtml('expand_more')}</button>
      <div class="src"><small>${esc(S.source ? S.source.type : 'Playing')}</small><b>${esc(S.source ? S.source.name : a.title)}</b></div>
      <button class="icon-btn" data-action="drive-open" aria-label="Driving mode">${iconHtml('directions_car')}</button>
      <button class="icon-btn" data-action="menu" data-mid="${m.id}" aria-label="More options">${iconHtml('more_vert')}</button>
    </div>
    <div class="np-disc">${record({ a, withArm: true, player: true })}<span class="scratch-rate" aria-hidden="true"></span></div>
    <div class="np-info">
      <div style="min-width:0"><h2>${esc(m.title)}</h2><button class="ar" data-action="artist-np" data-name="${esc(m.artist)}">${a.noMetadata ? '' : `<span class="av">${photo(m.artist)}</span>`}${esc(m.artist)}${a.noMetadata ? '' : ' · ' + esc(a.title)}</button></div>
      <button class="icon-btn ${fav ? 'fav-on' : ''}" data-action="favorite" data-mid="${m.id}" aria-label="${fav ? 'Remove from favorite songs' : 'Add to favorite songs'}" aria-pressed="${fav}">${iconHtml('favorite', fav ? 'fill' : '')}</button>
    </div>
    ${seekHtml(m)}
    <div class="np-controls">
      <button class="icon-btn ${S.shuffle ? 'on' : ''}" data-action="shuffle" aria-label="Shuffle" aria-pressed="${S.shuffle}">${iconHtml('shuffle')}</button>
      <button class="icon-btn" data-action="previous" aria-label="Previous song">${iconHtml('skip_previous', 'fill big')}</button>
      <button class="play ${S.playing ? 'is-playing' : ''}" data-action="play" aria-label="${S.playing ? 'Pause' : 'Play'}">${iconHtml(S.playing ? 'pause' : 'play_arrow', 'fill')}</button>
      <button class="icon-btn" data-action="next" aria-label="Next song">${iconHtml('skip_next', 'fill big')}</button>
      <button class="icon-btn ${S.repeat ? 'on' : ''}" data-action="repeat" aria-label="${['Repeat: off', 'Repeat: all', 'Repeat: one'][S.repeat]}">${iconHtml(S.repeat === 2 ? 'repeat_one' : 'repeat')}</button>
    </div>
    <div class="timer-tag" id="np-timer">${S.timer ? timerLabel() : ''}</div>
    <div class="np-extra">
      <button class="icon-btn" data-action="lyrics" aria-label="Show lyrics">${iconHtml('lyrics')}</button>
      <button class="icon-btn ${S.eq.on ? 'on' : ''}" data-action="eq-sheet" aria-label="Equalizer" aria-pressed="${S.eq.on}">${iconHtml('tune')}</button>
      <button class="icon-btn ${S.timer ? 'on' : ''}" data-action="timer" aria-label="Sleep timer">${iconHtml('bedtime')}</button>
      <button class="icon-btn" data-action="queue" aria-label="Queue">${iconHtml('queue_music')}</button>
      <button class="icon-btn" data-action="file-info" data-mid="${m.id}" aria-label="File details">${iconHtml('info')}</button>
    </div>`;
  const seek = $('#np-seek', npEl);
  const disc = $('.np-disc svg[data-record]', npEl); if (disc) bindScratch(disc);
  seek.addEventListener('input', () => { S.pos = +seek.value; seek.style.setProperty('--p', (S.pos / m.duration * 100) + '%'); $('#np-pos').textContent = fmt(S.pos); const b = $('#mini .prog i'); if (b) b.style.width = (S.pos / m.duration * 100) + '%'; updateLyrics(); });
  syncRecords();
}

/* ---------- Driving mode (D24) ----------
   A simplified full-screen player for the car: big text, big buttons, two tabs (Now playing, Music),
   no search, menus or dialogs. Screen stays on. Has its own landscape layout. */
const PAIRED_DEVICES = ['HR-V Multimedia', 'JBL Flip 5', 'Galaxy Buds2 Pro', 'Pixel Watch 2'];
function driveTiles() {
  return [
    ['shuffle-all', 'shuffle', 'Shuffle all'],
    ['favorite-songs', 'favorite', 'Favorite songs'],
    ['most-played', 'trending_up', 'Most played'],
    ['recently-added', 'schedule', 'Recently added'],
    ['playlists', 'queue_music', 'Playlists'],
  ];
}
function drivePlaying() {
  const m = current();
  if (!m) return `<div class="dv-empty">${iconHtml('music_off')}<h2>Nothing playing</h2>
    <button class="dv-big" data-action="drive-play" data-k="shuffle-all">${iconHtml('shuffle')}Shuffle all</button></div>`;
  const a = album(m.album), fav = S.favoriteSongs.has(m.id);
  return `<div class="dv-player">
    <div class="dv-art">${record({ a, withArm: false, player: true })}</div>
    <div class="dv-info">
      <div class="dv-meta"><h2>${esc(m.title)}</h2><p>${esc(m.artist)}</p></div>
      <div class="dv-progress"><div class="dv-prog"><i style="width:${S.pos / m.duration * 100}%"></i></div>
        <div class="dv-times"><span id="dv-pos">${fmt(S.pos)}</span><span>${fmt(m.duration)}</span></div></div>
      <div class="dv-ctrls">
        <button class="dv-btn ${fav ? 'fav-on' : ''}" data-action="favorite" data-mid="${m.id}" aria-label="${fav ? 'Remove from favorite songs' : 'Add to favorite songs'}" aria-pressed="${fav}">${iconHtml('favorite', fav ? 'fill' : '')}</button>
        <button class="dv-btn" data-action="previous" aria-label="Previous song">${iconHtml('skip_previous', 'fill')}</button>
        <button class="dv-play ${S.playing ? 'is-playing' : ''}" data-action="play" aria-label="${S.playing ? 'Pause' : 'Play'}">${iconHtml(S.playing ? 'pause' : 'play_arrow', 'fill')}</button>
        <button class="dv-btn" data-action="next" aria-label="Next song">${iconHtml('skip_next', 'fill')}</button>
        <button class="dv-btn ${S.shuffle ? 'on' : ''}" data-action="shuffle" aria-label="Shuffle" aria-pressed="${S.shuffle}">${iconHtml('shuffle')}</button>
      </div>
    </div>
  </div>`;
}
function driveMusic() {
  if (S.drive.sub === 'playlists') return `<div class="dv-list">
    <button class="dv-row back" data-action="drive-sub" data-sub="">${iconHtml('arrow_back')}Playlists</button>
    ${S.playlists.length ? S.playlists.map(p => `<button class="dv-row" data-action="drive-play" data-k="${p.id}"><span class="dv-mosaic">${mosaic(p.songs)}</span>${esc(p.name)}<small>${plural(p.songs.length, 'song', 'songs')}</small></button>`).join('')
      : '<p class="dv-none">No playlists yet</p>'}</div>`;
  return `<div class="dv-tiles">${driveTiles().map(([k, ic, n]) => `<button class="dv-tile ${k === 'shuffle-all' ? 'accent' : ''}" data-action="${k === 'playlists' ? 'drive-sub' : 'drive-play'}" data-k="${k}" data-sub="${k}">${iconHtml(ic, 'fill')}<span>${n}</span></button>`).join('')}</div>`;
}
function renderDrive() {
  const d = S.drive;
  driveEl.classList.toggle('open', d.on);
  driveEl.setAttribute('aria-hidden', !d.on);
  $('#phone').classList.toggle('landscape', d.on && d.landscape);
  if (!d.on) { driveEl.innerHTML = ''; return; }
  driveEl.innerHTML = `
    <div class="dv-top">
      <button class="dv-exit" data-action="drive-exit">${iconHtml('close')}Exit</button>
      <div class="dv-title">${iconHtml('directions_car')}<span>Driving mode${d.autoEntered && d.car ? ` · ${esc(d.car)}` : ''}</span></div>
    </div>
    <nav class="dv-tabs" aria-label="Driving mode">
      <button data-action="drive-tab" data-t="playing" ${d.tab === 'playing' ? 'aria-current="page"' : ''}>${iconHtml('album', d.tab === 'playing' ? 'fill' : '')}<span>Now playing</span></button>
      <button data-action="drive-tab" data-t="music" ${d.tab === 'music' ? 'aria-current="page"' : ''}>${iconHtml('library_music', d.tab === 'music' ? 'fill' : '')}<span>Music</span></button>
    </nav>
    <div class="dv-body">${d.tab === 'playing' ? drivePlaying() : driveMusic()}</div>`;
  syncRecords();
  positionSnackbar();
}
function enterDrive(auto = false) {
  ensureLibrary();
  if (currentScreen === 'welcome' || currentScreen === 'scan') { S.libTab = 'artists'; root('library'); }
  closeOverlay(true);
  Object.assign(S.drive, { on: true, tab: 'playing', sub: null, autoEntered: auto });
  renderDrive();
  updatePanel(driveKey());
}
function exitDrive() {
  Object.assign(S.drive, { on: false, autoEntered: false, landscape: false, sub: null });
  renderDrive();
  positionSnackbar();
  updatePanelForCurrent();
}
const driveKey = () => S.drive.landscape ? 'drive-landscape' : S.drive.tab === 'music' ? 'drive-music' : 'drive';
function drivePlay(k) {
  const lib = library().map(m => m.id);
  if (k === 'shuffle-all') playList(lib, Math.floor(Math.random() * lib.length), { type: 'Playing from', name: 'All songs' }, true);
  else { const p = playlistData(k); if (!p || !p.ids.length) return snackbar('Nothing here yet'); playList(p.ids, 0, { type: 'Playing from playlist', name: p.name }, false); }
  S.drive.tab = 'playing'; S.drive.sub = null; renderDrive(); updatePanel(driveKey());
}
function systemPermission(title, text, onAllow, onDeny) {
  const dlg = document.createElement('div');
  dlg.className = 'sys-dialog';
  dlg.innerHTML = `<div class="box">${iconHtml('nearby')}<h3>${title}</h3>${text ? `<p>${text}</p>` : ''}
    <div class="acts col"><button data-r="yes">Allow</button><button data-r="no">Don't allow</button></div></div>`;
  app.appendChild(dlg);
  dlg.addEventListener('click', e => { const r = e.target.closest('[data-r]'); if (!r) return; dlg.remove(); (r.dataset.r === 'yes' ? onAllow : onDeny)(); });
}
function chooseCar() {
  openSheet(`<h3>Choose your car</h3>
    <p class="sheet-note">Paired Bluetooth devices. Driving mode starts when this one connects.</p>
    <div class="s-body">${PAIRED_DEVICES.map(n => `<button class="menu-i ${S.drive.car === n ? 'sel' : ''}" data-action="drive-set-car" data-name="${esc(n)}">${iconHtml(S.drive.car === n ? 'radio_button_checked' : 'radio_button_unchecked')}${esc(n)}</button>`).join('')}</div>`, 'drive-car');
}

/* ---------- Equalizer (D23) ----------
   10 fixed bands (Android DynamicsProcessing, Android 9+), ±12 dB, app presets, bass boost and an
   on/off switch. One global setting for every song, saved. Hidden on Android 8. */
const EQ_FREQS = ['31', '62', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];
const EQ_MAX = 12;
const EQ_PRESETS = {
  flat: ['Flat', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
  bass: ['Bass', [6, 5, 4, 2, 0, 0, 0, 0, 0, 0]],
  vocal: ['Vocal', [-2, -2, -1, 1, 3, 4, 3, 1, 0, -1]],
  treble: ['Treble', [0, 0, 0, 0, 0, 1, 2, 4, 5, 6]],
  rock: ['Rock', [5, 4, 2, -1, -2, -1, 2, 3, 4, 4]],
  pop: ['Pop', [-1, 0, 2, 3, 4, 3, 1, 0, -1, -1]],
  jazz: ['Jazz', [3, 2, 1, 2, -1, -1, 0, 1, 2, 3]],
  classical: ['Classical', [4, 3, 2, 1, -1, -1, 0, 2, 3, 4]],
  electronic: ['Electronic', [5, 4, 1, 0, -2, 1, 0, 1, 4, 5]],
  acoustic: ['Acoustic', [4, 3, 2, 1, 1, 1, 2, 2, 3, 2]],
};
const eqPresetName = k => k === 'custom' ? 'Custom' : EQ_PRESETS[k][0];
const eqStatus = () => !S.eq.on ? 'Off' : `On · ${eqPresetName(S.eq.preset)}${S.eq.bass ? ` · bass boost ${S.eq.bass}%` : ''}`;
const dbText = v => v === 0 ? '0 dB' : `${v > 0 ? '+' : '−'}${Math.abs(v)} dB`;

function eqCurve(bands) {
  // smooth line through the band values (Catmull-Rom → Bézier), in a 1000×200 box
  const pts = bands.map((v, i) => [(i + 0.5) * 100, 100 - v / EQ_MAX * 88]);
  let d = `M0 ${pts[0][1]} L${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
  }
  d += ` L1000 ${pts[pts.length - 1][1]}`;
  return { line: d, area: `${d} L1000 100 L0 100 Z` };
}
function eqHtml() {
  const e = S.eq, c = eqCurve(e.bands);
  return `<div class="eqz ${e.on ? '' : 'off'}">
    <div class="row-i eqz-switch" data-action="eq-toggle"><div class="ic tinted">${iconHtml('tune')}</div>
      <div><div class="ti">Use equalizer</div><div class="sb">Applies to every song</div></div>
      <button class="switch" role="switch" aria-checked="${e.on}" aria-label="Use equalizer"></button></div>
    <div class="chips eqz-presets" role="group" aria-label="Presets">${[...Object.keys(EQ_PRESETS), 'custom'].map(k =>
      `<button class="chip-f" data-action="eq-preset" data-p="${k}" aria-pressed="${e.preset === k}">${iconHtml('check')}${eqPresetName(k)}</button>`).join('')}</div>
    <div class="eqz-graph">
      <div class="eqz-scale" aria-hidden="true"><span>+${EQ_MAX}</span><span>0</span><span>−${EQ_MAX}</span></div>
      <div class="eqz-plot">
        <svg viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="100" x2="1000" y2="100" class="zero"/>
          <path class="area" d="${c.area}"/><path class="line" d="${c.line}"/>
        </svg>
        <div class="eqz-bands">${e.bands.map((v, i) => `<div class="eqz-band" role="slider" tabindex="0" data-i="${i}" aria-label="${EQ_FREQS[i]} Hz"
          aria-valuemin="-${EQ_MAX}" aria-valuemax="${EQ_MAX}" aria-valuenow="${v}" aria-valuetext="${dbText(v)}">
          <i class="trk"></i><i class="thumb" style="top:${50 - v / EQ_MAX * 44}%"><b>${dbText(v)}</b></i></div>`).join('')}</div>
      </div>
      <div class="eqz-freqs" aria-hidden="true">${EQ_FREQS.map(f => `<span>${f}</span>`).join('')}</div>
    </div>
    <div class="eqz-bass">
      <div class="eqz-bass-head"><span>Bass boost</span><span id="eqz-bass-val">${e.bass ? e.bass + '%' : 'Off'}</span></div>
      <div class="np-seek"><input type="range" id="eqz-bass" min="0" max="100" step="5" value="${e.bass}" aria-label="Bass boost" style="--p:${e.bass}%"></div>
    </div>
  </div>`;
}
function refreshEq(root) {
  const e = S.eq, box = $('.eqz', root); if (!box) return;
  box.classList.toggle('off', !e.on);
  $('.eqz-switch .switch', box).setAttribute('aria-checked', e.on);
  $$('.eqz-presets .chip-f', box).forEach(b => b.setAttribute('aria-pressed', b.dataset.p === e.preset));
  $$('.eqz-band', box).forEach((b, i) => {
    const v = e.bands[i];
    b.setAttribute('aria-valuenow', v); b.setAttribute('aria-valuetext', dbText(v));
    const t = $('.thumb', b); t.style.top = `${50 - v / EQ_MAX * 44}%`; $('b', t).textContent = dbText(v);
  });
  const c = eqCurve(e.bands); $('.eqz-plot .line', box).setAttribute('d', c.line); $('.eqz-plot .area', box).setAttribute('d', c.area);
  const np = $('[data-action="eq-sheet"]', npEl); if (np) { np.classList.toggle('on', e.on); np.setAttribute('aria-pressed', e.on); }
}
function setBand(root, i, v) {
  v = Math.max(-EQ_MAX, Math.min(EQ_MAX, Math.round(v)));
  if (S.eq.bands[i] === v && S.eq.preset === 'custom' && S.eq.on) return;
  S.eq.bands[i] = v; S.eq.custom = S.eq.bands.slice(); S.eq.preset = 'custom'; S.eq.on = true;
  refreshEq(root);
}
function bindEq(root) {
  $$('.eqz-band', root).forEach(b => {
    const i = +b.dataset.i;
    const fromY = y => { const r = b.getBoundingClientRect(); return (0.5 - (y - r.top) / r.height) / 0.44 * EQ_MAX; };
    b.addEventListener('pointerdown', ev => { b.setPointerCapture(ev.pointerId); b.classList.add('active'); setBand(root, i, fromY(ev.clientY)); });
    b.addEventListener('pointermove', ev => { if (b.hasPointerCapture(ev.pointerId)) setBand(root, i, fromY(ev.clientY)); });
    const end = () => b.classList.remove('active');
    b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
    b.addEventListener('keydown', ev => {
      const step = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[ev.key];
      if (step) { ev.preventDefault(); setBand(root, i, S.eq.bands[i] + step); }
    });
  });
  const bass = $('#eqz-bass', root);
  bass && bass.addEventListener('input', () => {
    S.eq.bass = +bass.value; S.eq.on = true; bass.style.setProperty('--p', bass.value + '%');
    $('#eqz-bass-val', root).textContent = S.eq.bass ? S.eq.bass + '%' : 'Off';
    refreshEq(root);
  });
}
function eqRoot() { return $('.eqz', overlayEl) ? overlayEl : $('.screen:last-child', screensEl); }

/* ---------- Lyrics (D21) ----------
   Sources, in order: <same name>.lrc → <same name>.txt → lyrics embedded in the audio file → none.
   .lrc and embedded text are parsed as LRC: with timestamps they are synced, without them plain. */
const LRC_STAMP = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
function parseLrc(text) {
  let offset = 0;
  const timed = [], plain = [];
  text.replace(/^\uFEFF/, '').split(/\r?\n/).forEach(raw => {
    const tag = raw.match(/^\[([a-z]+):(.*)\]\s*$/i); // [ar:], [ti:], [al:], [by:], [length:], [offset:]
    if (tag) { if (tag[1].toLowerCase() === 'offset') offset = parseInt(tag[2], 10) || 0; return; }
    const head = raw.match(/^(?:\[\d{1,2}:\d{2}(?:[.:]\d{1,3})?\])+/);
    if (!head) { plain.push(raw); return; }
    // word-level timestamps (<mm:ss.xx>) are dropped; the line is shown whole
    const line = raw.slice(head[0].length).replace(/<\d{1,2}:\d{2}(?:[.:]\d{1,3})?>/g, '').replace(/\s+/g, ' ').trim();
    for (const t of head[0].matchAll(LRC_STAMP)) timed.push({ t: +t[1] * 60 + +t[2] + (t[3] ? +('0.' + t[3]) : 0), text: line });
  });
  if (!timed.length) return { synced: false, text: plain.join('\n').trim() };
  // a positive offset shows the lyrics earlier (LRC convention)
  timed.forEach(l => { l.t = Math.max(0, l.t - offset / 1000); });
  return { synced: true, lines: timed.sort((x, y) => x.t - y.t) };
}
const lyricsCache = {};
function lyricsFor(m) {
  const l = D.lyrics[m.id];
  if (!l) return null;
  if (!lyricsCache[m.id]) {
    const parsed = l.source === 'txt' ? { synced: false, text: l.text.replace(/^\uFEFF/, '') } : parseLrc(l.text);
    const file = m.file.replace(/\.[^.]+$/, '.' + l.source);
    lyricsCache[m.id] = { ...parsed, source: l.source, file, from: l.source === 'embedded' ? 'Lyrics stored in the audio file' : `Lyrics from ${file}` };
  }
  return lyricsCache[m.id];
}
const npPanelKey = () => { if (!S.lyricsOpen) return 'now-playing'; const ly = current() && lyricsFor(current()); return !ly ? 'lyrics-none' : ly.synced ? 'lyrics' : 'lyrics-plain'; };

function lyricsBody(m) {
  const ly = lyricsFor(m);
  if (!ly) return `<div class="ly-empty">${emptyRecord('No lyrics for this song', 'Put a .lrc or .txt file with the same name next to the song.', false)}</div>`;
  if (!ly.synced) return `<div class="ly-note">${iconHtml('notes')}These lyrics aren't synced with the song.</div>
    <div class="ly-plain">${esc(ly.text)}</div><div class="ly-from">${esc(ly.from)}</div>`;
  return `<div class="ly-lines">${ly.lines.map((l, i) => l.text
      ? `<button class="ly-line" data-action="lyrics-seek" data-i="${i}">${esc(l.text)}</button>`
      : `<div class="ly-gap" data-i="${i}" role="img" aria-label="Instrumental"><i></i><i></i><i></i></div>`).join('')}</div>
    <div class="ly-from">${esc(ly.from)}</div>`;
}

// Following the song: the current line stays at about a third of the view. Scrolling by hand pauses
// it and shows "Back to current line"; it resumes on tap or after a few seconds.
const LY = { song: null, follow: true, cur: -2, autoAt: 0, dragging: false, resume: null, scroll: 0 };
const LY_RESUME_MS = 5000;
const autoScrollOn = () => S.lyricsAutoScroll;
function renderLyricsView(m, a) {
  const sameSong = LY.song === m.id;
  const prevScroll = sameSong ? ($('#ly-scroll') ? $('#ly-scroll').scrollTop : LY.scroll) : 0;
  if (!sameSong) { LY.song = m.id; clearTimeout(LY.resume); }
  if (!sameSong || !autoScrollOn()) LY.follow = autoScrollOn();
  const synced = !!(lyricsFor(m) && lyricsFor(m).synced);
  LY.cur = -2;
  npEl.innerHTML = `
    <div class="np-top">
      <button class="icon-btn" data-action="close-np" aria-label="Collapse player">${iconHtml('expand_more')}</button>
      <div class="src"><b>${esc(m.title)}</b><span class="ar">${esc(m.artist)}${a.noMetadata ? '' : ' · ' + esc(a.title)}</span></div>
      <button class="ly-disc" data-action="lyrics" aria-label="Hide lyrics">${record({ a, withArm: false, player: true })}</button>
    </div>
    <div class="ly-wrap">
      <div class="ly-scroll" id="ly-scroll">${lyricsBody(m)}</div>
      ${synced ? `<button class="icon-btn ly-auto ${autoScrollOn() ? 'on' : ''}" data-action="lyrics-autoscroll" aria-label="Auto-scroll" aria-pressed="${autoScrollOn()}">${iconHtml('vertical_align_center')}</button>` : ''}
      <button class="btn btn-tonal ly-back" data-action="lyrics-follow" ${LY.follow ? 'hidden' : ''}>${iconHtml('vertical_align_center')}Back to current line</button>
    </div>
    ${seekHtml(m)}
    <div class="np-controls ly-controls">
      <button class="icon-btn on" data-action="lyrics" aria-label="Hide lyrics" aria-pressed="true">${iconHtml('lyrics')}</button>
      <button class="icon-btn" data-action="previous" aria-label="Previous song">${iconHtml('skip_previous', 'fill big')}</button>
      <button class="play sm ${S.playing ? 'is-playing' : ''}" data-action="play" aria-label="${S.playing ? 'Pause' : 'Play'}">${iconHtml(S.playing ? 'pause' : 'play_arrow', 'fill')}</button>
      <button class="icon-btn" data-action="next" aria-label="Next song">${iconHtml('skip_next', 'fill big')}</button>
      <button class="icon-btn" data-action="queue" aria-label="Queue">${iconHtml('queue_music')}</button>
    </div>`;
  const sc = $('#ly-scroll', npEl);
  const userScrolled = () => { if (synced && autoScrollOn()) pauseFollow(); };
  sc.addEventListener('wheel', userScrolled, { passive: true });
  sc.addEventListener('touchmove', userScrolled, { passive: true });
  sc.addEventListener('pointerdown', () => { LY.dragging = true; });
  sc.addEventListener('pointerup', () => { LY.dragging = false; });
  sc.addEventListener('scroll', () => { LY.scroll = sc.scrollTop; if (LY.dragging && performance.now() - LY.autoAt > 800) userScrolled(); }, { passive: true });
  sc.scrollTop = prevScroll;
  updateLyrics(!sameSong || LY.follow ? 'jump' : false);
}
function updateLyrics(scroll = 'smooth') {
  const sc = $('#ly-scroll'); const m = current();
  if (!sc || !m) return;
  const ly = lyricsFor(m);
  if (!ly || !ly.synced) return;
  let i = -1;
  while (i + 1 < ly.lines.length && ly.lines[i + 1].t <= S.pos + 0.05) i++;
  if (i === LY.cur && scroll !== 'jump') return;
  LY.cur = i;
  $$('.ly-lines [data-i]', sc).forEach(el => { const k = +el.dataset.i; el.classList.toggle('cur', k === i); el.classList.toggle('past', k < i); });
  if (LY.follow && scroll) scrollLyrics(scroll === 'smooth');
}
function scrollLyrics(smooth) {
  const sc = $('#ly-scroll'); if (!sc) return;
  const el = $('.ly-lines .cur', sc);
  const top = el ? el.offsetTop + el.offsetHeight / 2 - sc.clientHeight * 0.35 : 0;
  LY.autoAt = performance.now();
  sc.scrollTo({ top: Math.max(0, top), behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
}
function pauseFollow() {
  LY.follow = false;
  const b = $('.ly-back'); if (b) b.hidden = false;
  clearTimeout(LY.resume);
  LY.resume = setTimeout(resumeFollow, LY_RESUME_MS);
}
function resumeFollow() {
  clearTimeout(LY.resume);
  if (!autoScrollOn()) return;
  LY.follow = true;
  const b = $('.ly-back'); if (b) b.hidden = true;
  scrollLyrics(true);
}
function toggleLyrics(on = !S.lyricsOpen) {
  S.lyricsOpen = on;
  LY.song = null;
  renderNowPlaying();
  updatePanel(npPanelKey());
}

/* ============================================================
   Sheets, dialogs and snackbars
   ============================================================ */
function openSheet(html, key) {
  closeOverlay(true);
  overlayEl.innerHTML = `<div class="scrim" data-action="close-overlay"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  requestAnimationFrame(() => { $('.scrim', overlayEl).classList.add('on'); $('.sheet', overlayEl).classList.add('on'); });
  if (key) updatePanel(key);
}
function openDialog(html, key) {
  closeOverlay(true);
  overlayEl.innerHTML = `<div class="scrim" data-action="close-overlay"></div><div class="dialog-wrap"><div class="dialog" role="alertdialog" aria-modal="true">${html}</div></div>`;
  requestAnimationFrame(() => { $('.scrim', overlayEl).classList.add('on'); $('.dialog', overlayEl).classList.add('on'); const f = $('input', overlayEl); f && f.focus(); });
  if (key) updatePanel(key);
}
function closeOverlay(immediate = false) {
  const sys = $('.sys, .sys-dialog, .shade, .lock', app);
  if (sys && !immediate) { $$('.sys, .sys-dialog, .shade, .lock, .sys-tag', app).forEach(e => e.remove()); return true; }
  if (!overlayEl.children.length) return false;
  if (immediate) { overlayEl.innerHTML = ''; return true; }
  const v = $('.scrim', overlayEl), s = $('.sheet, .dialog', overlayEl);
  v && v.classList.remove('on'); s && s.classList.remove('on');
  setTimeout(() => { if (!overlayEl.querySelector('.on')) overlayEl.innerHTML = ''; }, T.motion.duration.medium);
  updatePanelForCurrent();
  return true;
}
let snackbarTimer;
function snackbar(msg, action, fn) {
  const area = $('#snack-area');
  clearTimeout(snackbarTimer);
  area.innerHTML = `<div class="snack" role="status"><span>${msg}</span>${action ? `<button>${action}</button>` : ''}</div>`;
  positionSnackbar();
  if (action) $('button', area).addEventListener('click', () => { fn(); area.innerHTML = ''; });
  snackbarTimer = setTimeout(() => { const s = $('.snack', area); if (s) { s.classList.add('leaving'); setTimeout(() => s.remove(), 200); } }, action ? 5000 : 3000);
}
function positionSnackbar() {
  const area = $('#snack-area');
  const np = npEl.classList.contains('open');
  const b = $('#bottom');
  if (S.drive.on) { area.style.bottom = (S.drive.landscape ? 16 : 104) + 'px'; return; }
  area.style.bottom = (np ? 40 : b.hidden ? 40 : b.offsetHeight + 12) + 'px';
}

/* Song menu */
function songMenu(id) {
  const m = song(id), a = album(m.album);
  const fav = S.favoriteSongs.has(id);
  openSheet(`<div class="s-head"><div class="cover">${cover(a)}</div><div style="min-width:0"><div class="ti">${esc(m.title)}</div><div class="ar">${esc(m.artist)}</div></div></div>
    <div class="s-body">
      <button class="menu-i" data-action="play-next" data-mid="${id}">${iconHtml('playlist_play')}Play next</button>
      <button class="menu-i" data-action="add-to-queue" data-mid="${id}">${iconHtml('add_to_queue')}Add to end of queue</button>
      <button class="menu-i" data-action="add-to-playlist" data-mid="${id}">${iconHtml('playlist_add')}Add to playlist</button>
      <button class="menu-i" data-action="favorite" data-mid="${id}">${iconHtml('favorite', fav ? 'fill' : '')}${fav ? 'Remove from favorite songs' : 'Add to favorite songs'}</button>
      ${a.noMetadata ? '' : `<button class="menu-i" data-action="album" data-id="${a.id}">${iconHtml('album')}Go to album</button>
      <button class="menu-i" data-action="artist" data-name="${esc(m.artist)}">${iconHtml('mic')}Go to artist</button>`}
      <button class="menu-i" data-action="file-info" data-mid="${id}">${iconHtml('info')}File details</button>
    </div>`, 'menu');
}
function fileInfo(id) {
  const m = song(id);
  openDialog(`${iconHtml('description')}<h4>File details</h4>
    <p style="display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin-bottom:20px">
      <b>File</b><span style="word-break:break-all">${esc(m.file)}</span>
      <b>Folder</b><span>${esc(m.folder)}</span>
      <b>Duration</b><span>${fmt(m.duration)}</span>
      <b>Format</b><span>MP3 · 320 kbps · 44.1 kHz</span>
      <b>Cover</b><span>${S.useFolderImages && album(m.album).cover ? esc(album(m.album).cover) + ' (album folder)' : 'Generated by the app'}</span>
      <b>Lyrics</b><span>${(ly => !ly ? 'None' : (ly.source === 'embedded' ? 'Embedded in the file' : esc(ly.file) + ' (next to the song)') + (ly.synced ? ' · synced' : ''))(lyricsFor(m))}</span>
    </p>
    <div class="acts"><button class="btn btn-text" data-action="close-overlay">Close</button></div>`);
}
function pickPlaylist(id) {
  openSheet(`<h3>Add to playlist</h3><div class="s-body">
    <button class="menu-i" data-action="new-playlist" data-mid="${id}">${iconHtml('add')}New playlist</button>
    ${S.playlists.map(p => { const has = p.songs.includes(id); return `<button class="menu-i ${has ? 'sel' : ''}" data-action="add-to-this-playlist" data-pid="${p.id}" data-mid="${id}">${iconHtml('queue_music')}${esc(p.name)}${has ? `<span class="end">${iconHtml('check')}</span>` : ''}</button>`; }).join('')}
  </div>`);
}
function queueRows() {
  return S.queue.map((mid, i) => {
    const m = song(mid);
    const cls = i === S.idx ? 'active' : i < S.idx ? 'played' : '';
    return `${i === S.idx ? '<div class="q-label">Now playing</div>' : ''}${i === S.idx + 1 ? '<div class="q-label">Up next</div>' : ''}
      <div class="q-row ${cls}" data-mid="${mid}" data-action="jump-to" data-i="${i}">
        ${iconHtml('drag_indicator', 'drag')}<div class="cover">${cover(album(m.album))}${eq}</div>
        <div style="min-width:0"><div class="ti">${esc(m.title)}</div><div class="ar">${esc(m.artist)} · ${fmt(m.duration)}</div></div>
        ${i > S.idx ? `<button class="icon-btn" data-action="remove-from-queue" data-i="${i}" aria-label="Remove from queue">${iconHtml('close')}</button>` : '<span style="width:48px"></span>'}
      </div>`;
  }).join('');
}
function openQueue() {
  const remaining = S.queue.length - S.idx - 1;
  openSheet(`<h3 style="display:flex;justify-content:space-between;align-items:center">Queue <span style="font:var(--type-caption);color:var(--color-text-2)">${plural(remaining, 'song', 'songs')} up next</span></h3>
    <div class="s-body" id="queue-list">${queueRows()}</div>`, 'queue');
  markActive();
  const activeEl = $('.q-row.active', overlayEl); activeEl && activeEl.scrollIntoView({ block: 'center' });
}
function openTimer() {
  const opts = [[15, '15 min'], [30, '30 min'], [45, '45 min'], [60, '1 hour']];
  openSheet(`<h3>Sleep timer</h3>
    <p style="margin:-6px 20px 16px;font:var(--type-body-s);color:var(--color-text-2)">Music stops on its own after the chosen time.</p>
    <div class="timer-opts">${opts.map(([m, n]) => `<button data-action="set-timer" data-min="${m}">${n}</button>`).join('')}
      <button class="wide ${S.timer && S.timer.endOfSong ? 'sel' : ''}" data-action="set-timer" data-min="end">At the end of this song</button>
      ${S.timer ? `<button class="wide" data-action="set-timer" data-min="0" style="color:var(--color-error)">Turn off timer</button>` : ''}</div>`, 'timer');
}

/* ---------- System folder picker (SAF) ---------- */
let pickerOrigin = 'onboarding';
function openPicker(origin = 'onboarding', path = '') {
  pickerOrigin = origin;
  $$('.sys, .sys-dialog, .sys-tag', app).forEach(e => e.remove());
  const names = path ? path.split('/') : [];
  const folders = D.systemFolders.filter(x => path ? x.startsWith(path + '/') && !x.slice(path.length + 1).includes('/') : !x.includes('/'))
    .map(x => x.split('/').pop()).sort((a, b) => a.localeCompare(b, LOCALE));
  const files = [...allFolderImages(path), ...D.songs.filter(m => m.folder === path).map(m => m.file)];
  const blocked = !path || path === 'Download' || path === 'Android';
  const div = document.createElement('div');
  div.className = 'sys';
  div.innerHTML = `
    <div class="sys-top"><button data-sys="close" aria-label="Cancel">${iconHtml('close')}</button><span class="t">${path ? esc(names[names.length - 1]) : 'Internal storage'}</span><button aria-label="More">${iconHtml('more_vert')}</button></div>
    <div class="sys-crumb"><button data-sys-go="">Internal storage</button>${names.map((n, i) => ` ${iconHtml('chevron_right')} <button data-sys-go="${esc(names.slice(0, i + 1).join('/'))}">${esc(n)}</button>`).join('')}</div>
    <div class="sys-list">
      ${folders.map(p => `<div class="sys-item" data-sys-go="${esc((path ? path + '/' : '') + p)}">${iconHtml('folder', 'fill')}${esc(p)}</div>`).join('')}
      ${files.map(f => `<div class="sys-item file">${iconHtml(/\.(jpe?g|png|webp)$/i.test(f) ? 'image' : 'audio_file')}${esc(f)}</div>`).join('')}
      ${!folders.length && !files.length ? '<div class="sys-empty">No items</div>' : ''}
      ${blocked ? `<div class="sys-empty">${!path ? 'Open a folder to choose it.' : 'To protect your privacy, choose another folder.'}</div>` : ''}
    </div>
    <div class="sys-bottom"><button data-sys="use" ${blocked ? 'disabled' : ''}>Use this folder</button></div>`;
  app.appendChild(div);
  const tag = document.createElement('div'); tag.className = 'sys-tag'; tag.textContent = 'Android screen'; app.appendChild(tag);
  div.addEventListener('click', e => {
    const goTo = e.target.closest('[data-sys-go]');
    if (goTo) return openPicker(origin, goTo.dataset.sysGo);
    const b = e.target.closest('[data-sys]');
    if (!b) return;
    if (b.dataset.sys === 'close') { div.remove(); tag.remove(); updatePanelForCurrent(); }
    if (b.dataset.sys === 'use') requestAccess(path, div, tag);
  });
  updatePanel('picker');
}
function requestAccess(path, sysEl, tag) {
  const name = path.split('/').pop();
  const dlg = document.createElement('div');
  dlg.className = 'sys-dialog';
  dlg.innerHTML = `<div class="box"><h3>Allow <b>Vitrola Mp3</b> to access files in ${esc(name)}?</h3>
    <p>This will let Vitrola Mp3 access current and future content stored in ${esc(name)}.</p>
    <div class="acts"><button data-r="no">Cancel</button><button data-r="yes">Allow</button></div></div>`;
  app.appendChild(dlg);
  dlg.addEventListener('click', e => {
    const r = e.target.closest('[data-r]'); if (!r) return;
    dlg.remove();
    if (r.dataset.r === 'no') return;
    sysEl.remove(); tag.remove();
    const added = { id: 'p' + uid(), name, location: 'Internal storage', path };
    const alreadyCovered = S.folders.some(p => path === p.path || path.startsWith(p.path + '/'));
    S.folders = S.folders.filter(p => !p.path.startsWith(path + '/'));
    if (!alreadyCovered) S.folders.push(added);
    S.configured = true;
    if (pickerOrigin === 'onboarding') { S.folders = [added]; root('scan'); return; }
    const found = songsInFolder(path, true).length;
    render('none');
    if (alreadyCovered) snackbar(`"${esc(name)}" is already in the library`);
    else snackbar(found ? `Folder added · ${plural(found, 'song', 'songs')}` : 'Folder added · no songs found', 'Undo', () => { S.folders = S.folders.filter(p => p.id !== added.id); render('none'); });
  });
}

/* ---------- Notification and lock screen ---------- */
function notificationHtml() {
  const m = current(); const a = album(m.album);
  return `<div class="notif" role="region" aria-label="Media notification" style="background:color-mix(in srgb, ${albumColor(a)} 28%, #1B1714)">
    <div class="h">${iconHtml('album')}Vitrola Mp3 · ${esc(S.source ? S.source.name : a.title)}</div>
    <div class="main"><div style="min-width:0"><div class="t">${esc(m.title)}</div><div class="a">${esc(m.artist)}</div></div><div class="c">${cover(a)}</div></div>
    <div class="ctr">
      <button data-n="previous" aria-label="Previous">${iconHtml('skip_previous', 'fill')}</button>
      <button class="pp" data-n="play" aria-label="${S.playing ? 'Pause' : 'Play'}">${iconHtml(S.playing ? 'pause' : 'play_arrow', 'fill')}</button>
      <button data-n="next" aria-label="Next">${iconHtml('skip_next', 'fill')}</button>
      <div class="bar"><i style="width:${S.pos / m.duration * 100}%"></i></div>
      <button data-n="fav" aria-label="Favorite">${iconHtml('favorite', S.favoriteSongs.has(m.id) ? 'fill' : '')}</button>
    </div>
  </div>`;
}
function simulateSystem(kind) {
  if (!current()) { const ms = library(); if (!ms.length) return snackbar('Choose a folder and play a song first'); playList(ms.map(m => m.id), 0, { type: 'Playing from', name: 'All songs' }); }
  closeOverlay(true); $$('.shade, .lock', app).forEach(e => e.remove());
  const el = document.createElement('div');
  el.className = kind === 'lock-screen' ? 'lock' : 'shade';
  const paint = () => {
    const d = new Date();
    el.innerHTML = kind === 'lock-screen'
      ? `<div class="clock">${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}</div><div class="date">${d.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' })}</div>${notificationHtml()}<div class="hint">Tap outside the card to unlock</div>`
      : notificationHtml();
  };
  paint();
  el.addEventListener('refresh', paint);
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-n]');
    if (b) {
      e.stopPropagation();
      if (b.dataset.n === 'play') play(); if (b.dataset.n === 'next') next(); if (b.dataset.n === 'previous') previous();
      if (b.dataset.n === 'fav') toggleFavoriteSong(current().id);
      return;
    }
    if (!e.target.closest('.notif')) { el.remove(); updatePanelForCurrent(); }
  });
  app.appendChild(el);
  updatePanel(kind === 'lock-screen' ? 'sim-lock-screen' : 'sim-notification');
}

function toggleFavoriteAlbum(id) {
  const had = S.favoriteAlbums.has(id);
  const refresh = () => { markFavorites(); if (currentScreen === 'favorite-albums') render('none'); };
  had ? S.favoriteAlbums.delete(id) : S.favoriteAlbums.add(id);
  refresh();
  snackbar(had ? 'Album removed from favorites' : 'Album added to favorites', 'Undo', () => { had ? S.favoriteAlbums.add(id) : S.favoriteAlbums.delete(id); refresh(); });
}
function toggleFavoriteSong(id) {
  const had = S.favoriteSongs.has(id);
  had ? S.favoriteSongs.delete(id) : S.favoriteSongs.add(id);
  markFavorites();
  snackbar(had ? 'Removed from favorite songs' : 'Added to favorite songs', 'Undo', () => { had ? S.favoriteSongs.add(id) : S.favoriteSongs.delete(id); markFavorites(); updatePlayer(); });
  updatePlayer();
}

/* ============================================================
   Actions (clicks)
   ============================================================ */
const ACTIONS = {
  'back': () => back(),
  'tab': b => tab(b.dataset.tab),
  'choose-folder': b => { closeOverlay(true); openPicker(b.dataset.origin || (S.configured ? 'settings' : 'onboarding'), ''); },
  'go-library': () => { S.libTab = 'artists'; root('library'); },
  'lib-tab': b => { S.libTab = b.dataset.tab; stack[0].params = {}; render('none'); },
  'sort': () => openSheet(`<h3>Sort songs</h3><div class="s-body">${Object.entries(SORTS).map(([k, n]) =>
      `<button class="menu-i ${S.sort === k ? 'sel' : ''}" data-action="set-sort" data-k="${k}">${iconHtml(S.sort === k ? 'radio_button_checked' : 'radio_button_unchecked')}${n}</button>`).join('')}</div>`),
  'set-sort': b => { S.sort = b.dataset.k; closeOverlay(); render('none'); },
  'album': b => { closeOverlay(true); if (npEl.classList.contains('open')) closeNowPlaying(); go('album', { id: b.dataset.id }); },
  'artist': b => { closeOverlay(true); if (npEl.classList.contains('open')) closeNowPlaying(); go('artist', { name: b.dataset.name }); },
  'artist-np': b => { if (album(current().album).noMetadata) return; closeNowPlaying(); go('artist', { name: b.dataset.name }); },
  'folder': b => go('folder', { path: b.dataset.path }),
  'playlist': b => go('playlist', { id: b.dataset.id }),
  'play-from': (b, e) => { if (e.target.closest('[data-action="menu"]')) return; const c = contexts[b.dataset.ctx]; playList(c.ids, +b.dataset.i, c.source, false); },
  'play-all': b => { const c = contexts[b.dataset.ctx]; playList(c.ids, 0, c.source, false); openNowPlaying(); },
  'shuffle-all': b => { const c = contexts[b.dataset.ctx]; playList(c.ids, Math.floor(Math.random() * c.ids.length), c.source, true); openNowPlaying(); },
  'menu': b => songMenu(b.dataset.mid),
  'album-menu': b => { const a = album(b.dataset.id); const ids = library().filter(m => m.album === a.id).map(m => m.id);
    openSheet(`<div class="s-head"><div class="cover">${cover(a)}</div><div><div class="ti">${esc(a.title)}</div><div class="ar">${esc(a.artistName)}</div></div></div><div class="s-body">
      ${a.noMetadata ? '' : `<button class="menu-i" data-action="favorite-album" data-id="${a.id}">${iconHtml('favorite', S.favoriteAlbums.has(a.id) ? 'fill' : '')}${S.favoriteAlbums.has(a.id) ? 'Remove from favorite albums' : 'Add to favorite albums'}</button>`}
      <button class="menu-i" data-action="play-next-many" data-ids="${ids.join(',')}">${iconHtml('playlist_play')}Play next</button>
      <button class="menu-i" data-action="queue-many" data-ids="${ids.join(',')}">${iconHtml('add_to_queue')}Add to end of queue</button>
      ${a.noMetadata ? '' : `<button class="menu-i" data-action="artist" data-name="${esc(a.artistName)}">${iconHtml('mic')}Go to artist</button>`}</div>`); },
  'play-next-many': b => { const ids = b.dataset.ids.split(','); if (!current()) return playList(ids, 0, { type: 'Playing', name: 'Queue' }); S.queue.splice(S.idx + 1, 0, ...ids); S.originalQueue.push(...ids); closeOverlay(); snackbar(`${plural(ids.length, 'song', 'songs')} will play next`); },
  'queue-many': b => { const ids = b.dataset.ids.split(','); if (!current()) return playList(ids, 0, { type: 'Playing', name: 'Queue' }); S.queue.push(...ids); S.originalQueue.push(...ids); closeOverlay(); snackbar(`${plural(ids.length, 'song', 'songs')} added to the queue`); },
  'playlist-menu': b => { const p = S.playlists.find(x => x.id === b.dataset.id);
    openSheet(`<h3>${esc(p.name)}</h3><div class="s-body">
      <button class="menu-i" data-action="rename-playlist" data-id="${p.id}">${iconHtml('edit')}Rename</button>
      <button class="menu-i" data-action="delete-playlist" data-id="${p.id}" style="color:var(--color-error)">${iconHtml('delete')}Delete playlist</button></div>`); },
  'rename-playlist': b => { const p = S.playlists.find(x => x.id === b.dataset.id);
    openDialog(`${iconHtml('edit')}<h4>Rename playlist</h4><input class="field" id="playlist-name" value="${esc(p.name)}" maxlength="40">
      <div class="acts"><button class="btn btn-text" data-action="close-overlay">Cancel</button><button class="btn btn-primary" data-action="save-name" data-id="${p.id}">Save</button></div>`); },
  'save-name': b => { const v = $('#playlist-name').value.trim(); if (!v) return; S.playlists.find(x => x.id === b.dataset.id).name = v; closeOverlay(); render('none'); snackbar('Playlist renamed'); },
  'delete-playlist': b => { const p = S.playlists.find(x => x.id === b.dataset.id);
    openDialog(`${iconHtml('delete', 'danger')}<h4>Delete "${esc(p.name)}"?</h4><p>The playlist goes away, but the songs stay in your library and on your phone.</p>
      <div class="acts"><button class="btn btn-text" data-action="close-overlay">Cancel</button><button class="btn btn-danger" data-action="confirm-delete" data-id="${p.id}">Delete</button></div>`); },
  'confirm-delete': b => { const i = S.playlists.findIndex(x => x.id === b.dataset.id); const [p] = S.playlists.splice(i, 1);
    closeOverlay(); back(); snackbar(`Playlist "${esc(p.name)}" deleted`, 'Undo', () => { S.playlists.splice(i, 0, p); render('none'); }); },
  'new-playlist': b => openDialog(`${iconHtml('queue_music')}<h4>New playlist</h4><input class="field" id="playlist-name" placeholder="Playlist name" maxlength="40">
      <div class="acts"><button class="btn btn-text" data-action="close-overlay">Cancel</button><button class="btn btn-primary" data-action="create-playlist" data-mid="${b.dataset.mid || ''}">Create</button></div>`, 'new-playlist'),
  'create-playlist': b => { const v = $('#playlist-name').value.trim(); if (!v) { $('#playlist-name').focus(); return; }
    const p = { id: 'pl' + uid(), name: v, songs: b.dataset.mid ? [b.dataset.mid] : [] }; S.playlists.push(p); closeOverlay();
    if (b.dataset.mid) snackbar(`Added to "${esc(v)}"`); else go('playlist', { id: p.id }); if (currentScreen === 'playlists') render('none'); },
  'add-to-playlist': b => pickPlaylist(b.dataset.mid),
  'add-to-this-playlist': b => { const p = S.playlists.find(x => x.id === b.dataset.pid); const id = b.dataset.mid;
    if (p.songs.includes(id)) { snackbar(`Already in "${esc(p.name)}"`); return; }
    p.songs.push(id); closeOverlay(); snackbar(`Added to "${esc(p.name)}"`, 'Undo', () => { p.songs = p.songs.filter(x => x !== id); }); },
  'play-next': b => { const id = b.dataset.mid; closeOverlay(); if (!current()) return playList([id], 0, { type: 'Playing', name: 'Queue' }); S.queue.splice(S.idx + 1, 0, id); S.originalQueue.push(id); snackbar('Will play next'); },
  'add-to-queue': b => { const id = b.dataset.mid; closeOverlay(); if (!current()) return playList([id], 0, { type: 'Playing', name: 'Queue' }); S.queue.push(id); S.originalQueue.push(id); snackbar('Added to the end of the queue'); },
  'favorite': b => { closeOverlay(); toggleFavoriteSong(b.dataset.mid); if (S.drive.on) renderDrive(); },
  'favorite-album': b => { closeOverlay(); toggleFavoriteAlbum(b.dataset.id); },
  'favorite-albums': () => go('favorite-albums'),
  'file-info': b => fileInfo(b.dataset.mid),
  'open-np': (b, e) => { if (e.target.closest('[data-action="play"],[data-action="next"]')) return; openNowPlaying(); },
  'close-np': () => closeNowPlaying(),
  'play': () => play(),
  'next': () => next(),
  'previous': () => previous(),
  'shuffle': () => toggleShuffle(),
  'repeat': () => toggleRepeat(),
  'queue': () => openQueue(),
  'lyrics': () => toggleLyrics(),
  'equalizer': () => go('equalizer'),
  'drive-open': () => { if (npEl.classList.contains('open')) closeNowPlaying(); enterDrive(false); },
  'drive-exit': () => exitDrive(),
  'drive-tab': b => { S.drive.tab = b.dataset.t; S.drive.sub = null; renderDrive(); updatePanel(driveKey()); },
  'drive-sub': b => { S.drive.sub = b.dataset.sub || null; renderDrive(); },
  'drive-play': b => drivePlay(b.dataset.k),
  'drive-auto': () => {
    if (S.drive.auto) { S.drive.auto = false; render('none'); return snackbar('Driving mode won\'t start on its own'); }
    const pick = () => { S.drive.btGranted = true; chooseCar(); };
    if (S.drive.btGranted) return pick();
    systemPermission('Allow <b>Vitrola Mp3</b> to find, connect to and determine the relative position of nearby devices?', '', pick,
      () => snackbar('Vitrola Mp3 needs this permission to recognize your car'));
  },
  'drive-car': () => chooseCar(),
  'drive-set-car': b => { S.drive.car = b.dataset.name; S.drive.auto = true; closeOverlay(); if (currentScreen === 'settings') render('none'); snackbar(`Driving mode will start when ${esc(S.drive.car)} connects`); },
  'eq-sheet': () => { openSheet(`<h3>Equalizer</h3><div class="s-body">${eqHtml()}</div>`, 'eq-sheet'); bindEq(overlayEl); },
  'eq-toggle': (b, e) => { S.eq.on = !S.eq.on; refreshEq(eqRoot()); snackbar(S.eq.on ? `Equalizer on · ${eqPresetName(S.eq.preset)}` : 'Equalizer off'); },
  'eq-preset': b => { const k = b.dataset.p; S.eq.preset = k; S.eq.bands = (k === 'custom' ? S.eq.custom : EQ_PRESETS[k][1]).slice(); S.eq.on = true; refreshEq(eqRoot()); },
  'lyrics-seek': b => { const ly = lyricsFor(current()); S.pos = Math.min(ly.lines[+b.dataset.i].t, current().duration - 1); LY.follow = autoScrollOn(); const back = $('.ly-back'); if (back) back.hidden = true; clearTimeout(LY.resume); updateProgress(); updateLyrics('smooth'); },
  'lyrics-follow': () => resumeFollow(),
  'lyrics-autoscroll': b => {
    const off = autoScrollOn();
    S.lyricsAutoScroll = !off;
    b.setAttribute('aria-pressed', !off); b.classList.toggle('on', !off);
    if (off) { clearTimeout(LY.resume); LY.follow = false; const back = $('.ly-back'); if (back) back.hidden = true; snackbar('Auto-scroll off'); }
    else { resumeFollow(); snackbar('Auto-scroll on'); }
  },
  'jump-to': (b, e) => { if (e.target.closest('[data-action="remove-from-queue"]')) return; S.idx = +b.dataset.i; S.pos = 0; play(true); updatePlayer(); },
  'remove-from-queue': b => { const i = +b.dataset.i; const [id] = S.queue.splice(i, 1); $('#queue-list').innerHTML = queueRows(); markActive(); snackbar('Removed from queue', 'Undo', () => { S.queue.splice(i, 0, id); const l = $('#queue-list'); if (l) l.innerHTML = queueRows(); }); },
  'timer': () => openTimer(),
  'set-timer': b => { const v = b.dataset.min; closeOverlay();
    if (v === '0') { S.timer = null; snackbar('Sleep timer off'); }
    else if (v === 'end') { S.timer = { endOfSong: true }; snackbar('Music will stop at the end of this track'); }
    else { S.timer = { end: Date.now() + v * 60000 }; snackbar(`Music will stop in ${v} min`); }
    if (npEl.classList.contains('open')) renderNowPlaying(); if (currentScreen === 'settings') render('none'); },
  'toggle': b => { const k = b.dataset.k;
    if (k === 'spinRecord') { if (S.spinRecord) S.angle = S.playing && !reduceMotion ? coastTo(currentAngle()) : S.angle; else S.spinningSince = performance.now(); }
    S[k] = !S[k]; const sw = $('.switch', b); sw && sw.setAttribute('aria-checked', S[k]);
    if (k === 'useFolderImages') { setTimeout(() => { render('none'); renderMini(); }, 250); snackbar(S[k] ? 'Using folder photos and covers' : 'Using app-generated covers'); }
    if (k === 'spinRecord') { syncRecords(true); snackbar(S[k] ? 'The record spins again' : 'The record stays still'); }
    if (k === 'subfolders') { setTimeout(() => render('none'), 250); snackbar(S[k] ? 'Subfolders included' : `Only files directly in the chosen folders · ${plural(library().length, 'song', 'songs')}`); } },
  'remove-folder': b => { const p = S.folders.find(x => x.id === b.dataset.id); const n = songsInFolder(p.path, true).length;
    openDialog(`${iconHtml('folder_off', 'danger')}<h4>Remove "${esc(p.name)}"?</h4><p>${plural(n, 'song leaves', 'songs leave')} the library. The files stay on your phone.</p>
      <div class="acts"><button class="btn btn-text" data-action="close-overlay">Cancel</button><button class="btn btn-danger" data-action="confirm-remove" data-id="${p.id}">Remove</button></div>`, 'remove-folder'); },
  'confirm-remove': b => { const i = S.folders.findIndex(x => x.id === b.dataset.id); const [p] = S.folders.splice(i, 1); closeOverlay();
    if (current() && !inLibrary(current())) { S.queue = []; S.playing = false; }
    render('none'); snackbar(`Folder "${esc(p.name)}" removed`, 'Undo', () => { S.folders.splice(i, 0, p); render('none'); }); },
  'rescan': () => { snackbar('Looking for new songs…'); setTimeout(() => snackbar(`Library up to date · ${plural(library().length, 'song', 'songs')}, nothing new`), 1600); },
  'battery': () => snackbar('In the app, this opens the Android battery settings'),
  'theme': b => setTheme(b.dataset.themeChoice),
  'show-all-songs': () => { S.showAllSongs = true; $('#q').dispatchEvent(new Event('input')); },
  'clear-search': () => { const i = $('#q'); i.value = ''; i.dispatchEvent(new Event('input')); i.focus(); },
  'recent': b => { const i = $('#q'); i.value = b.dataset.q; i.dispatchEvent(new Event('input')); },
  'clear-recents': () => { S.recentSearches = []; $('#q').dispatchEvent(new Event('input')); },
  'close-overlay': () => closeOverlay(),
};

app.addEventListener('click', e => {
  const tabBtn = e.target.closest('#bnav [data-tab]');
  if (tabBtn) return tab(tabBtn.dataset.tab);
  const b = e.target.closest('[data-action]');
  if (!b || !app.contains(b)) return;
  // the innermost click wins (e.g. the ⋮ button inside a row)
  const fn = ACTIONS[b.dataset.action];
  if (fn) { e.preventDefault(); fn(b, e); }
});
app.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('[data-action][tabindex]')) { e.target.click(); }
  if (e.key === 'Enter' && e.target.id === 'playlist-name') { const ok = $('[data-action="create-playlist"], [data-action="save-name"]', overlayEl); ok && ok.click(); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') back(); });

/* ============================================================
   Theme
   ============================================================ */
function setTheme(t) {
  if (t === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
  try { localStorage.setItem('vitrola-mockup-theme', t); } catch (e) {}
  $$('#panel-theme button, .theme-seg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.themeChoice === t));
}
$$('#panel-theme button').forEach(b => b.addEventListener('click', () => setTheme(b.dataset.themeChoice)));

/* ============================================================
   Panel: screen shortcuts, simulations and notes
   ============================================================ */
const NOTES = {
  'welcome': 'First launch. Presents the app\'s three promises and goes straight to choosing the folder. The tonearm drops onto the record on open.',
  'picker': 'This is Android\'s own screen (SAF), not the app. Browse to your music folder and tap "Use this folder". The root and "Download" are blocked by the system. Try choosing "WhatsApp" to see the no-music case.',
  'scan': 'Reads only the chosen folder and shows real progress, file by file. At the end it summarizes what it found.',
  'library-songs': 'Filters at the top, "Play" and "Shuffle", and sorting (A–Z, recent, most played). Tap a song to play it; ⋮ opens the menu.',
  'library-albums': 'Album grid with covers. MP3s without a cover get one generated from the album name.',
  'library-artists': 'Main screen when the app opens. Artists in a grid, with the photo from the artist folder (folder.jpg, or its only image). Without a photo, the artist\'s first album cover is shown.',
  'library-folders': 'The library seen through folders. Useful for people who organize everything in folders, and shows exactly what was read.',
  'album': 'The heart next to Play/Shuffle favorites the album. Album details: large cover, numbered tracks and the source folder at the bottom.',
  'artist': 'Large artist photo at the top with the name over it. Without a photo (e.g. Titãs), the album cover becomes a blurred background. Then come the albums and songs.',
  'folder': 'Browsing by folder: artist folders show the photo and album folders show the cover. The image in use is highlighted: folder.jpg, or the folder\'s only image (Tim Maia, Transa). Cabeça Dinossauro has two images and no folder.jpg, so it uses the generated cover.',
  'search': 'Instant search across songs, albums and artists, ignoring accents ("aguas" finds "Águas"). Results are always split into three sections. Recent searches are saved.',
  'playlists': 'Automatic playlists (favorite songs, favorite albums, most played, recently added) and your own.',
  'favorite-albums': 'Albums marked with the heart, on the album page or in its ⋮ menu.',
  'playlist': 'Playlist details. The ⋮ at the top lets you rename or delete it.',
  'settings': 'Library folders (add and remove), subfolders, folder images, equalizer, timer, resume, headphones, driving mode, battery tip, theme and "Spinning record" (turn it off to keep the record still everywhere; D25).',
  'now-playing': 'Touch the spinning record: holding it stops the music, turning it faster or slower speeds the music up or slows it down (the bubble shows the speed here; in the app you hear it), and letting go returns to normal (D27). The tonearm stays on the record while music plays and goes back to its rest when you pause or the queue ends. ' + 'The album cover becomes the record label. The arm drops when playing and lifts when paused, and the record slows down. The background takes a hint of the cover color. Tap the info icon to see the file.',
  'lyrics': 'Synced lyrics from a .lrc file next to the song (D21). The current line is highlighted and stays in view; tap a line to jump there. Scroll by hand and "Back to current line" appears; following resumes on its own after 5 seconds. To read freely, turn off auto-scroll with the floating icon at the bottom right of the lyrics (it shows a dot while on). The choice is global and saved: it applies to every song until you change it. The current line is still highlighted. Tap the small record (or the lyrics button) to go back to the record. "Corcovado" has LRC text stored inside the MP3 and is synced too. The lyrics are invented placeholders.',
  'lyrics-plain': 'Plain lyrics from a .txt file (D21): shown as written, with no automatic scrolling. "Só Tinha de Ser com Você" (lyrics stored inside the MP3) and "Inútil Paisagem" (a .lrc without timestamps) look the same. The lyrics are invented placeholders.',
  'lyrics-none': 'No .lrc, no .txt and no lyrics inside the MP3: the lyrics view says how to add them. The lyrics button is always in Now playing, so the feature is easy to find.',
  'drive': 'Driving mode (D24): a simplified player for the car, with big text and buttons and only the essentials (favorite, previous, play/pause, next, shuffle). No seeking, search, menus or dialogs. The screen stays on while it is open. Open it from the car button in Now playing or from Settings › Driving; in Settings it can also start on its own when your car\'s Bluetooth connects (try "Car Bluetooth connects" under Simulate).',
  'drive-music': 'Driving mode › Music: a few big tiles that start playing right away and go back to Now playing. Playlists opens one simple list, never deeper.',
  'drive-landscape': 'Driving mode with the phone lying in a car mount: the tabs move to a side rail, the record goes to the left and the controls to the right.',
  'drive-car': 'Pick the car from the paired Bluetooth devices. Before this list, Android asks once for the "Nearby devices" permission.',
  'equalizer': 'Equalizer (D23): 10 fixed bands, the same on every phone. Pick a preset or drag the bands (that becomes "Custom", which is remembered). Bass boost and an on/off switch that keeps your settings. One setting for every song, saved. Also opens from the Now playing bottom row. On Android 8 the equalizer is hidden (its engine needs Android 9).',
  'eq-sheet': 'The equalizer opened from Now playing: the same controls as in Settings. The icon in Now playing shows a dot while the equalizer is on.',
  'queue': 'What already played, what\'s playing and what\'s up next. Jump to a song or remove it from the queue. (Drag to reorder is left for the app.)',
  'menu': 'Song menu: play next, queue, playlist, favorite, go to album or artist, and file details.',
  'timer': 'Sleep timer: preset times or "at the end of this song". The countdown shows in the player and in Settings.',
  'new-playlist': 'Quick creation: just the name.',
  'remove-folder': 'Removing a folder takes its songs out of the library but deletes nothing from the phone. It can be undone.',
  'empty': 'Library with no folder chosen.',
  'sim-notification': 'Android media notification: the controls work and stay in sync with the player. Tap outside to close.',
  'sim-lock-screen': 'Controls on the lock screen. Tap outside the card to go back.',
};
const SHORTCUTS = [
  ['welcome', 'Welcome', () => { reset(); }],
  ['picker', 'Folder picker (Android)', () => { reset(); openPicker('onboarding', ''); }],
  ['scan', 'Scan', () => { ensureLibrary(); root('scan'); }],
  ['library-artists', 'Library · Artists', () => { ensureLibrary(); S.libTab = 'artists'; root('library'); }],
  ['library-songs', 'Library · Songs', () => { ensureLibrary(); S.libTab = 'songs'; root('library'); }],
  ['library-albums', 'Library · Albums', () => { ensureLibrary(); S.libTab = 'albums'; root('library'); }],
  ['library-folders', 'Library · Folders', () => { ensureLibrary(); S.libTab = 'folders'; root('library'); }],
  ['album', 'Album', () => { ensureLibrary(); S.libTab = 'albums'; root('library'); go('album', { id: 'clube' }); }],
  ['artist', 'Artist', () => { ensureLibrary(); S.libTab = 'artists'; root('library'); go('artist', { name: 'Caetano Veloso' }); }],
  ['folder', 'Folder', () => { ensureLibrary(); S.libTab = 'folders'; root('library'); go('folder', { path: 'Music/MPB' }); }],
  ['search', 'Search', () => { ensureLibrary(); root('search'); }],
  ['playlists', 'Playlists', () => { ensureLibrary(); root('playlists'); }],
  ['playlist', 'Playlist', () => { ensureLibrary(); root('playlists'); go('playlist', { id: 'sunday' }); }],
  ['settings', 'Settings', () => { ensureLibrary(); root('settings'); }],
  ['equalizer', 'Equalizer', () => { ensureLibrary(); root('settings'); go('equalizer'); }],
  ['now-playing', 'Now playing', () => { ensurePlaying(); S.lyricsOpen = false; openNowPlaying(); }],
  ['lyrics', 'Lyrics · synced', () => { playElisTom(0, 40); S.lyricsOpen = true; openNowPlaying(); }],
  ['lyrics-plain', 'Lyrics · plain text', () => { playElisTom(1, 20); S.lyricsOpen = true; openNowPlaying(); }],
  ['lyrics-none', 'Lyrics · none', () => { playElisTom(4, 20); S.lyricsOpen = true; openNowPlaying(); }],
  ['queue', 'Queue', () => { ensurePlaying(); openNowPlaying(); setTimeout(openQueue, 200); }],
  ['drive', 'Driving mode', () => { ensurePlaying(); S.drive.landscape = false; enterDrive(false); }],
  ['drive-music', 'Driving mode · music', () => { ensurePlaying(); S.drive.landscape = false; enterDrive(false); S.drive.tab = 'music'; renderDrive(); updatePanel('drive-music'); }],
  ['drive-landscape', 'Driving mode · landscape', () => { ensurePlaying(); enterDrive(false); S.drive.landscape = true; renderDrive(); updatePanel('drive-landscape'); }],
  ['menu', 'Song menu', () => { ensureLibrary(); if (currentScreen !== 'library') { S.libTab = 'songs'; root('library'); } songMenu('elistom-1'); }],
  ['timer', 'Sleep timer', () => { ensurePlaying(); openNowPlaying(); setTimeout(openTimer, 200); }],
  ['empty', 'Empty library', () => { ensureLibrary(); S.folders = []; S.queue = []; S.playing = false; root('library'); updatePanel('empty'); }],
];
$('#jump').innerHTML = SHORTCUTS.map(([k, n], i) => `<button data-jump="${k}"><span class="n">${i + 1}</span>${n}</button>`).join('');
$('#jump').addEventListener('click', e => {
  const b = e.target.closest('[data-jump]'); if (!b) return;
  closeOverlay(true); $$('.sys, .sys-dialog, .sys-tag, .shade, .lock', app).forEach(x => x.remove());
  if (npEl.classList.contains('open') && !['now-playing', 'queue', 'timer', 'lyrics', 'lyrics-plain', 'lyrics-none'].includes(b.dataset.jump)) closeNowPlaying();
  if (S.drive.on && !b.dataset.jump.startsWith('drive')) exitDrive();
  SHORTCUTS.find(a => a[0] === b.dataset.jump)[2]();
  $('#panel').classList.remove('open');
});
function updatePanel(key) {
  $$('#jump button').forEach(b => b.setAttribute('aria-current', b.dataset.jump === key));
  $('#screen-note').textContent = NOTES[key] || '';
}
function updatePanelForCurrent() {
  const def = SCREENS[currentScreen];
  if (S.drive.on) return updatePanel(driveKey());
  updatePanel(npEl.classList.contains('open') ? npPanelKey() : def.key ? def.key(stack[stack.length - 1].params) : currentScreen);
}

const SIMULATIONS = {
  'notification': () => simulateSystem('notification'),
  'lock-screen': () => simulateSystem('lock-screen'),
  'reopen': () => {
    ensureLibrary();
    closeOverlay(true); $$('.sys, .sys-dialog, .sys-tag, .shade, .lock', app).forEach(x => x.remove());
    if (npEl.classList.contains('open')) closeNowPlaying();
    const last = current();
    if (S.playing) { S.angle = Math.ceil(currentAngle() / 360) * 360; S.playing = false; }
    if (!S.resume) { S.queue = []; }
    S.libTab = 'artists'; root('library');
    if (last && S.resume) snackbar(`Picking up where you left off: "${esc(last.title)}" at ${fmt(S.pos)}`, 'Play', () => play(true));
    else snackbar('App reopened from scratch');
  },
  'headphones': () => {
    if (!S.playing) return snackbar('Play a song first to try this');
    if (!S.pauseOnUnplug) return snackbar('Headphones disconnected · music keeps playing (option off in Settings)');
    play(false); snackbar('Headphones disconnected · music paused', 'Resume', () => play(true));
  },
  'broken-file': () => {
    ensureLibrary();
    const ms = library().map(m => m.id);
    if (!current()) playList(ms, Math.max(0, ms.indexOf('misc-3')), { type: 'Playing from', name: 'All songs' });
    const m = current();
    next(); play(true);
    snackbar(`Couldn't play "${esc(m.file)}". Skipped to the next one.`);
  },
  'lost-access': () => {
    ensureLibrary();
    const p = S.folders[0]; if (!p) return snackbar('No folder chosen');
    if (S.playing) play(false);
    openDialog(`${iconHtml('folder_off', 'danger')}<h4>We lost access to the "${esc(p.name)}" folder</h4>
      <p>This happens when the folder is moved or renamed, or when access is revoked in Android settings. Choose the folder again to keep listening.</p>
      <div class="acts"><button class="btn btn-text" data-action="close-overlay">Not now</button><button class="btn btn-primary" data-action="choose-folder" data-origin="settings">Choose folder</button></div>`);
  },
  'car': () => {
    if (S.drive.on && S.drive.autoEntered) { exitDrive(); return snackbar(`${esc(S.drive.car)} disconnected · driving mode off`); }
    if (!S.drive.auto || !S.drive.car) { ensureLibrary(); root('settings'); return snackbar('First turn on "Start automatically in the car" in Settings'); }
    if (npEl.classList.contains('open')) closeNowPlaying();
    enterDrive(true); snackbar(`Connected to ${esc(S.drive.car)} · driving mode on`);
  },
  'rotate': () => {
    if (!S.drive.on) { ensurePlaying(); enterDrive(false); }
    S.drive.landscape = !S.drive.landscape; renderDrive(); updatePanel(driveKey());
  },
  'reset': () => reset(),
};
$$('[data-simulate]').forEach(b => b.addEventListener('click', () => { SIMULATIONS[b.dataset.simulate](); $('#panel').classList.remove('open'); }));
$('#panel-fab').addEventListener('click', () => $('#panel').classList.toggle('open'));

function ensureLibrary() {
  if (!S.configured || !S.folders.length) { S.configured = true; S.folders = clone(D.chosenFolders); }
}
function ensurePlaying() {
  ensureLibrary();
  if (currentScreen === 'welcome' || currentScreen === 'scan') { S.libTab = 'artists'; root('library'); }
  if (!current()) { const a = library().filter(m => m.album === 'elistom'); playList(a.map(m => m.id), 0, { type: 'Playing from album', name: 'Elis & Tom' }, false); S.pos = 47; }
}
function playElisTom(i, pos) {
  ensureLibrary();
  if (currentScreen === 'welcome' || currentScreen === 'scan') { S.libTab = 'artists'; root('library'); }
  const ids = library().filter(m => m.album === 'elistom').map(m => m.id);
  playList(ids, i, { type: 'Playing from album', name: 'Elis & Tom' }, false);
  S.pos = pos; updateProgress();
}
function reset() {
  S = INITIAL_STATE();
  renderDrive();
  npEl.classList.remove('open');
  overlayEl.innerHTML = ''; $('#snack-area').innerHTML = '';
  $$('.sys, .sys-dialog, .sys-tag, .shade, .lock', app).forEach(x => x.remove());
  root('welcome');
}

/* ============================================================
   Start
   ============================================================ */
let savedTheme = 'auto';
try { savedTheme = localStorage.getItem('vitrola-mockup-theme') || 'auto'; } catch (e) {}
setTheme(savedTheme);
root('welcome');
})();
