/* Mockup navegável do Vitrola Mp3.
   Só para validar telas e interações: nada aqui é código do app. */
(() => {
'use strict';

const D = window.DADOS;
const T = window.TOKENS;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const screensEl = $('#screens');
const npEl = $('#np');
const overlayEl = $('#overlay');
const reduzMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   Utilidades
   ============================================================ */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const plural = (n, um, varios) => `${n.toLocaleString('pt-BR')} ${n === 1 ? um : varios}`;
function duracaoTotal(seg) {
  const min = Math.round(seg / 60);
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`;
}
let _uid = 0; const uid = () => ++_uid;
const clone = o => JSON.parse(JSON.stringify(o));
const embaralhar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function realcar(texto, q) {
  if (!q) return esc(texto);
  const i = norm(texto).indexOf(norm(q));
  if (i < 0) return esc(texto);
  return esc(texto.slice(0, i)) + `<mark class="hl">${esc(texto.slice(i, i + q.length))}</mark>` + esc(texto.slice(i + q.length));
}

/* ============================================================
   Estado
   ============================================================ */
const ESTADO_INICIAL = () => ({
  configurado: false,
  pastas: [],
  subpastas: true,
  retomar: true,
  pausarFone: true,
  usarImagens: true,
  playlists: clone(D.playlists),
  favoritas: new Set(D.favoritas),
  recentes: ['Milton', 'Águas de Março', 'Caetano'],
  libTab: 'musicas',
  ordem: 'az',
  // player
  fila: [], filaOriginal: [], idx: 0, tocando: false, pos: 0,
  aleatorio: false, repetir: 0, origem: null,
  timer: null,
  angulo: 0, giroDesde: 0,
});
let S = ESTADO_INICIAL();

const album = id => D.albuns.find(a => a.id === id);
const musica = id => D.musicas.find(m => m.id === id);
const atual = () => S.fila.length ? musica(S.fila[S.idx]) : null;

function naBiblioteca(m) {
  return S.pastas.some(p => S.subpastas ? (m.pasta === p.caminho || m.pasta.startsWith(p.caminho + '/')) : m.pasta === p.caminho);
}
const biblioteca = () => D.musicas.filter(naBiblioteca);
const albunsVisiveis = () => D.albuns.filter(a => biblioteca().some(m => m.album === a.id));
function artistas() {
  const map = new Map();
  biblioteca().forEach(m => {
    if (!map.has(m.artista)) map.set(m.artista, { nome: m.artista, musicas: [], albuns: new Set() });
    const a = map.get(m.artista); a.musicas.push(m.id); a.albuns.add(m.album);
  });
  return [...map.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}
const musicasDaPasta = (pasta, sub) => biblioteca().filter(m => sub ? (m.pasta === pasta || m.pasta.startsWith(pasta + '/')) : m.pasta === pasta);
function subpastasDe(pasta) {
  const set = new Set();
  biblioteca().forEach(m => { if (m.pasta.startsWith(pasta + '/')) set.add(m.pasta.slice(pasta.length + 1).split('/')[0]); });
  return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/* ============================================================
   Capas geradas (mesma regra do style guide)
   ============================================================ */
const P = T.primitivas;
const COMBOS = [
  [P.vinho[600], P.neutro[100], P.mostarda[400]], [P.mostarda[400], P.neutro[900], P.vinho[600]],
  [P.neutro[900], P.mostarda[300], P.vinho[400]], [P.neutro[100], P.vinho[600], P.mostarda[500]],
  [P.neutro[700], P.neutro[100], P.mostarda[400]], [P.vinho[800], P.mostarda[300], P.neutro[100]],
];
const hash = s => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const iniciais = s => s.split(/\s+/).filter(w => w.length > 2 || /^[A-Z0-9]/.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const corDoAlbum = a => a.semMetadados ? P.neutro[500] : (S.usarImagens && a.capa) ? CORES_FOTO[hash(a.titulo + '#') % CORES_FOTO.length][0] : COMBOS[hash(a.titulo) % COMBOS.length][0];
// Capa: imagem da pasta do álbum (simulada) → capa gerada (fallback)
const CORES_FOTO = [['#1F3A5F', '#E8B04B'], ['#0F5257', '#F2C57C'], ['#5B2333', '#F7B267'], ['#2D3A2E', '#D9C5A0'],
  ['#3B1F4A', '#F28C8C'], ['#7A3E1D', '#F4D35E'], ['#24476B', '#9AD1D4'], ['#4A3B2A', '#E07A5F']];
const usaImagem = x => S.usarImagens && !!(x.url || x.capa || x.foto);
function capaDaPasta(a) {
  // Simula uma capa "fotográfica" de verdade: cores e formas variadas, com o título pequeno
  const h = hash(a.titulo + '#'); const [c1, c2] = CORES_FOTO[h % CORES_FOTO.length];
  const formas = [
    `<circle cx="${120 + h % 40}" cy="${70 + h % 30}" r="58" fill="${c2}"/><rect y="132" width="200" height="68" fill="#000" fill-opacity=".28"/><rect y="148" width="200" height="6" fill="${c2}" fill-opacity=".5"/>`,
    [0, 1, 2, 3, 4].map(i => `<polygon points="${-40 + i * 56},200 ${i * 56},200 ${100 + i * 56},0 ${60 + i * 56},0" fill="${c2}" fill-opacity="${0.15 + (i % 2) * 0.35}"/>`).join(''),
    [80, 60, 40, 20].map((r, i) => `<rect x="${100 - r}" y="${100 - r}" width="${r * 2}" height="${r * 2}" fill="${i % 2 ? c1 : c2}" transform="rotate(${12 + h % 30} 100 100)"/>`).join(''),
  ][h % 3];
  return `<rect width="200" height="200" fill="${c1}"/>${formas}
    <text x="14" y="26" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="15" fill="#FFFDF8" fill-opacity=".92">${esc(a.titulo)}</text>`;
}
function capaInterna(a) {
  if (S.usarImagens && a.url) return `<image href="${esc(a.url)}" width="200" height="200" preserveAspectRatio="xMidYMid slice"/>`;
  if (S.usarImagens && a.capa) return capaDaPasta(a);
  return capaGerada(a);
}
// Capa gerada pelo app (sem imagem na pasta): mesma regra do style guide
function capaGerada(a) {
  if (a.semMetadados) {
    return `<rect width="200" height="200" fill="${P.neutro[300]}"/>
      ${[80, 60, 40].map(r => `<circle cx="100" cy="100" r="${r}" fill="none" stroke="${P.neutro[500]}" stroke-opacity=".35" stroke-width="8"/>`).join('')}
      <path d="M112 62v52a16 16 0 1 1-8-14V70h-20V62z" fill="${P.neutro[600]}"/>`;
  }
  const h = hash(a.titulo); const [bg, fg, ac] = COMBOS[h % COMBOS.length];
  const cx = 30 + (h >> 3) % 140, cy = 30 + (h >> 7) % 140;
  return `<rect width="200" height="200" fill="${bg}"/>
    ${[150, 120, 90, 60].map((r, i) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${fg}" stroke-opacity="${0.08 + i * 0.04}" stroke-width="10"/>`).join('')}
    <circle cx="${cx}" cy="${cy}" r="14" fill="${ac}"/>
    <text x="100" y="122" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="800" font-size="60" fill="${fg}">${esc(iniciais(a.titulo))}</text>`;
}
const capa = a => `<svg viewBox="0 0 200 200" aria-hidden="true">${capaInterna(a)}</svg>`;
const capaMusica = m => capa(album(m.album));

// Foto do artista: imagem da pasta do artista (simulada) → capa do primeiro álbum (fallback)
const artistaInfo = nome => D.artistas.find(a => a.nome === nome) || { nome, foto: null };
function fotoDaPasta(info) {
  // Simula um retrato: fundo colorido, luz e silhueta
  const h = hash(info.nome + '@'); const [c1, c2] = CORES_FOTO[h % CORES_FOTO.length];
  return `<rect width="200" height="200" fill="${c1}"/>
    <circle cx="${130 + h % 40}" cy="${40 + h % 30}" r="80" fill="${c2}" fill-opacity=".35"/>
    <circle cx="100" cy="86" r="36" fill="#000" fill-opacity=".42"/>
    <path d="M24 210 C30 146 66 128 100 128 C134 128 170 146 176 210 Z" fill="#000" fill-opacity=".42"/>`;
}
function fotoInterna(nome) {
  const info = artistaInfo(nome);
  if (S.usarImagens && info.url) return `<image href="${esc(info.url)}" width="200" height="200" preserveAspectRatio="xMidYMin slice"/>`;
  if (S.usarImagens && info.foto) return fotoDaPasta(info);
  const primeiro = D.albuns.find(a => a.artistaNome === nome && biblioteca().some(m => m.album === a.id)) || D.albuns.find(a => a.artistaNome === nome);
  return primeiro ? capaInterna(primeiro) : capaGerada({ titulo: nome });
}
const foto = (nome, ajuste = 'xMidYMid slice') => `<svg viewBox="0 0 200 200" preserveAspectRatio="${ajuste}" aria-hidden="true">${fotoInterna(nome)}</svg>`;

// Pastas de artista e de álbum (para mostrar a imagem certa na navegação por pasta)
const artistaDaPasta = c => D.artistas.find(a => a.pasta === c);
const albumDaPasta = c => D.albuns.find(a => a.pasta === c && !a.semMetadados);
function miniaturaPasta(c, icon = 'folder') {
  const ar = artistaDaPasta(c); if (ar) return `<div class="ic round">${foto(ar.nome)}</div>`;
  const al = albumDaPasta(c); if (al) return `<div class="ic">${capa(al)}</div>`;
  return `<div class="ic">${icone(icon)}</div>`;
}
function imagensDaPasta(c) {
  const ar = artistaDaPasta(c), al = albumDaPasta(c), out = [];
  if (ar && ar.foto) out.push({ arquivo: ar.foto, uso: 'foto do artista' });
  if (al && al.capa) out.push({ arquivo: al.capa, uso: 'capa do álbum' });
  return out;
}

/* ============================================================
   Disco com braço (player, boas-vindas, escaneamento)
   ============================================================ */
function disco({ a = null, braco = true, player = false, demo = false } = {}) {
  const id = uid();
  const cx = braco ? 150 : 100, cy = braco ? 160 : 100, R = braco ? 130 : 96, L = braco ? 50 : 38;
  const vb = braco ? '0 0 320 300' : '0 0 200 200';
  const sulcos = [];
  for (let r = R - 10; r > L + 6; r -= (braco ? 9 : 8)) sulcos.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" style="stroke:var(--cor-sulco)" stroke-width="1.3" stroke-opacity="${sulcos.length % 2 ? .55 : 1}"/>`);
  const selo = a
    ? `<g clip-path="url(#sl${id})"><svg x="${cx - L}" y="${cy - L}" width="${L * 2}" height="${L * 2}" viewBox="0 0 200 200">${capaInterna(a)}</svg></g>`
    : `<circle cx="${cx}" cy="${cy}" r="${L}" fill="#7A1F2B"/>`;
  const armSvg = braco ? `
    <g class="braco" style="transform-origin:296px 24px">
      <rect x="288" y="0" width="16" height="15" rx="4" fill="#8E8676"/>
      <path d="M296 24 L282 150 L240 190" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" transform="translate(3 4)"/>
      <path d="M296 24 L282 150 L240 190" fill="none" stroke="#CFC8B8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="228" y="183" width="24" height="14" rx="3.5" transform="rotate(-45 240 190)" fill="#E0A526"/>
      <circle cx="296" cy="24" r="17" fill="#8E8676"/><circle cx="296" cy="24" r="12.5" fill="#E0A526"/><circle cx="296" cy="24" r="5" fill="#1B1714"/>
    </g>` : '';
  const cls = [player ? '' : '', demo ? 'demo' : ''].join(' ').trim();
  return `<svg viewBox="${vb}" class="${cls}" ${player ? 'data-disco' : ''} aria-hidden="true">
    <defs><clipPath id="sl${id}"><circle cx="${cx}" cy="${cy}" r="${L}"/></clipPath></defs>
    <g class="gira" style="transform-origin:${cx}px ${cy}px">
      <circle cx="${cx}" cy="${cy}" r="${R}" style="fill:var(--cor-disco)"/>
      <circle cx="${cx}" cy="${cy}" r="${R - 1.5}" fill="none" stroke="#6A5B50" stroke-width="3"/>
      ${sulcos.join('')}
      <path d="M${cx - R * .78} ${cy - R * .34} A${R * .85} ${R * .85} 0 0 1 ${cx - R * .34} ${cy - R * .78}" fill="none" stroke="#fff" stroke-opacity=".17" stroke-width="${braco ? 10 : 8}" stroke-linecap="round"/>
      <path d="M${cx + R * .78} ${cy + R * .34} A${R * .85} ${R * .85} 0 0 1 ${cx + R * .34} ${cy + R * .78}" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="${braco ? 10 : 8}" stroke-linecap="round"/>
      ${selo}
      <circle cx="${cx}" cy="${cy}" r="${L}" fill="none" stroke="#E0A526" stroke-width="2" stroke-opacity=".85"/>
      <circle cx="${cx}" cy="${cy}" r="${braco ? 5 : 4}" style="fill:var(--cor-fundo)"/>
    </g>
    ${armSvg}
  </svg>`;
}

/* Rotação contínua dos discos do player: o ângulo é global, então
   mini player e tela cheia giram juntos e não "pulam" ao re-renderizar. */
const VOLTA = T.movimento.duracao['volta-disco'];
const anguloAtual = () => S.tocando ? S.angulo + (performance.now() - S.giroDesde) / VOLTA * 360 : S.angulo;
function sincronizarDiscos(desacelerar = false) {
  $$('svg[data-disco]').forEach(svg => {
    const g = $('.gira', svg);
    svg.classList.toggle('baixo', S.tocando);
    if (reduzMovimento) { g.style.animation = 'none'; return; }
    if (S.tocando) {
      g.style.transform = '';
      g.style.animation = `spin ${VOLTA}ms linear ${-((anguloAtual() % 360) / 360) * VOLTA}ms infinite`;
    } else if (desacelerar) {
      const de = S.angulo - 50;
      g.style.animation = 'none';
      g.animate([{ transform: `rotate(${de}deg)` }, { transform: `rotate(${S.angulo}deg)` }], { duration: 800, easing: 'cubic-bezier(.2,.6,.4,1)' });
      g.style.transform = `rotate(${S.angulo}deg)`;
    } else {
      g.style.animation = 'none';
      g.style.transform = `rotate(${S.angulo}deg)`;
    }
  });
}

/* ============================================================
   Navegação
   ============================================================ */
const ABAS = ['biblioteca', 'playlists', 'busca', 'ajustes'];
let pilha = [];
let telaAtual = null;
let contextos = {}; // listas tocáveis da tela atual

function ir(nome, params = {}, anim = 'push') {
  pilha.push({ nome, params });
  render(anim);
}
function voltar() {
  if (fecharSobreposicao()) return;
  if (npEl.classList.contains('aberto')) return fecharNP();
  if (pilha.length > 1) { pilha.pop(); render('pop'); }
}
function aba(nome) {
  if (pilha[0] && pilha[0].nome === nome && pilha.length === 1) { const sc = $('.screen', screensEl); sc && sc.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  pilha = [{ nome, params: {} }];
  render('fade');
}
function raiz(nome, params = {}) { pilha = [{ nome, params }]; render('fade'); }

function render(anim = 'fade') {
  const { nome, params } = pilha[pilha.length - 1];
  const def = TELAS[nome];
  contextos = {};
  const velho = $('.screen:last-child', screensEl);
  const el = document.createElement('div');
  el.className = 'screen';
  el.innerHTML = def.render(params);
  screensEl.appendChild(el);
  if (velho) {
    if (anim === 'push') { el.classList.add('push-in'); velho.classList.add('push-out'); }
    else if (anim === 'pop') { el.classList.add('pop-in'); velho.classList.add('pop-out'); }
    else el.classList.add('fade-in');
    const tempo = anim === 'none' ? 0 : T.movimento.duracao.media + 30;
    setTimeout(() => velho.remove(), tempo);
    $$('.screen', screensEl).slice(0, -2).forEach(s => s.remove());
  }
  telaAtual = nome;
  def.montar && def.montar(el, params);
  const bar = $('.topbar', el);
  if (bar) el.addEventListener('scroll', () => bar.classList.toggle('scrolled', el.scrollTop > 4), { passive: true });
  atualizarChrome();
  marcarAtivas();
  sincronizarDiscos();
  atualizarPainel(def.chave ? def.chave(params) : nome);
}

function atualizarChrome() {
  const def = TELAS[telaAtual];
  const semChrome = def.semChrome;
  $('#bottom').hidden = !!semChrome;
  const raizNome = pilha[0] && pilha[0].nome;
  $$('#bnav button').forEach(b => b.dataset.tab === raizNome ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
  renderMini();
  posicionarAviso();
}

/* Lista tocável: guarda os ids para o clique saber o que tocar */
function ctx(ids, origem) { const k = 'c' + uid(); contextos[k] = { ids, origem }; return k; }

/* ============================================================
   Peças de interface
   ============================================================ */
const icone = (n, extra = '') => `<span class="ms ${extra}">${n}</span>`;
const topbar = (titulo, { voltar: v = true, acoes = '', pequeno = false, sobreFoto = false } = {}) => `
  <header class="topbar ${sobreFoto ? 'sobre-foto' : ''}">
    ${v ? `<button class="icon-btn" data-a="voltar" aria-label="Voltar">${icone('arrow_back')}</button>` : ''}
    <h1 class="${pequeno ? 'small' : ''}">${titulo}</h1>${acoes}
  </header>`;
const eq = '<div class="eq"><i></i><i></i><i></i></div>';

function linhaMusica(m, k, i, { numero = false, q = '' } = {}) {
  const a = album(m.album);
  return `<div class="track" data-mid="${m.id}" data-a="tocar" data-ctx="${k}" data-i="${i}" tabindex="0">
    ${numero ? `<div class="num"><span class="n">${m.numero}</span>${eq}</div>` : `<div class="cover">${capa(a)}${eq}</div>`}
    <div style="min-width:0"><div class="ti">${realcar(m.titulo, q)}</div><div class="ar">${numero ? fmtArquivoSe(m) : realcar(m.artista, q)}</div></div>
    <span class="du">${fmt(m.duracao)}</span>
    <button class="icon-btn" data-a="menu" data-mid="${m.id}" aria-label="Mais opções de ${esc(m.titulo)}">${icone('more_vert')}</button>
  </div>`;
}
const fmtArquivoSe = m => album(m.album).semMetadados ? esc(m.arquivo) : esc(m.artista);

function listaMusicas(ids, origem, opts = {}) {
  const k = ctx(ids, origem);
  return ids.map((id, i) => linhaMusica(musica(id), k, i, opts)).join('');
}
function cartaoAlbum(a) {
  const n = biblioteca().filter(m => m.album === a.id).length;
  return `<div class="album" data-a="album" data-id="${a.id}" tabindex="0">
    <div class="art">${capa(a)}</div>
    <div class="ti">${esc(a.titulo)}</div>
    <div class="ar">${esc(a.artistaNome)}${a.ano ? ' · ' + a.ano : ''}</div>
  </div>`;
}
function vazioDisco(titulo, texto, botao = true) {
  return `<div class="empty">
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="84" fill="none" style="stroke:var(--cor-borda-forte)" stroke-width="2" stroke-dasharray="6 6"/>
      <circle cx="100" cy="100" r="58" style="fill:var(--cor-superficie-2)"/>
      <circle cx="100" cy="100" r="40" fill="none" style="stroke:var(--cor-borda)" stroke-width="2"/>
      <circle cx="100" cy="100" r="18" style="fill:var(--cor-primaria-container)"/>
      <circle cx="100" cy="100" r="4" style="fill:var(--cor-primaria)"/>
    </svg>
    <h3>${titulo}</h3><p>${texto}</p>
    ${botao ? `<button class="btn btn-pri" data-a="escolher-pasta">${icone('folder_open')}Escolher pasta</button>` : ''}
  </div>`;
}
const acoesTocar = k => `<div class="detail-actions">
  <button class="btn btn-dest" data-a="tocar-tudo" data-ctx="${k}">${icone('play_arrow', 'fill')}Tocar</button>
  <button class="btn btn-ton" data-a="aleatorio-tudo" data-ctx="${k}">${icone('shuffle')}Aleatório</button>
</div>`;

/* ============================================================
   Telas
   ============================================================ */
const ORDENS = { az: 'A–Z', recentes: 'Adicionadas recentemente', tocadas: 'Mais tocadas' };
function ordenar(ms) {
  ms = ms.slice();
  if (S.ordem === 'az') ms.sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
  if (S.ordem === 'recentes') ms.reverse();
  if (S.ordem === 'tocadas') ms.sort((a, b) => b.tocadas - a.tocadas);
  return ms;
}

const TELAS = {
  /* ---------- 1. Boas-vindas ---------- */
  'boas-vindas': {
    semChrome: true,
    render: () => `<div class="welcome">
      <div class="hero">
        ${disco({ demo: true })}
        <h1>Vitrola <span>Mp3</span></h1>
        <p>Suas músicas, do seu jeito. Sem conta, sem internet, sem anúncios.</p>
      </div>
      <div class="promessas">
        <div>${icone('folder_special')}<span><b>Só as pastas que você escolher</b>Áudios do WhatsApp e gravações ficam de fora.</span></div>
        <div>${icone('headphones')}<span><b>Toca com a tela apagada</b>Controles na notificação, na tela de bloqueio e no fone.</span></div>
        <div>${icone('lock')}<span><b>Nada sai do seu celular</b>Sem conta e sem coleta de dados.</span></div>
      </div>
      <button class="btn btn-pri" style="width:100%" data-a="escolher-pasta" data-origem="onboarding">${icone('folder_open')}Escolher pasta de músicas</button>
    </div>`,
    montar: el => { const svg = $('svg', el); setTimeout(() => svg.classList.add('baixo'), 500); },
  },

  /* ---------- 3. Escaneamento ---------- */
  'escaneamento': {
    semChrome: true,
    render: () => `<div class="scan" id="scan">
      ${disco({ demo: true })}
      <h2>Procurando músicas…</h2>
      <div class="count" id="scan-count">0 músicas</div>
      <div class="bar"><i id="scan-bar"></i></div>
      <div class="file" id="scan-file"></div>
    </div>`,
    montar: el => {
      const svg = $('svg', el); svg.classList.add('baixo');
      const lista = biblioteca();
      const total = lista.length;
      let i = 0;
      const passo = Math.max(40, 2400 / Math.max(total, 1));
      const t = setInterval(() => {
        if (!el.isConnected) return clearInterval(t);
        if (i < total) {
          i++;
          $('#scan-count', el).textContent = `${plural(i, 'música', 'músicas')}`;
          $('#scan-bar', el).style.width = (i / total * 100) + '%';
          const m = lista[i - 1]; const im = imagensDaPasta(m.pasta)[0];
          $('#scan-file', el).textContent = m.numero === 1 && im && S.usarImagens ? `${m.pasta}/${im.arquivo}` : `${m.pasta}/${m.arquivo}`;
          return;
        }
        clearInterval(t);
        const scan = $('#scan', el);
        if (!total) {
          scan.innerHTML = vazioDisco('Nenhuma música aqui', `Não encontramos arquivos de música em "${esc(S.pastas.map(p => p.nome).join('", "'))}". Escolha a pasta onde ficam suas músicas.`)
            .replace('data-a="escolher-pasta"', 'data-a="escolher-pasta" data-origem="onboarding"');
          return;
        }
        const nAlb = albunsVisiveis().length;
        scan.innerHTML = `${disco({ demo: true })}<div class="done">
          <h2>Pronto!</h2>
          <div class="count">${plural(total, 'música', 'músicas')} em ${plural(nAlb, 'álbum', 'álbuns')}</div>
          ${S.usarImagens ? `<div class="file" style="height:auto">${plural(albunsVisiveis().filter(a => a.capa).length, 'capa', 'capas')} e ${plural(artistas().filter(a => artistaInfo(a.nome).foto).length, 'foto', 'fotos')} de artista encontradas</div>` : ''}
          <button class="btn btn-pri" data-a="ir-biblioteca">${icone('library_music')}Abrir a biblioteca</button>
        </div>`;
        $('svg', scan).classList.add('baixo');
      }, passo);
    },
  },

  /* ---------- 4. Biblioteca ---------- */
  'biblioteca': {
    chave: () => 'biblioteca-' + S.libTab,
    render: () => {
      const vazia = !S.pastas.length || !biblioteca().length;
      const chips = [['musicas', 'Músicas'], ['albuns', 'Álbuns'], ['artistas', 'Artistas'], ['pastas', 'Pastas']]
        .map(([k, n]) => `<button class="chip-f" data-a="lib-tab" data-tab="${k}" aria-pressed="${S.libTab === k}">${icone('check')}${n}</button>`).join('');
      let corpo = '';
      if (!S.pastas.length) corpo = vazioDisco('Nenhum disco na vitrola', 'Escolha a pasta onde estão suas músicas. Só ela será lida, nada mais do celular.');
      else if (vazia) corpo = vazioDisco('Nenhuma música encontrada', S.subpastas ? 'As pastas escolhidas não têm arquivos de música.' : 'Suas músicas estão em subpastas. Ligue "Incluir subpastas" nos ajustes.', false)
        + (S.subpastas ? '' : `<div style="text-align:center"><button class="btn btn-ton" data-a="aba" data-tab="ajustes">${icone('settings')}Abrir ajustes</button></div>`);
      else if (S.libTab === 'musicas') {
        const ms = ordenar(biblioteca());
        const k = ctx(ms.map(m => m.id), { tipo: 'Tocando de', nome: 'Todas as músicas' });
        corpo = `<div class="list-head"><span class="count">${plural(ms.length, 'música', 'músicas')}</span>
            <button class="sort" data-a="ordem">${icone('swap_vert')}${ORDENS[S.ordem]}</button></div>
          ${acoesTocar(k)}
          ${ms.map((m, i) => linhaMusica(m, k, i)).join('')}`;
      } else if (S.libTab === 'albuns') {
        const as = albunsVisiveis().sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
        corpo = `<div class="list-head"><span class="count">${plural(as.length, 'álbum', 'álbuns')}</span></div><div class="albums">${as.map(cartaoAlbum).join('')}</div>`;
      } else if (S.libTab === 'artistas') {
        const ar = artistas();
        corpo = `<div class="list-head"><span class="count">${plural(ar.length, 'artista', 'artistas')}</span></div><div class="artists-grid">` + ar.map(a => `
          <div class="artist-card" data-a="artista" data-nome="${esc(a.nome)}" tabindex="0">
            <div class="foto">${foto(a.nome)}</div>
            <div class="ti">${esc(a.nome)}</div><div class="sb">${plural(a.albuns.size, 'álbum', 'álbuns')}</div>
          </div>`).join('') + '</div>';
      } else {
        corpo = S.pastas.map(p => `<div class="group-title">${esc(p.local)}</div><div class="group">
          <div class="row-i" data-a="pasta" data-caminho="${esc(p.caminho)}"><div class="ic">${icone('folder_special')}</div>
            <div><div class="ti">${esc(p.nome)}</div><div class="sb">Pasta escolhida · ${plural(musicasDaPasta(p.caminho, S.subpastas).length, 'música', 'músicas')}</div></div>${icone('chevron_right', 'chev')}</div>
          ${subpastasDe(p.caminho).map(sp => `<div class="row-i" data-a="pasta" data-caminho="${esc(p.caminho + '/' + sp)}">${miniaturaPasta(p.caminho + '/' + sp)}
            <div><div class="ti">${esc(sp)}</div><div class="sb">${plural(musicasDaPasta(p.caminho + '/' + sp, true).length, 'música', 'músicas')}</div></div>${icone('chevron_right', 'chev')}</div>`).join('')}
        </div>`).join('');
      }
      return `${topbar('Biblioteca', { voltar: false })}
        ${S.pastas.length && !vazia ? `<div class="chips">${chips}</div>` : ''}${corpo}`;
    },
  },

  /* ---------- 5. Álbum ---------- */
  'album': {
    render: ({ id }) => {
      const a = album(id);
      const ms = biblioteca().filter(m => m.album === id);
      const k = ctx(ms.map(m => m.id), { tipo: 'Tocando do álbum', nome: a.titulo });
      const total = ms.reduce((s, m) => s + m.duracao, 0);
      return `${topbar('', { acoes: `<button class="icon-btn" data-a="menu-album" data-id="${id}" aria-label="Mais opções">${icone('more_vert')}</button>` })}
        <div class="detail-head">
          <div class="art">${capa(a)}</div>
          <h2>${esc(a.titulo)}</h2>
          ${a.semMetadados ? `<span class="by">${esc(a.artistaNome)}</span>` : `<button class="artist-chip" data-a="artista" data-nome="${esc(a.artistaNome)}"><span class="av">${foto(a.artistaNome)}</span>${esc(a.artistaNome)}</button>`}
          <div class="meta">${a.ano ? a.ano + ' · ' : ''}${plural(ms.length, 'música', 'músicas')} · ${duracaoTotal(total)}</div>
        </div>
        ${acoesTocar(k)}
        ${a.semMetadados ? `<p class="pad" style="font:var(--tipo-corpo-p);color:var(--cor-texto-2);margin:0 0 8px">Estes arquivos não têm informações de álbum e artista. O app mostra o nome do arquivo.</p>` : ''}
        ${ms.map((m, i) => linhaMusica(m, k, i, { numero: true })).join('')}
        <div class="crumbs" style="padding-top:16px">${icone('folder')} ${esc(a.pasta)}</div>`;
    },
  },

  /* ---------- 6. Artista ---------- */
  'artista': {
    render: ({ nome }) => {
      const ms = biblioteca().filter(m => m.artista === nome);
      const as = [...new Set(ms.map(m => m.album))].map(album);
      const k = ctx(ms.map(m => m.id), { tipo: 'Tocando do artista', nome });
      const temFoto = usaImagem(artistaInfo(nome));
      return `${topbar('', { sobreFoto: true })}
        <div class="artist-hero ${temFoto ? '' : 'sem-foto'}">
          <div class="bg">${foto(nome, 'xMidYMin slice')}</div>
          <div class="grad"></div>
          <div class="info"><h2>${esc(nome)}</h2>
            <div class="meta">${plural(as.length, 'álbum', 'álbuns')} · ${plural(ms.length, 'música', 'músicas')}</div></div>
        </div>
        ${acoesTocar(k)}
        <div class="sec-title">Álbuns</div>
        <div class="hscroll">${as.map(cartaoAlbum).join('')}</div>
        <div class="sec-title">Músicas</div>
        ${ms.map((m, i) => linhaMusica(m, k, i)).join('')}`;
    },
  },

  /* ---------- 7. Pasta ---------- */
  'pasta': {
    render: ({ caminho }) => {
      const partes = caminho.split('/');
      const subs = subpastasDe(caminho);
      const diretas = musicasDaPasta(caminho, false);
      const todas = musicasDaPasta(caminho, true);
      const k = ctx(todas.map(m => m.id), { tipo: 'Tocando da pasta', nome: partes[partes.length - 1] });
      const k2 = ctx(diretas.map(m => m.id), { tipo: 'Tocando da pasta', nome: partes[partes.length - 1] });
      return `${topbar(esc(partes[partes.length - 1]))}
        <div class="crumbs">${icone('smartphone')} Memória interna ${partes.map(p => `${icone('chevron_right')} ${esc(p)}`).join(' ')}</div>
        ${todas.length ? acoesTocar(k) : ''}
        ${imagensDaPasta(caminho).map(im => `<div class="img-file">${icone('image')}<span><b>${esc(im.arquivo)}</b> · usada como ${im.uso}</span></div>`).join('')}
        ${subs.length ? `<div class="group">${subs.map(sp => `<div class="row-i" data-a="pasta" data-caminho="${esc(caminho + '/' + sp)}">${miniaturaPasta(caminho + '/' + sp)}
          <div><div class="ti">${esc(sp)}</div><div class="sb">${plural(musicasDaPasta(caminho + '/' + sp, true).length, 'música', 'músicas')}</div></div>${icone('chevron_right', 'chev')}</div>`).join('')}</div>` : ''}
        ${diretas.map((m, i) => `<div class="track" data-mid="${m.id}" data-a="tocar" data-ctx="${k2}" data-i="${i}" tabindex="0">
            <div class="cover">${capa(album(m.album))}${eq}</div>
            <div style="min-width:0"><div class="ti">${esc(m.arquivo)}</div><div class="ar">${esc(m.titulo)} · ${esc(m.artista)}</div></div>
            <span class="du">${fmt(m.duracao)}</span>
            <button class="icon-btn" data-a="menu" data-mid="${m.id}" aria-label="Mais opções">${icone('more_vert')}</button></div>`).join('')}
        ${!subs.length && !diretas.length ? vazioDisco('Pasta vazia', 'Nenhuma música nesta pasta.', false) : ''}`;
    },
  },

  /* ---------- 8. Busca ---------- */
  'busca': {
    render: ({ q = '' }) => `${topbar('Buscar', { voltar: false })}
      <label class="search">${icone('search')}<input id="q" placeholder="Música, artista ou álbum" value="${esc(q)}" autocomplete="off" enterkeyhint="search">
        <button class="icon-btn" data-a="limpar-busca" aria-label="Limpar" style="width:44px;height:44px${q ? '' : ';visibility:hidden'}">${icone('close')}</button></label>
      <div id="resultados"></div>`,
    montar: (el, params) => {
      const input = $('#q', el);
      const pintar = () => {
        const q = input.value.trim();
        if (norm(input.value.trim()) !== norm((params.q || '').trim())) S.buscaTodas = false;
        params.q = input.value;
        $('[data-a="limpar-busca"]', el).style.visibility = q ? 'visible' : 'hidden';
        $('#resultados', el).innerHTML = resultadosBusca(q);
        marcarAtivas();
      };
      input.addEventListener('input', pintar);
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && input.value.trim()) {
          const q = input.value.trim();
          S.recentes = [q, ...S.recentes.filter(r => norm(r) !== norm(q))].slice(0, 6);
          input.blur();
        }
      });
      pintar();
      if (!params.q) setTimeout(() => input.focus({ preventScroll: true }), 350);
    },
  },

  /* ---------- 9. Playlists ---------- */
  'playlists': {
    render: () => {
      const fav = [...S.favoritas].filter(id => naBiblioteca(musica(id)));
      const auto = [
        ['favoritas', 'Favoritas', 'favorite', fav.length],
        ['tocadas', 'Mais tocadas', 'trending_up', Math.min(20, biblioteca().length)],
        ['recentes', 'Adicionadas recentemente', 'schedule', Math.min(20, biblioteca().length)],
      ];
      return `${topbar('Playlists', { voltar: false, acoes: `<button class="icon-btn" data-a="nova-playlist" aria-label="Nova playlist">${icone('add')}</button>` })}
        <div class="group-title">Automáticas</div>
        <div class="group">${auto.map(([id, n, ic, c]) => `<div class="row-i" data-a="playlist" data-id="${id}" tabindex="0">
          <div class="ic pri">${icone(ic, 'fill')}</div><div><div class="ti">${n}</div><div class="sb">${plural(c, 'música', 'músicas')}</div></div>${icone('chevron_right', 'chev')}</div>`).join('')}</div>
        <div class="group-title">Suas playlists</div>
        <div class="group">${S.playlists.map(p => `<div class="row-i" data-a="playlist" data-id="${p.id}" tabindex="0">
          <div class="ic">${mosaico(p.musicas)}</div><div style="min-width:0"><div class="ti">${esc(p.nome)}</div><div class="sb">${plural(p.musicas.length, 'música', 'músicas')}</div></div>${icone('chevron_right', 'chev')}</div>`).join('')}
          <div class="row-i" data-a="nova-playlist" tabindex="0"><div class="ic pri">${icone('add')}</div><div><div class="ti">Nova playlist</div></div><span></span></div>
        </div>`;
    },
  },

  /* ---------- 10. Playlist ---------- */
  'playlist': {
    render: ({ id }) => {
      const info = dadosPlaylist(id);
      if (!info) return `${topbar('')}${vazioDisco('Playlist excluída', '', false)}`;
      const ids = info.ids.filter(i => naBiblioteca(musica(i)));
      const k = ctx(ids, { tipo: 'Tocando da playlist', nome: info.nome });
      const total = ids.reduce((s, i) => s + musica(i).duracao, 0);
      const arte = info.icone
        ? `<div class="pl-art" style="background:var(--cor-primaria-container);color:var(--cor-sobre-primaria-container)">${icone(info.icone, 'fill')}</div>`
        : `<div class="pl-art" style="overflow:hidden">${mosaico(ids, true)}</div>`;
      return `${topbar('', { acoes: info.editavel ? `<button class="icon-btn" data-a="menu-playlist" data-id="${id}" aria-label="Opções da playlist">${icone('more_vert')}</button>` : '' })}
        <div class="detail-head">${arte}<h2>${esc(info.nome)}</h2>
          <div class="meta">${info.desc ? info.desc + ' · ' : ''}${plural(ids.length, 'música', 'músicas')}${ids.length ? ' · ' + duracaoTotal(total) : ''}</div></div>
        ${ids.length ? acoesTocar(k) + ids.map((mid, i) => linhaMusica(musica(mid), k, i)).join('')
          : `<div class="empty"><span class="ms big">${info.icone || 'queue_music'}</span><h3>Nada por aqui ainda</h3><p>${id === 'favoritas' ? 'Toque no coração de uma música, no player ou no menu ⋮, para ela aparecer aqui.' : 'Use o menu ⋮ de qualquer música e escolha "Adicionar à playlist".'}</p></div>`}`;
    },
  },

  /* ---------- 11. Ajustes ---------- */
  'ajustes': {
    render: () => {
      const tema = document.documentElement.dataset.theme || 'auto';
      const timerTxt = S.timer ? (S.timer.fimMusica ? 'Pausa no fim desta música' : `Pausa em ${fmt(Math.max(0, (S.timer.fim - Date.now()) / 1000))}`) : 'Desligado';
      return `${topbar('Ajustes', { voltar: false })}
        <div class="group-title">Pastas da biblioteca</div>
        <div class="group">
          ${S.pastas.map(p => `<div class="row-i" style="cursor:default"><div class="ic">${icone(p.local === 'Cartão SD' ? 'sd_card' : 'folder')}</div>
            <div style="min-width:0"><div class="ti">${esc(p.nome)}</div><div class="sb">${esc(p.local)} · ${plural(musicasDaPasta(p.caminho, S.subpastas).length, 'música', 'músicas')}</div></div>
            <button class="icon-btn" data-a="remover-pasta" data-id="${p.id}" aria-label="Remover pasta ${esc(p.nome)}">${icone('remove_circle_outline')}</button></div>`).join('')}
          <div class="row-i" data-a="escolher-pasta" data-origem="ajustes" tabindex="0"><div class="ic pri">${icone('create_new_folder')}</div><div><div class="ti">Adicionar pasta</div><div class="sb">Só as pastas escolhidas entram na biblioteca</div></div><span></span></div>
          <div class="row-i" data-a="toggle" data-k="subpastas"><div class="ic pri">${icone('subdirectory_arrow_right')}</div><div><div class="ti">Incluir subpastas</div><div class="sb">Procurar músicas dentro das pastas escolhidas</div></div><button class="switch" role="switch" aria-checked="${S.subpastas}" aria-label="Incluir subpastas"></button></div>
          <div class="row-i" data-a="toggle" data-k="usarImagens"><div class="ic pri">${icone('photo_library')}</div><div><div class="ti">Usar fotos e capas das pastas</div><div class="sb">artista.jpg na pasta do artista e capa.jpg na do álbum</div></div><button class="switch" role="switch" aria-checked="${S.usarImagens}" aria-label="Usar fotos e capas das pastas"></button></div>
          <div class="row-i" data-a="reescanear" tabindex="0"><div class="ic pri">${icone('refresh')}</div><div><div class="ti">Procurar músicas novas</div><div class="sb">Também acontece sozinho quando você abre o app</div></div><span></span></div>
        </div>
        <div class="group-title">Reprodução</div>
        <div class="group">
          <div class="row-i" data-a="timer" tabindex="0"><div class="ic pri">${icone('bedtime')}</div><div><div class="ti">Timer para dormir</div><div class="sb" id="timer-sb">${timerTxt}</div></div>${icone('chevron_right', 'chev')}</div>
          <div class="row-i" data-a="toggle" data-k="retomar"><div class="ic pri">${icone('history')}</div><div><div class="ti">Retomar de onde parou</div><div class="sb">Ao abrir o app, a última música fica pronta para tocar</div></div><button class="switch" role="switch" aria-checked="${S.retomar}" aria-label="Retomar de onde parou"></button></div>
          <div class="row-i" data-a="toggle" data-k="pausarFone"><div class="ic pri">${icone('headset_off')}</div><div><div class="ti">Pausar ao tirar o fone</div><div class="sb">Fone com fio ou Bluetooth</div></div><button class="switch" role="switch" aria-checked="${S.pausarFone}" aria-label="Pausar ao tirar o fone"></button></div>
        </div>
        <div class="tip">${icone('battery_alert')}<div><b>A música para sozinha?</b>Alguns celulares (Xiaomi, Samsung, Motorola…) fecham apps em segundo plano para economizar bateria. Libere o Vitrola Mp3 da otimização de bateria.<br><button data-a="bateria">Abrir ajustes de bateria</button></div></div>
        <div class="group-title">Aparência</div>
        <div class="seg theme-seg" role="group" aria-label="Tema">
          ${[['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Escuro']].map(([k, n]) => `<button data-a="tema" data-tema="${k}" aria-pressed="${tema === k}">${n}</button>`).join('')}
        </div>
        <div class="about">
          <img class="logo-p" src="../01-logo/export/vitrola-mp3-horizontal-positivo.svg" alt="Vitrola Mp3">
          <img class="logo-n" src="../01-logo/export/vitrola-mp3-horizontal-negativo.svg" alt="Vitrola Mp3" style="margin:0 auto 8px">
          <div>Versão 0.1 · mockup</div><div>Sem anúncios. Nada sai do seu celular.</div>
        </div>`;
    },
    montar: el => {
      const t = setInterval(() => { if (!el.isConnected) return clearInterval(t); const sb = $('#timer-sb', el); if (sb && S.timer && !S.timer.fimMusica) sb.textContent = `Pausa em ${fmt(Math.max(0, (S.timer.fim - Date.now()) / 1000))}`; }, 1000);
    },
  },
};

function resultadosBusca(q) {
  if (!q) {
    return `${S.recentes.length ? `<div class="sec-title">Buscas recentes<button data-a="limpar-recentes">Limpar</button></div>
      <div class="recentes">${S.recentes.map(r => `<button class="chip-f" data-a="recente" data-q="${esc(r)}">${icone('history')}${esc(r)}</button>`).join('')}</div>` : ''}
      <div class="sec-title">Artistas</div>
      <div class="hscroll">${artistas().map(a => `<div class="album" data-a="artista" data-nome="${esc(a.nome)}" style="width:96px;text-align:center"><div class="art" style="border-radius:50%">${foto(a.nome)}</div><div class="ti">${esc(a.nome)}</div></div>`).join('')}</div>`;
  }
  // 1) O que bate direto com o texto
  const n = norm(q);
  const peso = t => norm(t).startsWith(n) ? 0 : 1; // começa com o texto vem antes de só conter
  const porPeso = campo => (a, b) => peso(campo(a)) - peso(campo(b));
  const lib = biblioteca();
  const msDiretas = lib.filter(m => norm(m.titulo).includes(n) || norm(m.arquivo).includes(n)).sort(porPeso(m => m.titulo));
  const asDiretos = albunsVisiveis().filter(a => norm(a.titulo).includes(n)).sort(porPeso(a => a.titulo));
  const arDiretos = artistas().filter(a => norm(a.nome).includes(n)).sort(porPeso(a => a.nome));
  if (!msDiretas.length && !asDiretos.length && !arDiretos.length) {
    return `<div class="empty"><span class="ms big">search_off</span><h3>Nada encontrado</h3><p>Nenhuma música, álbum ou artista com "${esc(q)}". Confira a grafia ou tente outra palavra.</p></div>`;
  }
  // 2) Cada camada também traz o que está ligado aos resultados das outras
  const nomesArtistas = new Set([...arDiretos.map(a => a.nome), ...asDiretos.map(a => a.artistaNome), ...msDiretas.map(m => m.artista)]);
  const idsAlbuns = new Set([...asDiretos.map(a => a.id), ...msDiretas.map(m => m.album)]);
  albunsVisiveis().forEach(a => { if (arDiretos.some(x => x.nome === a.artistaNome)) idsAlbuns.add(a.id); });
  const ar = [...arDiretos, ...artistas().filter(a => nomesArtistas.has(a.nome) && !arDiretos.some(x => x.nome === a.nome))];
  const as = [...asDiretos, ...[...idsAlbuns].map(album).filter(a => !asDiretos.includes(a))];
  const relacionadas = lib.filter(m => !msDiretas.includes(m) && (asDiretos.some(a => a.id === m.album) || arDiretos.some(a => a.nome === m.artista)));
  const ms = [...msDiretas, ...relacionadas];

  const LIMITE = 6;
  const mostrar = S.buscaTodas ? ms : ms.slice(0, LIMITE);
  const k = ctx(ms.map(m => m.id), { tipo: 'Tocando da busca', nome: `"${q}"` });
  const titulo = (nome, qtd) => `<div class="sec-title">${nome} <span class="qtd">${qtd}</span></div>`;
  return `<section aria-label="Artistas">${titulo('Artistas', ar.length)}
      ${ar.map(a => `<div class="row-i" data-a="artista" data-nome="${esc(a.nome)}"><div class="ic round">${foto(a.nome)}</div>
        <div style="min-width:0"><div class="ti">${realcar(a.nome, q)}</div><div class="sb">${plural(a.albuns.size, 'álbum', 'álbuns')} · ${plural(a.musicas.length, 'música', 'músicas')}</div></div>${icone('chevron_right', 'chev')}</div>`).join('')}
    </section>
    <section aria-label="Álbuns">${titulo('Álbuns', as.length)}
      <div class="hscroll">${as.map(a => cartaoAlbum(a).replace(`<div class="ti">${esc(a.titulo)}</div>`, `<div class="ti">${realcar(a.titulo, q)}</div>`)).join('')}</div>
    </section>
    <section aria-label="Músicas">${titulo('Músicas', ms.length)}
      ${mostrar.map((m, i) => linhaMusica(m, k, i, { q })).join('')}
      ${ms.length > LIMITE && !S.buscaTodas ? `<div style="padding:4px 16px"><button class="btn btn-cont" style="width:100%" data-a="ver-todas-musicas">Ver todas as ${ms.length} músicas</button></div>` : ''}
    </section>`;
}

function mosaico(ids, grande = false) {
  const as = [...new Set(ids.map(i => musica(i).album))].slice(0, 4).map(album);
  if (!as.length) return icone('queue_music');
  if (as.length < 4) return capa(as[0]);
  return `<div class="pl-mosaic" style="width:100%;height:100%">${as.map(capa).join('')}</div>`;
}
function dadosPlaylist(id) {
  if (id === 'favoritas') return { nome: 'Favoritas', icone: 'favorite', ids: [...S.favoritas], desc: 'Automática' };
  if (id === 'tocadas') return { nome: 'Mais tocadas', icone: 'trending_up', ids: biblioteca().slice().sort((a, b) => b.tocadas - a.tocadas).slice(0, 20).map(m => m.id), desc: 'Automática' };
  if (id === 'recentes') return { nome: 'Adicionadas recentemente', icone: 'schedule', ids: biblioteca().slice().reverse().slice(0, 20).map(m => m.id), desc: 'Automática' };
  const p = S.playlists.find(x => x.id === id);
  return p && { nome: p.nome, ids: p.musicas, editavel: true };
}

/* ============================================================
   Player (simulado: o tempo passa, mas não sai som)
   ============================================================ */
function tocarLista(ids, i, origem, aleatorio = S.aleatorio) {
  if (!ids.length) return;
  S.filaOriginal = ids.slice();
  S.aleatorio = aleatorio;
  if (aleatorio) {
    const primeiro = ids[i];
    S.fila = [primeiro, ...embaralhar(ids.filter((_, j) => j !== i))];
    S.idx = 0;
  } else { S.fila = ids.slice(); S.idx = i; }
  S.origem = origem; S.pos = 0;
  play(true);
}
function play(on = !S.tocando) {
  if (!atual()) return;
  if (on === S.tocando) { atualizarPlayer(); return; }
  if (on) { S.giroDesde = performance.now(); S.tocando = true; }
  else { S.angulo = anguloAtual() + 50; S.tocando = false; }
  atualizarPlayer(!on);
}
function proxima(auto = false) {
  if (!atual()) return;
  if (auto && S.repetir === 2) { S.pos = 0; return atualizarPlayer(); }
  if (S.idx < S.fila.length - 1) { S.idx++; S.pos = 0; }
  else if (S.repetir === 1 || !auto) { S.idx = 0; S.pos = 0; }
  else { S.pos = 0; play(false); return; }
  atualizarPlayer();
}
function anterior() {
  if (!atual()) return;
  if (S.pos > 3 || S.idx === 0) S.pos = 0; else { S.idx--; S.pos = 0; }
  atualizarPlayer();
}
function alternarAleatorio() {
  const id = S.fila[S.idx];
  S.aleatorio = !S.aleatorio;
  if (S.aleatorio) S.fila = [id, ...embaralhar(S.filaOriginal.filter(x => x !== id))], S.idx = 0;
  else S.fila = S.filaOriginal.slice(), S.idx = Math.max(0, S.fila.indexOf(id));
  aviso(S.aleatorio ? 'Aleatório ligado' : 'Aleatório desligado');
  atualizarPlayer();
}
function alternarRepetir() {
  S.repetir = (S.repetir + 1) % 3;
  aviso(['Repetir desligado', 'Repetindo a fila', 'Repetindo esta música'][S.repetir]);
  atualizarPlayer();
}

setInterval(() => {
  // relógio da barra de status
  const d = new Date(); $('#relogio').textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (S.timer && !S.timer.fimMusica && Date.now() >= S.timer.fim) { S.timer = null; if (S.tocando) play(false); aviso('Timer encerrado. Boa noite!'); }
  if (!S.tocando || !atual()) return;
  S.pos += 1;
  if (S.pos >= atual().duracao) {
    if (S.timer && S.timer.fimMusica) { S.timer = null; S.pos = 0; play(false); aviso('Timer encerrado. Boa noite!'); return; }
    proxima(true);
  } else atualizarProgresso();
}, 1000);

function atualizarPlayer(desacelerar = false) {
  renderMini();
  if (npEl.classList.contains('aberto')) renderNP();
  marcarAtivas();
  sincronizarDiscos(desacelerar);
  atualizarProgresso();
  const sh = $('.shade, .lock', app); if (sh) sh.dispatchEvent(new CustomEvent('atualizar'));
  const q = $('#fila-lista'); if (q) q.innerHTML = linhasFila();
}
function atualizarProgresso() {
  const m = atual(); if (!m) return;
  const pct = (S.pos / m.duracao * 100) + '%';
  const bar = $('#mini .prog i'); if (bar) bar.style.width = pct;
  const seek = $('#np-seek'); if (seek && !seek.matches(':active')) { seek.value = S.pos; seek.style.setProperty('--p', pct); }
  const t = $('#np-pos'); if (t) t.textContent = fmt(S.pos);
  const tt = $('#np-timer'); if (tt) tt.textContent = textoTimer();
  $$('.notif .bar i').forEach(b => b.style.width = pct);
}
function marcarAtivas() {
  const m = atual();
  $$('[data-mid].track, .q-row[data-mid]').forEach(r => r.classList.toggle('ativa', !!m && r.dataset.mid === m.id));
  app.classList.toggle('pausado', !S.tocando);
}
const textoTimer = () => !S.timer ? '' : S.timer.fimMusica ? 'Pausa no fim desta música' : `Pausa em ${fmt(Math.max(0, (S.timer.fim - Date.now()) / 1000))}`;

/* ---------- Mini player ---------- */
function renderMini() {
  const mini = $('#mini');
  const m = atual();
  const ocultar = !m || TELAS[telaAtual] && TELAS[telaAtual].semChrome;
  mini.hidden = !!ocultar;
  if (ocultar) return posicionarAviso();
  mini.innerHTML = `<div class="prog"><i style="width:${S.pos / m.duracao * 100}%"></i></div>
    <div class="row" data-a="abrir-np">
      ${disco({ a: album(m.album), braco: false, player: true }).replace('<svg ', '<svg class="mdisc" ')}
      <div style="min-width:0"><div class="ti">${esc(m.titulo)}</div><div class="ar">${esc(m.artista)}</div></div>
      <button class="icon-btn" data-a="play" aria-label="${S.tocando ? 'Pausar' : 'Tocar'}">${icone(S.tocando ? 'pause' : 'play_arrow', 'fill')}</button>
      <button class="icon-btn" data-a="proxima" aria-label="Próxima música">${icone('skip_next', 'fill')}</button>
    </div>`;
  sincronizarDiscos();
  posicionarAviso();
}

/* ---------- Tocando agora ---------- */
function abrirNP() {
  if (!atual()) return;
  renderNP();
  npEl.classList.remove('fechando');
  npEl.classList.add('aberto');
  npEl.setAttribute('aria-hidden', 'false');
  atualizarPainel('tocando');
  posicionarAviso();
}
function fecharNP() {
  npEl.classList.add('fechando');
  npEl.classList.remove('aberto');
  npEl.setAttribute('aria-hidden', 'true');
  atualizarPainel(TELAS[telaAtual].chave ? TELAS[telaAtual].chave(pilha[pilha.length - 1].params) : telaAtual);
  posicionarAviso();
}
function renderNP() {
  const m = atual(); if (!m) return;
  const a = album(m.album);
  const fav = S.favoritas.has(m.id);
  npEl.style.setProperty('--np-fundo', `color-mix(in srgb, ${corDoAlbum(a)} 16%, var(--cor-fundo))`);
  npEl.innerHTML = `
    <div class="np-top">
      <button class="icon-btn" data-a="fechar-np" aria-label="Recolher player">${icone('expand_more')}</button>
      <div class="src"><small>${esc(S.origem ? S.origem.tipo : 'Tocando')}</small><b>${esc(S.origem ? S.origem.nome : a.titulo)}</b></div>
      <button class="icon-btn" data-a="menu" data-mid="${m.id}" aria-label="Mais opções">${icone('more_vert')}</button>
    </div>
    <div class="np-disc">${disco({ a, braco: true, player: true })}</div>
    <div class="np-info">
      <div style="min-width:0"><h2>${esc(m.titulo)}</h2><button class="ar" data-a="artista-np" data-nome="${esc(m.artista)}">${a.semMetadados ? '' : `<span class="av">${foto(m.artista)}</span>`}${esc(m.artista)}${a.semMetadados ? '' : ' · ' + esc(a.titulo)}</button></div>
      <button class="icon-btn ${fav ? 'fav-on' : ''}" data-a="favoritar" data-mid="${m.id}" aria-label="${fav ? 'Remover das favoritas' : 'Adicionar às favoritas'}" aria-pressed="${fav}">${icone('favorite', fav ? 'fill' : '')}</button>
    </div>
    <div class="np-seek">
      <input type="range" id="np-seek" min="0" max="${m.duracao}" value="${S.pos}" aria-label="Posição da música" style="--p:${S.pos / m.duracao * 100}%">
      <div class="times"><span id="np-pos">${fmt(S.pos)}</span><span>${fmt(m.duracao)}</span></div>
    </div>
    <div class="np-controls">
      <button class="icon-btn ${S.aleatorio ? 'on' : ''}" data-a="aleatorio" aria-label="Aleatório" aria-pressed="${S.aleatorio}">${icone('shuffle')}</button>
      <button class="icon-btn" data-a="anterior" aria-label="Música anterior">${icone('skip_previous', 'fill big')}</button>
      <button class="play ${S.tocando ? 'tocando-btn' : ''}" data-a="play" aria-label="${S.tocando ? 'Pausar' : 'Tocar'}">${icone(S.tocando ? 'pause' : 'play_arrow', 'fill')}</button>
      <button class="icon-btn" data-a="proxima" aria-label="Próxima música">${icone('skip_next', 'fill big')}</button>
      <button class="icon-btn ${S.repetir ? 'on' : ''}" data-a="repetir" aria-label="${['Repetir: desligado', 'Repetir: todas', 'Repetir: uma'][S.repetir]}">${icone(S.repetir === 2 ? 'repeat_one' : 'repeat')}</button>
    </div>
    <div class="timer-tag" id="np-timer">${textoTimer()}</div>
    <div class="np-extra">
      <button class="icon-btn ${S.timer ? 'on' : ''}" data-a="timer" aria-label="Timer para dormir">${icone('bedtime')}</button>
      <button class="icon-btn" data-a="fila" aria-label="Fila">${icone('queue_music')}</button>
      <button class="icon-btn" data-a="info-arquivo" data-mid="${m.id}" aria-label="Detalhes do arquivo">${icone('info')}</button>
    </div>`;
  const seek = $('#np-seek', npEl);
  seek.addEventListener('input', () => { S.pos = +seek.value; seek.style.setProperty('--p', (S.pos / m.duracao * 100) + '%'); $('#np-pos').textContent = fmt(S.pos); const b = $('#mini .prog i'); if (b) b.style.width = (S.pos / m.duracao * 100) + '%'; });
  sincronizarDiscos();
}

/* ============================================================
   Folhas, diálogos e avisos
   ============================================================ */
function abrirFolha(html, chave) {
  fecharSobreposicao(true);
  overlayEl.innerHTML = `<div class="veu" data-a="fechar-sobreposicao"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  requestAnimationFrame(() => { $('.veu', overlayEl).classList.add('on'); $('.sheet', overlayEl).classList.add('on'); });
  if (chave) atualizarPainel(chave);
}
function abrirDialogo(html, chave) {
  fecharSobreposicao(true);
  overlayEl.innerHTML = `<div class="veu" data-a="fechar-sobreposicao"></div><div class="dialog-wrap"><div class="dialog" role="alertdialog" aria-modal="true">${html}</div></div>`;
  requestAnimationFrame(() => { $('.veu', overlayEl).classList.add('on'); $('.dialog', overlayEl).classList.add('on'); const f = $('input', overlayEl); f && f.focus(); });
  if (chave) atualizarPainel(chave);
}
function fecharSobreposicao(imediato = false) {
  const sys = $('.sys, .sys-dialog, .shade, .lock', app);
  if (sys && !imediato) { $$('.sys, .sys-dialog, .shade, .lock, .sys-tag', app).forEach(e => e.remove()); return true; }
  if (!overlayEl.children.length) return false;
  if (imediato) { overlayEl.innerHTML = ''; return true; }
  const v = $('.veu', overlayEl), s = $('.sheet, .dialog', overlayEl);
  v && v.classList.remove('on'); s && s.classList.remove('on');
  setTimeout(() => { if (!overlayEl.querySelector('.on')) overlayEl.innerHTML = ''; }, T.movimento.duracao.media);
  const def = TELAS[telaAtual];
  atualizarPainel(npEl.classList.contains('aberto') ? 'tocando' : def.chave ? def.chave(pilha[pilha.length - 1].params) : telaAtual);
  return true;
}
let avisoTimer;
function aviso(msg, acao, fn) {
  const area = $('#snack-area');
  clearTimeout(avisoTimer);
  area.innerHTML = `<div class="snack" role="status"><span>${msg}</span>${acao ? `<button>${acao}</button>` : ''}</div>`;
  posicionarAviso();
  if (acao) $('button', area).addEventListener('click', () => { fn(); area.innerHTML = ''; });
  avisoTimer = setTimeout(() => { const s = $('.snack', area); if (s) { s.classList.add('sai'); setTimeout(() => s.remove(), 200); } }, acao ? 5000 : 3000);
}
function posicionarAviso() {
  const area = $('#snack-area');
  const np = npEl.classList.contains('aberto');
  const b = $('#bottom');
  area.style.bottom = (np ? 40 : b.hidden ? 40 : b.offsetHeight + 12) + 'px';
}

/* Menu da música */
function menuMusica(id) {
  const m = musica(id), a = album(m.album);
  const fav = S.favoritas.has(id);
  abrirFolha(`<div class="s-head"><div class="cover">${capa(a)}</div><div style="min-width:0"><div class="ti">${esc(m.titulo)}</div><div class="ar">${esc(m.artista)}</div></div></div>
    <div class="s-body">
      <button class="menu-i" data-a="tocar-seguir" data-mid="${id}">${icone('playlist_play')}Tocar a seguir</button>
      <button class="menu-i" data-a="add-fila" data-mid="${id}">${icone('add_to_queue')}Adicionar ao fim da fila</button>
      <button class="menu-i" data-a="add-playlist" data-mid="${id}">${icone('playlist_add')}Adicionar à playlist</button>
      <button class="menu-i" data-a="favoritar" data-mid="${id}">${icone('favorite', fav ? 'fill' : '')}${fav ? 'Remover das favoritas' : 'Adicionar às favoritas'}</button>
      ${a.semMetadados ? '' : `<button class="menu-i" data-a="album" data-id="${a.id}">${icone('album')}Ir para o álbum</button>
      <button class="menu-i" data-a="artista" data-nome="${esc(m.artista)}">${icone('mic')}Ir para o artista</button>`}
      <button class="menu-i" data-a="info-arquivo" data-mid="${id}">${icone('info')}Detalhes do arquivo</button>
    </div>`, 'menu');
}
function infoArquivo(id) {
  const m = musica(id);
  abrirDialogo(`${icone('description')}<h4>Detalhes do arquivo</h4>
    <p style="display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin-bottom:20px">
      <b>Arquivo</b><span style="word-break:break-all">${esc(m.arquivo)}</span>
      <b>Pasta</b><span>${esc(m.pasta)}</span>
      <b>Duração</b><span>${fmt(m.duracao)}</span>
      <b>Formato</b><span>MP3 · 320 kbps · 44,1 kHz</span>
      <b>Capa</b><span>${S.usarImagens && album(m.album).capa ? esc(album(m.album).capa) + ' (pasta do álbum)' : 'Gerada pelo app'}</span>
    </p>
    <div class="acts"><button class="btn btn-txt" data-a="fechar-sobreposicao">Fechar</button></div>`);
}
function escolherPlaylist(id) {
  abrirFolha(`<h3>Adicionar à playlist</h3><div class="s-body">
    <button class="menu-i" data-a="nova-playlist" data-mid="${id}">${icone('add')}Nova playlist</button>
    ${S.playlists.map(p => { const tem = p.musicas.includes(id); return `<button class="menu-i ${tem ? 'sel' : ''}" data-a="add-na-playlist" data-pid="${p.id}" data-mid="${id}">${icone('queue_music')}${esc(p.nome)}${tem ? `<span class="end">${icone('check')}</span>` : ''}</button>`; }).join('')}
  </div>`);
}
function linhasFila() {
  return S.fila.map((mid, i) => {
    const m = musica(mid);
    const cls = i === S.idx ? 'ativa' : i < S.idx ? 'passada' : '';
    return `${i === S.idx ? '<div class="q-label">Tocando agora</div>' : ''}${i === S.idx + 1 ? '<div class="q-label">A seguir</div>' : ''}
      <div class="q-row ${cls}" data-mid="${mid}" data-a="pular-para" data-i="${i}">
        ${icone('drag_indicator', 'drag')}<div class="cover">${capa(album(m.album))}${eq}</div>
        <div style="min-width:0"><div class="ti">${esc(m.titulo)}</div><div class="ar">${esc(m.artista)} · ${fmt(m.duracao)}</div></div>
        ${i > S.idx ? `<button class="icon-btn" data-a="tirar-fila" data-i="${i}" aria-label="Tirar da fila">${icone('close')}</button>` : '<span style="width:48px"></span>'}
      </div>`;
  }).join('');
}
function abrirFila() {
  const restantes = S.fila.length - S.idx - 1;
  abrirFolha(`<h3 style="display:flex;justify-content:space-between;align-items:center">Fila <span style="font:var(--tipo-legenda);color:var(--cor-texto-2)">${plural(restantes, 'música', 'músicas')} a seguir</span></h3>
    <div class="s-body" id="fila-lista">${linhasFila()}</div>`, 'fila');
  marcarAtivas();
  const atualEl = $('.q-row.ativa', overlayEl); atualEl && atualEl.scrollIntoView({ block: 'center' });
}
function abrirTimer() {
  const opts = [[15, '15 min'], [30, '30 min'], [45, '45 min'], [60, '1 hora']];
  abrirFolha(`<h3>Timer para dormir</h3>
    <p style="margin:-6px 20px 16px;font:var(--tipo-corpo-p);color:var(--cor-texto-2)">A música para sozinha depois do tempo escolhido.</p>
    <div class="timer-opts">${opts.map(([m, n]) => `<button data-a="set-timer" data-min="${m}">${n}</button>`).join('')}
      <button class="wide ${S.timer && S.timer.fimMusica ? 'sel' : ''}" data-a="set-timer" data-min="fim">No fim desta música</button>
      ${S.timer ? `<button class="wide" data-a="set-timer" data-min="0" style="color:var(--cor-erro)">Desligar timer</button>` : ''}</div>`, 'timer');
}

/* ---------- Seletor de pasta do sistema (SAF) ---------- */
let seletorOrigem = 'onboarding';
function abrirSeletor(origem = 'onboarding', caminho = '') {
  seletorOrigem = origem;
  $$('.sys, .sys-dialog, .sys-tag', app).forEach(e => e.remove());
  const nomes = caminho ? caminho.split('/') : [];
  const pastas = D.pastasSistema.filter(x => caminho ? x.startsWith(caminho + '/') && !x.slice(caminho.length + 1).includes('/') : !x.includes('/'))
    .map(x => x.split('/').pop()).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const arquivos = [...imagensDaPasta(caminho).map(i => i.arquivo), ...D.musicas.filter(m => m.pasta === caminho).map(m => m.arquivo)];
  const bloqueada = !caminho || caminho === 'Download' || caminho === 'Android';
  const div = document.createElement('div');
  div.className = 'sys';
  div.innerHTML = `
    <div class="sys-top"><button data-sys="fechar" aria-label="Cancelar">${icone('close')}</button><span class="t">${caminho ? esc(nomes[nomes.length - 1]) : 'Memória interna'}</span><button aria-label="Mais">${icone('more_vert')}</button></div>
    <div class="sys-crumb"><button data-sys-ir="">Memória interna</button>${nomes.map((n, i) => ` ${icone('chevron_right')} <button data-sys-ir="${esc(nomes.slice(0, i + 1).join('/'))}">${esc(n)}</button>`).join('')}</div>
    <div class="sys-list">
      ${pastas.map(p => `<div class="sys-item" data-sys-ir="${esc((caminho ? caminho + '/' : '') + p)}">${icone('folder', 'fill')}${esc(p)}</div>`).join('')}
      ${arquivos.map(f => `<div class="sys-item file">${icone(/\.(jpe?g|png|webp)$/i.test(f) ? 'image' : 'audio_file')}${esc(f)}</div>`).join('')}
      ${!pastas.length && !arquivos.length ? '<div class="sys-empty">Nenhum item</div>' : ''}
      ${bloqueada ? `<div class="sys-empty">${!caminho ? 'Abra uma pasta para escolher.' : 'Para proteger sua privacidade, escolha outra pasta.'}</div>` : ''}
    </div>
    <div class="sys-bottom"><button data-sys="usar" ${bloqueada ? 'disabled' : ''}>Usar esta pasta</button></div>`;
  app.appendChild(div);
  const tag = document.createElement('div'); tag.className = 'sys-tag'; tag.textContent = 'Tela do Android'; app.appendChild(tag);
  div.addEventListener('click', e => {
    const ir2 = e.target.closest('[data-sys-ir]');
    if (ir2) return abrirSeletor(origem, ir2.dataset.sysIr);
    const b = e.target.closest('[data-sys]');
    if (!b) return;
    if (b.dataset.sys === 'fechar') { div.remove(); tag.remove(); atualizarPainelAtual(); }
    if (b.dataset.sys === 'usar') pedirPermissao(caminho, div, tag);
  });
  atualizarPainel('seletor');
}
function pedirPermissao(caminho, sysEl, tag) {
  const nome = caminho.split('/').pop();
  const dlg = document.createElement('div');
  dlg.className = 'sys-dialog';
  dlg.innerHTML = `<div class="box"><h3>Permitir que o app <b>Vitrola Mp3</b> acesse arquivos em ${esc(nome)}?</h3>
    <p>Isso permitirá que o Vitrola Mp3 acesse o conteúdo atual e futuro armazenado em ${esc(nome)}.</p>
    <div class="acts"><button data-r="nao">Cancelar</button><button data-r="sim">Permitir</button></div></div>`;
  app.appendChild(dlg);
  dlg.addEventListener('click', e => {
    const r = e.target.closest('[data-r]'); if (!r) return;
    dlg.remove();
    if (r.dataset.r === 'nao') return;
    sysEl.remove(); tag.remove();
    const nova = { id: 'p' + uid(), nome, local: 'Memória interna', caminho };
    const jaCoberta = S.pastas.some(p => caminho === p.caminho || caminho.startsWith(p.caminho + '/'));
    S.pastas = S.pastas.filter(p => !p.caminho.startsWith(caminho + '/'));
    if (!jaCoberta) S.pastas.push(nova);
    S.configurado = true;
    if (seletorOrigem === 'onboarding') { S.pastas = [nova]; raiz('escaneamento'); return; }
    const novas = musicasDaPasta(caminho, true).length;
    render('none');
    if (jaCoberta) aviso(`"${esc(nome)}" já faz parte da biblioteca`);
    else aviso(novas ? `Pasta adicionada · ${plural(novas, 'música', 'músicas')}` : `Pasta adicionada · nenhuma música encontrada`, 'Desfazer', () => { S.pastas = S.pastas.filter(p => p.id !== nova.id); render('none'); });
  });
}

/* ---------- Notificação e tela de bloqueio ---------- */
function notificacaoHTML() {
  const m = atual(); const a = album(m.album);
  return `<div class="notif" role="region" aria-label="Notificação de mídia" style="background:color-mix(in srgb, ${corDoAlbum(a)} 28%, #1B1714)">
    <div class="h">${icone('album')}Vitrola Mp3 · ${esc(S.origem ? S.origem.nome : a.titulo)}</div>
    <div class="main"><div style="min-width:0"><div class="t">${esc(m.titulo)}</div><div class="a">${esc(m.artista)}</div></div><div class="c">${capa(a)}</div></div>
    <div class="ctr">
      <button data-n="anterior" aria-label="Anterior">${icone('skip_previous', 'fill')}</button>
      <button class="pp" data-n="play" aria-label="${S.tocando ? 'Pausar' : 'Tocar'}">${icone(S.tocando ? 'pause' : 'play_arrow', 'fill')}</button>
      <button data-n="proxima" aria-label="Próxima">${icone('skip_next', 'fill')}</button>
      <div class="bar"><i style="width:${S.pos / m.duracao * 100}%"></i></div>
      <button data-n="fav" aria-label="Favoritar">${icone('favorite', S.favoritas.has(m.id) ? 'fill' : '')}</button>
    </div>
  </div>`;
}
function simularSistema(tipo) {
  if (!atual()) { const ms = biblioteca(); if (!ms.length) return aviso('Escolha uma pasta e toque uma música primeiro'); tocarLista(ms.map(m => m.id), 0, { tipo: 'Tocando de', nome: 'Todas as músicas' }); }
  fecharSobreposicao(true); $$('.shade, .lock', app).forEach(e => e.remove());
  const el = document.createElement('div');
  el.className = tipo === 'bloqueio' ? 'lock' : 'shade';
  const pintar = () => {
    const d = new Date();
    el.innerHTML = tipo === 'bloqueio'
      ? `<div class="clock">${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}</div><div class="date">${d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>${notificacaoHTML()}<div class="hint">Toque fora do cartão para desbloquear</div>`
      : notificacaoHTML();
  };
  pintar();
  el.addEventListener('atualizar', pintar);
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-n]');
    if (b) {
      e.stopPropagation();
      if (b.dataset.n === 'play') play(); if (b.dataset.n === 'proxima') proxima(); if (b.dataset.n === 'anterior') anterior();
      if (b.dataset.n === 'fav') alternarFavorita(atual().id);
      return;
    }
    if (!e.target.closest('.notif')) { el.remove(); atualizarPainelAtual(); }
  });
  app.appendChild(el);
  atualizarPainel(tipo === 'bloqueio' ? 'sim-bloqueio' : 'sim-notificacao');
}

function alternarFavorita(id) {
  const tem = S.favoritas.has(id);
  tem ? S.favoritas.delete(id) : S.favoritas.add(id);
  aviso(tem ? 'Removida das favoritas' : 'Adicionada às favoritas', 'Desfazer', () => { tem ? S.favoritas.add(id) : S.favoritas.delete(id); atualizarPlayer(); });
  atualizarPlayer();
}

/* ============================================================
   Ações (cliques)
   ============================================================ */
const ACOES = {
  'voltar': () => voltar(),
  'aba': b => aba(b.dataset.tab),
  'escolher-pasta': b => { fecharSobreposicao(true); abrirSeletor(b.dataset.origem || (S.configurado ? 'ajustes' : 'onboarding'), S.configurado ? '' : ''); },
  'ir-biblioteca': () => { S.libTab = 'musicas'; raiz('biblioteca'); },
  'lib-tab': b => { S.libTab = b.dataset.tab; pilha[0].params = {}; render('none'); },
  'ordem': () => abrirFolha(`<h3>Ordenar músicas</h3><div class="s-body">${Object.entries(ORDENS).map(([k, n]) =>
      `<button class="menu-i ${S.ordem === k ? 'sel' : ''}" data-a="set-ordem" data-k="${k}">${icone(S.ordem === k ? 'radio_button_checked' : 'radio_button_unchecked')}${n}</button>`).join('')}</div>`),
  'set-ordem': b => { S.ordem = b.dataset.k; fecharSobreposicao(); render('none'); },
  'album': b => { fecharSobreposicao(true); if (npEl.classList.contains('aberto')) fecharNP(); ir('album', { id: b.dataset.id }); },
  'artista': b => { fecharSobreposicao(true); if (npEl.classList.contains('aberto')) fecharNP(); ir('artista', { nome: b.dataset.nome }); },
  'artista-np': b => { if (album(atual().album).semMetadados) return; fecharNP(); ir('artista', { nome: b.dataset.nome }); },
  'pasta': b => ir('pasta', { caminho: b.dataset.caminho }),
  'playlist': b => ir('playlist', { id: b.dataset.id }),
  'tocar': (b, e) => { if (e.target.closest('[data-a="menu"]')) return; const c = contextos[b.dataset.ctx]; tocarLista(c.ids, +b.dataset.i, c.origem, false); },
  'tocar-tudo': b => { const c = contextos[b.dataset.ctx]; tocarLista(c.ids, 0, c.origem, false); abrirNP(); },
  'aleatorio-tudo': b => { const c = contextos[b.dataset.ctx]; tocarLista(c.ids, Math.floor(Math.random() * c.ids.length), c.origem, true); abrirNP(); },
  'menu': b => menuMusica(b.dataset.mid),
  'menu-album': b => { const a = album(b.dataset.id); const ids = biblioteca().filter(m => m.album === a.id).map(m => m.id);
    abrirFolha(`<div class="s-head"><div class="cover">${capa(a)}</div><div><div class="ti">${esc(a.titulo)}</div><div class="ar">${esc(a.artistaNome)}</div></div></div><div class="s-body">
      <button class="menu-i" data-a="seguir-varias" data-ids="${ids.join(',')}">${icone('playlist_play')}Tocar a seguir</button>
      <button class="menu-i" data-a="fila-varias" data-ids="${ids.join(',')}">${icone('add_to_queue')}Adicionar ao fim da fila</button>
      ${a.semMetadados ? '' : `<button class="menu-i" data-a="artista" data-nome="${esc(a.artistaNome)}">${icone('mic')}Ir para o artista</button>`}</div>`); },
  'seguir-varias': b => { const ids = b.dataset.ids.split(','); if (!atual()) return tocarLista(ids, 0, { tipo: 'Tocando', nome: 'Fila' }); S.fila.splice(S.idx + 1, 0, ...ids); S.filaOriginal.push(...ids); fecharSobreposicao(); aviso(`${plural(ids.length, 'música', 'músicas')} vão tocar a seguir`); },
  'fila-varias': b => { const ids = b.dataset.ids.split(','); if (!atual()) return tocarLista(ids, 0, { tipo: 'Tocando', nome: 'Fila' }); S.fila.push(...ids); S.filaOriginal.push(...ids); fecharSobreposicao(); aviso(`${plural(ids.length, 'música adicionada', 'músicas adicionadas')} à fila`); },
  'menu-playlist': b => { const p = S.playlists.find(x => x.id === b.dataset.id);
    abrirFolha(`<h3>${esc(p.nome)}</h3><div class="s-body">
      <button class="menu-i" data-a="renomear-playlist" data-id="${p.id}">${icone('edit')}Renomear</button>
      <button class="menu-i" data-a="excluir-playlist" data-id="${p.id}" style="color:var(--cor-erro)">${icone('delete')}Excluir playlist</button></div>`); },
  'renomear-playlist': b => { const p = S.playlists.find(x => x.id === b.dataset.id);
    abrirDialogo(`${icone('edit')}<h4>Renomear playlist</h4><input class="field" id="pl-nome" value="${esc(p.nome)}" maxlength="40">
      <div class="acts"><button class="btn btn-txt" data-a="fechar-sobreposicao">Cancelar</button><button class="btn btn-pri" data-a="salvar-nome" data-id="${p.id}">Salvar</button></div>`); },
  'salvar-nome': b => { const v = $('#pl-nome').value.trim(); if (!v) return; S.playlists.find(x => x.id === b.dataset.id).nome = v; fecharSobreposicao(); render('none'); aviso('Playlist renomeada'); },
  'excluir-playlist': b => { const p = S.playlists.find(x => x.id === b.dataset.id);
    abrirDialogo(`${icone('delete', 'perigo')}<h4>Excluir "${esc(p.nome)}"?</h4><p>A playlist some, mas as músicas continuam na biblioteca e no seu celular.</p>
      <div class="acts"><button class="btn btn-txt" data-a="fechar-sobreposicao">Cancelar</button><button class="btn btn-perigo" data-a="confirmar-excluir" data-id="${p.id}">Excluir</button></div>`); },
  'confirmar-excluir': b => { const i = S.playlists.findIndex(x => x.id === b.dataset.id); const [p] = S.playlists.splice(i, 1);
    fecharSobreposicao(); voltar(); aviso(`Playlist "${esc(p.nome)}" excluída`, 'Desfazer', () => { S.playlists.splice(i, 0, p); render('none'); }); },
  'nova-playlist': b => abrirDialogo(`${icone('queue_music')}<h4>Nova playlist</h4><input class="field" id="pl-nome" placeholder="Nome da playlist" maxlength="40">
      <div class="acts"><button class="btn btn-txt" data-a="fechar-sobreposicao">Cancelar</button><button class="btn btn-pri" data-a="criar-playlist" data-mid="${b.dataset.mid || ''}">Criar</button></div>`, 'nova-playlist'),
  'criar-playlist': b => { const v = $('#pl-nome').value.trim(); if (!v) { $('#pl-nome').focus(); return; }
    const p = { id: 'pl' + uid(), nome: v, musicas: b.dataset.mid ? [b.dataset.mid] : [] }; S.playlists.push(p); fecharSobreposicao();
    if (b.dataset.mid) aviso(`Adicionada a "${esc(v)}"`); else ir('playlist', { id: p.id }); if (telaAtual === 'playlists') render('none'); },
  'add-playlist': b => escolherPlaylist(b.dataset.mid),
  'add-na-playlist': b => { const p = S.playlists.find(x => x.id === b.dataset.pid); const id = b.dataset.mid;
    if (p.musicas.includes(id)) { aviso(`Já está em "${esc(p.nome)}"`); return; }
    p.musicas.push(id); fecharSobreposicao(); aviso(`Adicionada a "${esc(p.nome)}"`, 'Desfazer', () => { p.musicas = p.musicas.filter(x => x !== id); }); },
  'tocar-seguir': b => { const id = b.dataset.mid; fecharSobreposicao(); if (!atual()) return tocarLista([id], 0, { tipo: 'Tocando', nome: 'Fila' }); S.fila.splice(S.idx + 1, 0, id); S.filaOriginal.push(id); aviso('Vai tocar a seguir'); },
  'add-fila': b => { const id = b.dataset.mid; fecharSobreposicao(); if (!atual()) return tocarLista([id], 0, { tipo: 'Tocando', nome: 'Fila' }); S.fila.push(id); S.filaOriginal.push(id); aviso('Adicionada ao fim da fila'); },
  'favoritar': b => { fecharSobreposicao(); alternarFavorita(b.dataset.mid); },
  'info-arquivo': b => infoArquivo(b.dataset.mid),
  'abrir-np': (b, e) => { if (e.target.closest('[data-a="play"],[data-a="proxima"]')) return; abrirNP(); },
  'fechar-np': () => fecharNP(),
  'play': () => play(),
  'proxima': () => proxima(),
  'anterior': () => anterior(),
  'aleatorio': () => alternarAleatorio(),
  'repetir': () => alternarRepetir(),
  'fila': () => abrirFila(),
  'pular-para': (b, e) => { if (e.target.closest('[data-a="tirar-fila"]')) return; S.idx = +b.dataset.i; S.pos = 0; play(true); atualizarPlayer(); },
  'tirar-fila': b => { const i = +b.dataset.i; const [id] = S.fila.splice(i, 1); $('#fila-lista').innerHTML = linhasFila(); marcarAtivas(); aviso('Tirada da fila', 'Desfazer', () => { S.fila.splice(i, 0, id); const l = $('#fila-lista'); if (l) l.innerHTML = linhasFila(); }); },
  'timer': () => abrirTimer(),
  'set-timer': b => { const v = b.dataset.min; fecharSobreposicao();
    if (v === '0') { S.timer = null; aviso('Timer desligado'); }
    else if (v === 'fim') { S.timer = { fimMusica: true }; aviso('A música vai parar no fim desta faixa'); }
    else { S.timer = { fim: Date.now() + v * 60000 }; aviso(`A música vai parar em ${v} min`); }
    if (npEl.classList.contains('aberto')) renderNP(); if (telaAtual === 'ajustes') render('none'); },
  'toggle': (b, e) => { const k = b.dataset.k; S[k] = !S[k]; const sw = $('.switch', b); sw && sw.setAttribute('aria-checked', S[k]);
    if (k === 'usarImagens') { setTimeout(() => { render('none'); renderMini(); }, 250); aviso(S[k] ? 'Usando fotos e capas das pastas' : 'Usando capas geradas pelo app'); }
    if (k === 'subpastas') { setTimeout(() => render('none'), 250); aviso(S[k] ? 'Subpastas incluídas' : `Só arquivos direto nas pastas escolhidas · ${plural(biblioteca().length, 'música', 'músicas')}`); } },
  'remover-pasta': b => { const p = S.pastas.find(x => x.id === b.dataset.id); const n = musicasDaPasta(p.caminho, true).length;
    abrirDialogo(`${icone('folder_off', 'perigo')}<h4>Remover "${esc(p.nome)}"?</h4><p>${plural(n, 'música sai', 'músicas saem')} da biblioteca. Os arquivos continuam no seu celular.</p>
      <div class="acts"><button class="btn btn-txt" data-a="fechar-sobreposicao">Cancelar</button><button class="btn btn-perigo" data-a="confirmar-remover" data-id="${p.id}">Remover</button></div>`, 'remover-pasta'); },
  'confirmar-remover': b => { const i = S.pastas.findIndex(x => x.id === b.dataset.id); const [p] = S.pastas.splice(i, 1); fecharSobreposicao();
    if (atual() && !naBiblioteca(atual())) { S.fila = []; S.tocando = false; }
    render('none'); aviso(`Pasta "${esc(p.nome)}" removida`, 'Desfazer', () => { S.pastas.splice(i, 0, p); render('none'); }); },
  'reescanear': () => { aviso('Procurando músicas novas…'); setTimeout(() => aviso(`Biblioteca em dia · ${plural(biblioteca().length, 'música', 'músicas')}, nenhuma novidade`), 1600); },
  'bateria': () => aviso('No app, isto abre a tela de bateria do Android'),
  'tema': b => definirTema(b.dataset.tema),
  'ver-todas-musicas': () => { S.buscaTodas = true; $('#q').dispatchEvent(new Event('input')); },
  'limpar-busca': () => { const i = $('#q'); i.value = ''; i.dispatchEvent(new Event('input')); i.focus(); },
  'recente': b => { const i = $('#q'); i.value = b.dataset.q; i.dispatchEvent(new Event('input')); },
  'limpar-recentes': () => { S.recentes = []; $('#q').dispatchEvent(new Event('input')); },
  'fechar-sobreposicao': () => fecharSobreposicao(),
};

app.addEventListener('click', e => {
  const tab = e.target.closest('#bnav [data-tab]');
  if (tab) return aba(tab.dataset.tab);
  const b = e.target.closest('[data-a]');
  if (!b || !app.contains(b)) return;
  // o clique mais interno vence (ex.: botão ⋮ dentro de uma linha)
  const fn = ACOES[b.dataset.a];
  if (fn) { e.preventDefault(); fn(b, e); }
});
app.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('[data-a][tabindex]')) { e.target.click(); }
  if (e.key === 'Enter' && e.target.id === 'pl-nome') { const ok = $('[data-a="criar-playlist"], [data-a="salvar-nome"]', overlayEl); ok && ok.click(); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') voltar(); });

/* ============================================================
   Tema
   ============================================================ */
function definirTema(t) {
  if (t === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
  try { localStorage.setItem('vitrola-mockup-tema', t); } catch (e) {}
  $$('#panel-theme button').forEach(b => b.setAttribute('aria-pressed', b.dataset.tema === t));
  $$('.theme-seg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.tema === t));
}
$$('#panel-theme button').forEach(b => b.addEventListener('click', () => definirTema(b.dataset.tema)));

/* ============================================================
   Painel: atalhos de tela, simulações e notas
   ============================================================ */
const NOTAS = {
  'boas-vindas': 'Primeira abertura. Apresenta as três promessas do app e leva direto para a escolha da pasta. O braço desce no disco ao abrir.',
  'seletor': 'Tela do próprio Android (SAF), não do app. Você navega até a pasta de músicas e toca em "Usar esta pasta". A raiz e "Download" são bloqueadas pelo sistema. Teste escolher "WhatsApp" para ver o caso sem músicas.',
  'escaneamento': 'Lê só a pasta escolhida e mostra o progresso real, arquivo por arquivo. No fim, resume o que encontrou.',
  'biblioteca-musicas': 'Tela principal. Filtros no topo, "Tocar" e "Aleatório", e ordenação (A–Z, recentes, mais tocadas). Toque numa música para tocar; ⋮ abre o menu.',
  'biblioteca-albuns': 'Grade de álbuns com capas. Os MP3 sem capa ganham uma gerada a partir do nome do álbum.',
  'biblioteca-artistas': 'Artistas em grade, com a foto da pasta do artista (artista.jpg). Sem foto, aparece a capa do primeiro álbum dele.',
  'biblioteca-pastas': 'A biblioteca vista pelas pastas. Útil para quem organiza tudo em pastas, e mostra exatamente o que foi lido.',
  'album': 'Detalhe do álbum: capa grande, faixas numeradas e a pasta de origem no rodapé.',
  'artista': 'Foto grande do artista no topo, com o nome por cima. Sem foto (ex.: Titãs), a capa do álbum vira um fundo desfocado. Depois vêm os álbuns e as músicas.',
  'pasta': 'Navegação por pasta: pastas de artista mostram a foto e pastas de álbum mostram a capa. As imagens reconhecidas (artista.jpg, capa.jpg) aparecem destacadas.',
  'busca': 'Busca instantânea em músicas, álbuns e artistas, ignorando acentos ("aguas" acha "Águas"). As buscas recentes ficam salvas.',
  'playlists': 'Playlists automáticas (favoritas, mais tocadas, recentes) e as suas.',
  'playlist': 'Detalhe da playlist. Pelo ⋮ do topo dá para renomear ou excluir.',
  'ajustes': 'Pastas da biblioteca (adicionar e remover), subpastas, timer, retomar, fone, dica de bateria e tema.',
  'tocando': 'A capa do álbum vira o selo do disco. O braço desce ao tocar e sobe ao pausar, e o disco desacelera. O fundo ganha um toque da cor da capa. Toque no ícone de info para ver o arquivo.',
  'fila': 'O que já tocou, o que toca agora e o que vem a seguir. Dá para pular para uma música ou tirá-la da fila. (Arrastar para reordenar fica para o app.)',
  'menu': 'Menu da música: tocar a seguir, fila, playlist, favoritar, ir para álbum ou artista, e detalhes do arquivo.',
  'timer': 'Timer para dormir: tempos prontos ou "no fim desta música". A contagem aparece no player e nos ajustes.',
  'nova-playlist': 'Criação rápida: só o nome.',
  'remover-pasta': 'Remover uma pasta tira as músicas da biblioteca, mas não apaga nada do celular. Dá para desfazer.',
  'vazia': 'Biblioteca sem nenhuma pasta escolhida.',
  'sim-notificacao': 'Notificação de mídia do Android: os controles funcionam e acompanham o player. Toque fora para fechar.',
  'sim-bloqueio': 'Controles na tela de bloqueio. Toque fora do cartão para voltar.',
};
const ATALHOS = [
  ['boas-vindas', 'Boas-vindas', () => { zerar(); }],
  ['seletor', 'Seletor de pasta (Android)', () => { zerar(); abrirSeletor('onboarding', ''); }],
  ['escaneamento', 'Escaneamento', () => { garantirBiblioteca(); raiz('escaneamento'); }],
  ['biblioteca-musicas', 'Biblioteca · Músicas', () => { garantirBiblioteca(); S.libTab = 'musicas'; raiz('biblioteca'); }],
  ['biblioteca-albuns', 'Biblioteca · Álbuns', () => { garantirBiblioteca(); S.libTab = 'albuns'; raiz('biblioteca'); }],
  ['biblioteca-artistas', 'Biblioteca · Artistas', () => { garantirBiblioteca(); S.libTab = 'artistas'; raiz('biblioteca'); }],
  ['biblioteca-pastas', 'Biblioteca · Pastas', () => { garantirBiblioteca(); S.libTab = 'pastas'; raiz('biblioteca'); }],
  ['album', 'Álbum', () => { garantirBiblioteca(); S.libTab = 'albuns'; raiz('biblioteca'); ir('album', { id: 'clube' }); }],
  ['artista', 'Artista', () => { garantirBiblioteca(); S.libTab = 'artistas'; raiz('biblioteca'); ir('artista', { nome: 'Caetano Veloso' }); }],
  ['pasta', 'Pasta', () => { garantirBiblioteca(); S.libTab = 'pastas'; raiz('biblioteca'); ir('pasta', { caminho: 'Music/MPB' }); }],
  ['busca', 'Busca', () => { garantirBiblioteca(); raiz('busca'); }],
  ['playlists', 'Playlists', () => { garantirBiblioteca(); raiz('playlists'); }],
  ['playlist', 'Playlist', () => { garantirBiblioteca(); raiz('playlists'); ir('playlist', { id: 'domingo' }); }],
  ['ajustes', 'Ajustes', () => { garantirBiblioteca(); raiz('ajustes'); }],
  ['tocando', 'Tocando agora', () => { garantirTocando(); abrirNP(); }],
  ['fila', 'Fila', () => { garantirTocando(); abrirNP(); setTimeout(abrirFila, 200); }],
  ['menu', 'Menu da música', () => { garantirBiblioteca(); if (telaAtual !== 'biblioteca') { S.libTab = 'musicas'; raiz('biblioteca'); } menuMusica('elistom-1'); }],
  ['timer', 'Timer para dormir', () => { garantirTocando(); abrirNP(); setTimeout(abrirTimer, 200); }],
  ['vazia', 'Biblioteca vazia', () => { garantirBiblioteca(); S.pastas = []; S.fila = []; S.tocando = false; raiz('biblioteca'); atualizarPainel('vazia'); }],
];
$('#jump').innerHTML = ATALHOS.map(([k, n], i) => `<button data-jump="${k}"><span class="n">${i + 1}</span>${n}</button>`).join('');
$('#jump').addEventListener('click', e => {
  const b = e.target.closest('[data-jump]'); if (!b) return;
  fecharSobreposicao(true); $$('.sys, .sys-dialog, .sys-tag, .shade, .lock', app).forEach(x => x.remove());
  if (npEl.classList.contains('aberto') && !['tocando', 'fila', 'timer'].includes(b.dataset.jump)) fecharNP();
  ATALHOS.find(a => a[0] === b.dataset.jump)[2]();
  $('#panel').classList.remove('aberto');
});
function atualizarPainel(chave) {
  $$('#jump button').forEach(b => b.setAttribute('aria-current', b.dataset.jump === chave));
  $('#nota-texto').textContent = NOTAS[chave] || '';
}
function atualizarPainelAtual() {
  const def = TELAS[telaAtual];
  atualizarPainel(npEl.classList.contains('aberto') ? 'tocando' : def.chave ? def.chave(pilha[pilha.length - 1].params) : telaAtual);
}

const SIMULACOES = {
  notificacao: () => simularSistema('notificacao'),
  bloqueio: () => simularSistema('bloqueio'),
  reabrir: () => {
    garantirBiblioteca();
    fecharSobreposicao(true); $$('.sys, .sys-dialog, .sys-tag, .shade, .lock', app).forEach(x => x.remove());
    if (npEl.classList.contains('aberto')) fecharNP();
    const tinha = atual();
    if (S.tocando) { S.angulo = anguloAtual(); S.tocando = false; }
    if (!S.retomar) { S.fila = []; }
    S.libTab = 'musicas'; raiz('biblioteca');
    if (tinha && S.retomar) aviso(`Continuando de onde parou: "${esc(tinha.titulo)}" em ${fmt(S.pos)}`, 'Tocar', () => play(true));
    else aviso('App reaberto do zero');
  },
  fone: () => {
    if (!S.tocando) return aviso('Toque uma música primeiro para testar');
    if (!S.pausarFone) return aviso('Fone desconectado · a música continua (opção desligada nos ajustes)');
    play(false); aviso('Fone desconectado · música pausada', 'Continuar', () => play(true));
  },
  erro: () => {
    garantirBiblioteca();
    const ms = biblioteca().map(m => m.id);
    if (!atual()) tocarLista(ms, Math.max(0, ms.indexOf('diversos-3')), { tipo: 'Tocando de', nome: 'Todas as músicas' });
    const m = atual();
    proxima(); play(true);
    aviso(`Não deu para tocar "${esc(m.arquivo)}". Pulamos para a próxima.`);
  },
  permissao: () => {
    garantirBiblioteca();
    const p = S.pastas[0]; if (!p) return aviso('Nenhuma pasta escolhida');
    if (S.tocando) play(false);
    abrirDialogo(`${icone('folder_off', 'perigo')}<h4>Perdemos o acesso à pasta "${esc(p.nome)}"</h4>
      <p>Isso acontece quando a pasta é movida ou renomeada, ou quando o acesso é removido nos ajustes do Android. Escolha a pasta de novo para continuar ouvindo.</p>
      <div class="acts"><button class="btn btn-txt" data-a="fechar-sobreposicao">Agora não</button><button class="btn btn-pri" data-a="escolher-pasta" data-origem="ajustes">Escolher pasta</button></div>`);
  },
  zerar: () => zerar(),
};
$$('[data-sim]').forEach(b => b.addEventListener('click', () => { SIMULACOES[b.dataset.sim](); $('#panel').classList.remove('aberto'); }));
$('#panel-fab').addEventListener('click', () => $('#panel').classList.toggle('aberto'));

function garantirBiblioteca() {
  if (!S.configurado || !S.pastas.length) { S.configurado = true; S.pastas = clone(D.pastasEscolhidas); }
}
function garantirTocando() {
  garantirBiblioteca();
  if (telaAtual === 'boas-vindas' || telaAtual === 'escaneamento') { S.libTab = 'musicas'; raiz('biblioteca'); }
  if (!atual()) { const a = biblioteca().filter(m => m.album === 'elistom'); tocarLista(a.map(m => m.id), 0, { tipo: 'Tocando do álbum', nome: 'Elis & Tom' }, false); S.pos = 47; }
}
function zerar() {
  const tema = document.documentElement.dataset.theme;
  S = ESTADO_INICIAL();
  npEl.classList.remove('aberto');
  overlayEl.innerHTML = ''; $('#snack-area').innerHTML = '';
  $$('.sys, .sys-dialog, .sys-tag, .shade, .lock', app).forEach(x => x.remove());
  raiz('boas-vindas');
}

/* ============================================================
   Início
   ============================================================ */
let temaSalvo = 'auto';
try { temaSalvo = localStorage.getItem('vitrola-mockup-tema') || 'auto'; } catch (e) {}
definirTema(temaSalvo);
raiz('boas-vindas');
})();
