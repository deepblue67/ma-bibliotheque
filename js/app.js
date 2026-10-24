// ===========================================================
// Ma Bibliothèque — application (vanilla JS, pas de build)
// ===========================================================

const cfg = window.SUPABASE_CONFIG;
const sb = window.supabase.createClient(cfg.url, cfg.anonKey);

// -----------------------------------------------------------
// Thèmes et préférences
// Les 10 thèmes sont définis en CSS (css/style.css) ; ici on ne
// garde que leur nom et ce qui sert à les présenter dans les réglages.
// -----------------------------------------------------------
const THEMES = [
  {id:"nordique", label:"Nordique", desc:"Lin et sauge, tout en rondeur"},
  {id:"grenat", label:"Papier & Grenat", desc:"La bibliothèque classique, serif et rouge sombre"},
  {id:"encre", label:"Encre & Or", desc:"Bleu nuit profond rehaussé d'or"},
  {id:"terracotta", label:"Terracotta", desc:"Sable chaud et terre cuite"},
  {id:"bibliotheque", label:"Cuir & Laiton", desc:"Un cabinet de lecture, chaud et feutré"},
  {id:"brume", label:"Brume", desc:"Gris bleutés, minimal et reposant"},
  {id:"agrume", label:"Agrume", desc:"Blanc net, orange franc, très lisible"},
  {id:"minuit", label:"Minuit", desc:"Indigo électrique sur bleu très sombre"},
  {id:"botanique", label:"Botanique", desc:"Vert profond et papier végétal"},
  {id:"pulp", label:"Rétro Pulp", desc:"Crème jauni, rouge d'affiche, angles vifs"},
];
const DEFAULTS = {theme:"nordique", mode:"auto", rail:"on"};

// localStorage peut lever une exception (navigation privée, cookies bloqués) :
// l'app doit continuer à fonctionner sans, d'où les try/catch.
function prefGet(k){
  try{ return localStorage.getItem("mabiblio."+k) || DEFAULTS[k]; }
  catch(e){ return DEFAULTS[k]; }
}
function prefSet(k, v){
  try{ localStorage.setItem("mabiblio."+k, v); }catch(e){}
}
function applyTheme(){
  const t = THEMES.some(x => x.id === prefGet("theme")) ? prefGet("theme") : DEFAULTS.theme;
  document.documentElement.setAttribute("data-theme", t);
  document.documentElement.setAttribute("data-mode", prefGet("mode"));
  // la barre d'état du téléphone suit la couleur de fond du thème
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta){
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    if (bg) meta.setAttribute("content", bg);
  }
}
applyTheme();

const el = {
  app: document.getElementById('app'),
  search: document.getElementById('search-input'),
  searchClear: document.getElementById('search-clear'),
  filterFormat: document.getElementById('filter-format'),
  filterGenre: document.getElementById('filter-genre'),
  filterStatus: document.getElementById('filter-status'),
  controls: document.getElementById('controls'),
  menuToggle: document.getElementById('menu-toggle'),
  settingsBtn: document.getElementById('settings-btn'),
  lightbox: document.getElementById('lightbox'),
  lightboxImg: document.getElementById('lightbox-img'),
  lightboxClose: document.getElementById('lightbox-close'),
};

// Passe à false si la migration d'octobre 2026 (colonnes source_title et
// is_hidden) n'a pas encore été exécutée dans Supabase : l'app fonctionne
// alors comme avant, sans les commandes de correction et de masquage.
let EDITABLE = true;

// Idem pour la migration « séries » : sans elle, la page d'un auteur reste
// une simple liste alphabétique, comme avant.
let SERIES_READY = true;

// ---------------------------------------------------------------
// Mode propriétaire
//
// Cette application est publique : elle est consultée par les proches de
// Christophe, la clé Supabase `anon` est dans le code, et la politique RLS
// autorise la mise à jour de `books` sans authentification — c'est ce qui
// fait fonctionner les cases de statut.
//
// Ce code n'est donc PAS une serrure. C'est un garde-fou : il empêche un
// visiteur de masquer un livre ou de renommer un titre par inadvertance.
// Il n'empêche pas quelqu'un de déterminé, qui lirait le source et
// appellerait l'API directement, d'écrire dans la base. La seule fermeture
// réelle serait de retirer le droit d'écriture publique sur `books` et de
// passer par une authentification Supabase.
//
// Le code n'est pas stocké en clair : config.js ne contient que son
// empreinte SHA-256, et la page de réglages sait générer cette empreinte
// pour que le code choisi n'ait à être écrit nulle part.
// ---------------------------------------------------------------
const OWNER_CONFIGURED = typeof cfg.ownerHash === 'string' && /^[0-9a-f]{64}$/.test(cfg.ownerHash);
let OWNER = false;
try { OWNER = OWNER_CONFIGURED && localStorage.getItem('mabiblio.owner') === '1'; } catch (e) {}

// crypto.subtle n'existe qu'en contexte sécurisé : disponible sur le site
// publié (https), absent si le fichier est ouvert en local (file://).
async function hashCode(code) {
  if (!(window.crypto && window.crypto.subtle)) return null;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('mabiblio:' + code));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function setOwner(on) {
  OWNER = !!on;
  try { localStorage.setItem('mabiblio.owner', OWNER ? '1' : '0'); } catch (e) {}
  syncStatusFilterVisibility();
}

// Le filtre « Statut » ne sert qu'à retrouver SES lus/écoutés/favoris :
// un visiteur n'a aucune raison d'en avoir besoin, et le proposer
// laisserait deviner ce que le propriétaire a lu ou aimé.
function syncStatusFilterVisibility() {
  if (!el.filterStatus) return;
  el.filterStatus.hidden = !OWNER;
  if (!OWNER && el.filterStatus.value) {
    el.filterStatus.value = '';
    el.filterStatus.dispatchEvent(new Event('input'));
  }
}

let ALL_BOOKS = [];      // liste plate des livres visibles
let HIDDEN_BOOKS = [];   // fiches masquées : conservées en base, invisibles ici
let AUTHORS = new Map(); // id -> {id, name, name_sort, books:[...]}
let AUTHOR_ORDER = [];   // les mêmes ids, dans l'ordre alphabétique affiché
let LOADED = false;
const scrollMemory = new Map(); // hash -> position, pour revenir là où on était

// ---------------------------------------------------------------
// Chargement des données
// ---------------------------------------------------------------
async function loadLibrary() {
  // Supabase/PostgREST ne renvoie que 1000 lignes max par requête : on doit
  // paginer avec .range() jusqu'à avoir tout récupéré (le catalogue fait
  // ~2000 livres, donc 2 pages). Sans ça, seuls les ~1000 premiers livres
  // s'affichaient, ce qui coupait aussi des auteurs entiers.
  const COLS_BASE = `
        id, title,
        has_ebook, has_pdf, has_audio,
        is_read, is_listened, is_favorite,
        genre, cover_path, source_note, created_at,
        author_id, authors ( id, name, name_sort )`;
  // Les colonnes ajoutées par les migrations d'octobre 2026 sont demandées
  // séparément : si l'une des deux migrations n'a pas encore été exécutée,
  // l'app se replie sur ce qui existe au lieu de ne plus rien afficher. Les
  // deux replis sont indépendants — une base sans « séries » garde les
  // commandes de correction et de masquage, et réciproquement.
  const cols = () => `id, title,`
    + (EDITABLE ? ` source_title, is_hidden,` : ``)
    + (SERIES_READY ? ` series, series_index,` : ``)
    + COLS_BASE.replace('id, title,', '');

  const PAGE_SIZE = 1000;
  let data = [];
  let offset = 0;
  while (true) {
    let { data: page, error } = await sb
      .from('books').select(cols())
      .order('id', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    // deux essais au plus : on retire d'abord les séries, puis l'édition
    for (let essai = 0; error && essai < 2; essai++) {
      const msg = error.message || '';
      if (SERIES_READY && /series/i.test(msg)) SERIES_READY = false;
      else if (EDITABLE && /source_title|is_hidden|column/i.test(msg)) EDITABLE = false;
      else break;
      ({ data: page, error } = await sb
        .from('books').select(cols())
        .order('id', { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1));
    }

    if (error) {
      el.app.innerHTML = `<div class="empty">Impossible de charger la bibliothèque.<br>
        <span style="font-family:var(--font-mono); font-size:0.75rem;">${escapeHtml(error.message)}</span><br><br>
        Vérifie que le script <code>supabase_schema.sql</code> a bien été exécuté et que les données ont été importées.</div>`;
      return false;
    }

    data = data.concat(page);
    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  const all = data.map(b => ({
    id: b.id,
    title: b.title,
    source_title: b.source_title || null,
    is_hidden: !!b.is_hidden,
    series: b.series || null,
    series_index: (b.series_index === 0 || b.series_index) ? b.series_index : null,
    author_id: b.author_id,
    author_name: b.authors ? b.authors.name : 'Auteur inconnu',
    author_name_sort: b.authors ? b.authors.name_sort : 'zzz',
    has_ebook: b.has_ebook, has_pdf: b.has_pdf, has_audio: b.has_audio,
    is_read: b.is_read, is_listened: b.is_listened, is_favorite: b.is_favorite,
    genre: b.genre || 'Non classé',
    cover_path: b.cover_path,
    source_note: b.source_note,
    created_at: b.created_at || '',
  }));
  // Texte de recherche calculé une fois pour toutes, à plat. On y joint le
  // titre d'origine du disque : un livre renommé reste trouvable par son
  // ancienne orthographe.
  for (const b of all) b.search = fold(`${b.title} ${b.author_name} ${b.source_title || ''}`);

  // Les fiches masquées restent en base pour empêcher leur réinsertion lors
  // d'une synchronisation, mais l'application ne les montre nulle part.
  ALL_BOOKS = all.filter(b => !b.is_hidden);
  HIDDEN_BOOKS = all.filter(b => b.is_hidden);

  rebuildAuthors();
  populateGenreFilter();
  LOADED = true;
  return true;
}

// Reconstruit l'index des auteurs à partir des livres visibles.
// Appelée au chargement, et après chaque masquage ou restauration.
function rebuildAuthors() {
  AUTHORS = new Map();
  for (const b of ALL_BOOKS) {
    if (!AUTHORS.has(b.author_id)) {
      AUTHORS.set(b.author_id, { id: b.author_id, name: b.author_name, name_sort: b.author_name_sort, books: [] });
    }
    AUTHORS.get(b.author_id).books.push(b);
  }
  // Un seul ordre pour tout le monde : la grille de l'accueil et les flèches
  // « précédent / suivant » le partagent, donc avancer d'une flèche revient
  // toujours à prendre le voisin qu'on voyait dans la grille.
  AUTHOR_ORDER = Array.from(AUTHORS.values())
    .sort((a, b) => (a.name_sort || a.name).localeCompare(b.name_sort || b.name, 'fr'))
    .map(a => a.id);
}

function populateGenreFilter() {
  const genres = new Set(ALL_BOOKS.map(b => b.genre));
  const sorted = Array.from(genres).sort((a, b) => a.localeCompare(b, 'fr'));
  for (const g of sorted) {
    const opt = document.createElement('option');
    opt.value = g; opt.textContent = g;
    el.filterGenre.appendChild(opt);
  }
}

// ---------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Met un texte à plat pour la recherche : sans accent, sans ligature, avec une
// seule forme d'apostrophe et de tiret. « Les Brûlés » et « les brules » doivent
// se valoir, de même que « cœur » et « coeur », ou l'apostrophe courbe « ’ » et
// l'apostrophe droite « ' » — les deux coexistent dans les titres selon la
// source des métadonnées.
function fold(s) {
  return (s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // retire les accents
    .toLowerCase()
    .replace(/[œ]/g, 'oe').replace(/[æ]/g, 'ae')       // non décomposées par NFD
    .replace(/[’‘`´']/g, ' ')                          // l'apostrophe ne sépare plus
    .replace(/[–—−]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function coverUrl(cover_path) {
  if (!cover_path) return null;
  return `${cfg.url}/storage/v1/object/public/${cfg.coversBucket}/${cover_path}`;
}

// Teinte stable déduite du titre : un même livre garde toujours la même
// jaquette de remplacement, d'une session à l'autre et d'un appareil à l'autre.
function hueOf(str) {
  let h = 0;
  const s = String(str || '?');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

function jacketMarkup(title, author) {
  return `<div class="jacket" style="--h:${hueOf(title + author)}">
      <span class="j-title">${escapeHtml(title)}</span>
      <span class="j-author">${escapeHtml(author)}</span>
    </div>`;
}

// Couverture réelle si elle existe, sinon jaquette générée (dégradé + texte).
// Les données du livre restent sur le conteneur : si l'image ne se charge pas
// (fichier absent du bucket, hors ligne), on peut reconstruire la jaquette.
function coverTile(book, cls) {
  const url = coverUrl(book.cover_path);
  const data = `data-t="${escapeHtml(book.title)}" data-a="${escapeHtml(book.author_name)}"`;
  if (url) {
    return `<div class="cover ${cls||''}" ${data}><img src="${url}" alt="Couverture de ${escapeHtml(book.title)}" loading="lazy"></div>`;
  }
  return `<div class="cover ${cls||''}" ${data}>${jacketMarkup(book.title, book.author_name)}</div>`;
}

// Une image de couverture qui échoue laisse sinon une icône cassée :
// on la remplace par la jaquette générée. L'évènement "error" ne remonte pas,
// d'où l'écoute en phase de capture.
document.addEventListener('error', ev => {
  const img = ev.target;
  if (!img || img.tagName !== 'IMG') return;
  const box = img.closest('.cover');
  if (!box || box.dataset.failed) return;
  box.dataset.failed = '1';
  box.innerHTML = jacketMarkup(box.dataset.t || '?', box.dataset.a || '');
}, true);

function formatBadges(book) {
  let out = '';
  if (book.has_ebook) out += `<span class="badge">Ebook</span>`;
  if (book.has_pdf) out += `<span class="badge">PDF</span>`;
  if (book.has_audio) out += `<span class="badge">Audio</span>`;
  // Lu / Écouté / Favori relèvent de l'usage personnel du propriétaire :
  // un visiteur ne doit pas pouvoir les découvrir en parcourant la liste.
  if (OWNER) {
    if (book.is_favorite) out += `<span class="badge fav">★ Favori</span>`;
    if (book.is_read) out += `<span class="badge status">Lu</span>`;
    if (book.is_listened) out += `<span class="badge status">Écouté</span>`;
  }
  return out;
}

function currentFilters() {
  // La recherche est découpée en mots : « piliers terre » ou « follett piliers »
  // trouvent le livre, sans avoir à taper les mots dans l'ordre ni en entier.
  const q = fold(el.search.value);
  return {
    terms: q ? q.split(' ').filter(Boolean) : [],
    format: el.filterFormat.value,
    genre: el.filterGenre.value,
    status: el.filterStatus.value,
  };
}
function filtersActive(f) { return !!(f.terms.length || f.format || f.genre || f.status); }

function matchesFilters(b, f) {
  if (f.terms.length) {
    const hay = b.search || fold(b.title + ' ' + b.author_name);
    for (const t of f.terms) if (!hay.includes(t)) return false;
  }
  if (f.format) {
    if (f.format === 'ebook' && !b.has_ebook) return false;
    if (f.format === 'pdf' && !b.has_pdf) return false;
    if (f.format === 'audio' && !b.has_audio) return false;
  }
  if (f.genre && b.genre !== f.genre) return false;
  if (f.status) {
    if (f.status === 'favorite' && !b.is_favorite) return false;
    if (f.status === 'read' && !b.is_read) return false;
    if (f.status === 'listened' && !b.is_listened) return false;
    if (f.status === 'unread' && b.is_read) return false;
  }
  return true;
}

// Première lettre de classement d'un auteur (les chiffres et symboles vont dans "#").
function initialOf(author) {
  const c = (author.name_sort || author.name || '#').trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : '#';
}

// ---------------------------------------------------------------
// Accueil : rayon des derniers ajouts + index A–Z + grille d'auteurs
// ---------------------------------------------------------------
function renderHome() {
  const f = currentFilters();

  if (filtersActive(f)) {
    const results = ALL_BOOKS.filter(b => matchesFilters(b, f))
      .sort((a, b) => a.author_name_sort.localeCompare(b.author_name_sort, 'fr') || a.title.localeCompare(b.title, 'fr'));
    renderBookResults(results);
    return;
  }

  const authors = AUTHOR_ORDER.map(id => AUTHORS.get(id));

  // regroupement par lettre
  const groups = new Map();
  for (const a of authors) {
    const k = initialOf(a);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(a);
  }
  const LETTERS = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const az = LETTERS.map(L =>
    groups.has(L)
      ? `<a href="#/" data-jump="L-${L}">${L}</a>`
      : `<a class="off">${L}</a>`
  ).join('');

  const sections = Array.from(groups.entries()).map(([L, list]) => `
    <h2 class="letter-head" id="L-${L}">${L}</h2>
    <div class="author-grid">
      ${list.map(a => authorCard(a)).join('')}
    </div>
  `).join('');

  el.app.innerHTML = `
    ${prefGet('rail') === 'on' ? recentRail() : ''}
    <div class="section-title">${authors.length} auteurs · ${ALL_BOOKS.length} livres <span class="rule"></span></div>
    <nav class="az" aria-label="Aller à une lettre">${az}</nav>
    ${sections}
  `;

  // l'index A–Z fait défiler sans changer l'URL (sinon on casse le retour arrière)
  el.app.querySelectorAll('.az a[data-jump]').forEach(a => {
    a.addEventListener('click', ev => {
      ev.preventDefault();
      const t = document.getElementById(a.dataset.jump);
      if (t) t.scrollIntoView({block:'start'});
    });
  });
}

// Mini-mosaïque : jusqu'à 4 couvertures de l'auteur, les vraies d'abord.
function authorCard(a) {
  const withCover = a.books.filter(b => b.cover_path);
  const rest = a.books.filter(b => !b.cover_path);
  const pick = withCover.concat(rest).slice(0, 4);
  return `
    <a class="author-card" href="#/author/${a.id}">
      <div class="mosaic">${pick.map(b => coverTile(b)).join('')}</div>
      <div class="meta">
        <span class="name">${escapeHtml(a.name)}</span>
        <span class="count">${a.books.length}</span>
      </div>
    </a>`;
}

function recentRail() {
  const recent = ALL_BOOKS.filter(b => b.created_at)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 18);
  if (recent.length < 4) return '';
  return `
    <div class="section-title">Derniers ajouts <span class="rule"></span></div>
    <div class="rail">
      ${recent.map(b => `
        <a class="rail-item" href="#/book/${b.id}">
          ${coverTile(b)}
          <div class="t">${escapeHtml(b.title)}</div>
          <div class="a">${escapeHtml(b.author_name)}</div>
        </a>`).join('')}
    </div>`;
}

function renderBookResults(results) {
  if (!results.length) {
    el.app.innerHTML = `<div class="empty">Aucun livre ne correspond à ta recherche.</div>`;
    return;
  }
  el.app.innerHTML = `
    <div class="section-title">${results.length} résultat${results.length > 1 ? 's' : ''} <span class="rule"></span></div>
    <div class="book-grid">
      ${results.map(b => `
        <a class="book-card" href="#/book/${b.id}">
          ${coverTile(b)}
          <div class="info">
            <h3>${escapeHtml(b.title)}</h3>
            <p class="by">${escapeHtml(b.author_name)}</p>
            <div class="badges">${formatBadges(b)}<span class="badge genre">${escapeHtml(b.genre)}</span></div>
          </div>
        </a>`).join('')}
    </div>`;
}

// ---------------------------------------------------------------
// Page auteur
// ---------------------------------------------------------------
function renderAuthor(authorId) {
  const author = AUTHORS.get(authorId);
  if (!author) { el.app.innerHTML = `<div class="empty">Auteur introuvable.</div>`; return; }
  const books = author.books.slice().sort((a, b) => a.title.localeCompare(b.title, 'fr'));
  const groupes = groupBySeries(books);

  el.app.innerHTML = `
    <a class="back-link" href="#/">← Tous les auteurs</a>
    <div class="author-header">
      <h1>${escapeHtml(author.name)}</h1>
      <span class="count">${books.length} livre${books.length > 1 ? 's' : ''}</span>
    </div>
    ${authorNav(authorId)}
    ${groupes.map(g => `
      ${g.nom ? `<div class="serie-head">
          <span class="s-nom">${escapeHtml(g.nom)}</span>
          <span class="s-cnt">${g.livres.length} tome${g.livres.length > 1 ? 's' : ''}</span>
        </div>` : (groupes.length > 1 ? `<div class="serie-head hors">
          <span class="s-nom">Hors série</span>
          <span class="s-cnt">${g.livres.length} livre${g.livres.length > 1 ? 's' : ''}</span>
        </div>` : '')}
      <div class="book-grid">
        ${g.livres.map(b => `
          <a class="book-card" href="#/book/${b.id}">
            ${coverTile(b)}
            <div class="info">
              <h3>${g.nom && b.series_index ? `<span class="tome">${b.series_index}.</span> ` : ''}${escapeHtml(b.title)}</h3>
              <p class="by">${escapeHtml(b.genre)}</p>
              <div class="badges">${formatBadges(b)}</div>
            </div>
          </a>`).join('')}
      </div>`).join('')}`;
}

// Passage à l'auteur précédent / suivant, dans l'ordre alphabétique de
// l'accueil. Les deux liens ne sont écrits qu'une fois : sur grand écran la
// feuille de style les sort du flux pour les poser dans les marges, partout
// ailleurs ils restent une barre normale sous le titre — pas de bouton
// flottant au bord de l'écran sur iPhone, où le bord gauche appartient déjà
// au geste « retour » du système.
function authorNav(authorId) {
  if (AUTHOR_ORDER.length < 2) return '';
  const i = AUTHOR_ORDER.indexOf(authorId);
  if (i < 0) return '';
  const prev = i > 0 ? AUTHORS.get(AUTHOR_ORDER[i - 1]) : null;
  const next = i < AUTHOR_ORDER.length - 1 ? AUTHORS.get(AUTHOR_ORDER[i + 1]) : null;
  if (!prev && !next) return '';

  const chevron = sens => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="${sens === 'prev' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}"></polyline></svg>`;

  const lien = (a, sens) => {
    if (!a) return '';
    const quoi = `Auteur ${sens === 'prev' ? 'précédent' : 'suivant'} : ${escapeHtml(a.name)}`;
    const nom = `<span class="n">${escapeHtml(a.name)}</span>`;
    return `<a class="nav-author ${sens}" href="#/author/${a.id}" rel="${sens}"
      title="${quoi}" aria-label="${quoi}">${
      sens === 'prev' ? chevron(sens) + nom : nom + chevron(sens)}</a>`;
  };

  return `<nav class="author-nav" aria-label="Navigation entre auteurs">${
    lien(prev, 'prev')}${lien(next, 'next')}</nav>`;
}

// Regroupe les livres d'un auteur par saga : chaque série dans l'ordre de ses
// tomes, les sagas les plus fournies d'abord, et les livres isolés rassemblés
// à la fin sous « Hors série ». Sans série renseignée, on retombe sur une
// liste unique, exactement comme avant.
function groupBySeries(books) {
  const par = new Map();
  const hors = [];
  for (const b of books) {
    if (b.series) {
      if (!par.has(b.series)) par.set(b.series, []);
      par.get(b.series).push(b);
    } else {
      hors.push(b);
    }
  }
  // une « série » dont un seul tome est présent n'apporte rien : elle rejoint
  // les livres isolés
  for (const [nom, liste] of Array.from(par)) {
    if (liste.length < 2) { hors.push(...liste); par.delete(nom); }
  }
  const groupes = Array.from(par.entries())
    .map(([nom, liste]) => ({
      nom,
      livres: liste.sort((a, b) => (a.series_index ?? 9999) - (b.series_index ?? 9999)
                                   || a.title.localeCompare(b.title, 'fr')),
    }))
    .sort((a, b) => b.livres.length - a.livres.length || a.nom.localeCompare(b.nom, 'fr'));
  if (hors.length) {
    groupes.push({ nom: null, livres: hors.sort((a, b) => a.title.localeCompare(b.title, 'fr')) });
  }
  return groupes;
}

// ---------------------------------------------------------------
// Fiche livre
// ---------------------------------------------------------------
function renderBook(bookId) {
  const book = ALL_BOOKS.find(b => b.id === bookId);
  if (!book) { el.app.innerHTML = `<div class="empty">Livre introuvable.</div>`; return; }
  const url = coverUrl(book.cover_path);
  const formats = [];
  if (book.has_ebook) formats.push('Ebook');
  if (book.has_pdf) formats.push('PDF');
  if (book.has_audio) formats.push('Audio');

  el.app.innerHTML = `
    <a class="back-link" href="#/author/${book.author_id}">← ${escapeHtml(book.author_name)}</a>
    <div class="fiche">
      <div class="cover-wrap">
        ${coverTile(book, 'fiche-cover')}
        ${url ? `<button class="magnify" id="magnify-btn" aria-label="Agrandir la couverture">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="7"/><path d="M20 20l-4.3-4.3"/>
          </svg></button>` : ''}
      </div>
      <div class="details">
        <h1>${escapeHtml(book.title)}</h1>
        <p class="by-line"><a href="#/author/${book.author_id}">${escapeHtml(book.author_name)}</a> · ${escapeHtml(book.genre)}</p>
        ${seriesStrip(book)}
        <div class="badges">${formats.map(f => `<span class="badge">${f}</span>`).join('')}</div>

        ${OWNER ? `<div class="toggles">
          <label class="toggle ${book.is_read ? 'active' : ''}" data-field="is_read">
            <input type="checkbox" ${book.is_read ? 'checked' : ''}> Lu sur liseuse
          </label>
          <label class="toggle ${book.is_listened ? 'active' : ''}" data-field="is_listened">
            <input type="checkbox" ${book.is_listened ? 'checked' : ''}> Écouté en audio
          </label>
          <label class="toggle ${book.is_favorite ? 'active' : ''}" data-field="is_favorite">
            <input type="checkbox" ${book.is_favorite ? 'checked' : ''}> Favori
          </label>
        </div>` : readOnlyStatuses(book)}

        ${(EDITABLE && OWNER) ? `<div class="book-actions" id="book-actions">
          <button type="button" class="linkish" data-act="rename">Corriger le titre</button>
          <button type="button" class="linkish danger" data-act="hide">Masquer ce livre</button>
        </div>` : ''}

        ${book.source_title ? `<div class="source-note">Sur le disque : « ${escapeHtml(book.source_title)} »</div>` : ''}
        ${book.source_note ? `<div class="source-note">${escapeHtml(book.source_note)}</div>` : ''}
      </div>
    </div>`;

  if (url) document.getElementById('magnify-btn')
    .addEventListener('click', () => openLightbox(url, book.title));

  if (!OWNER) return;   // un visiteur n'a aucune commande à brancher

  el.app.querySelectorAll('.toggle').forEach(label => {
    label.addEventListener('click', ev => {
      ev.preventDefault();
      toggleField(book, label.dataset.field, label);
    });
  });

  el.app.querySelectorAll('#book-actions button').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.act === 'rename') startRename(book);
      else confirmHide(book);
    });
  });
}

// ---------------------------------------------------------------
// Corriger un titre
//
// Le titre affiché devient celui que Christophe saisit, mais l'orthographe
// d'origine — celle des fichiers sur le disque — est conservée dans
// source_title. C'est elle que les imports utilisent pour retrouver la fiche :
// sans ça, la synchronisation suivante lirait l'ancien titre sur le disque,
// ne trouverait rien, et recréerait un doublon.
// ---------------------------------------------------------------
function startRename(book) {
  const box = document.getElementById('book-actions');
  box.innerHTML = `
    <div class="inline-form">
      <label for="new-title">Titre affiché dans l'application</label>
      <input type="text" id="new-title" value="${escapeHtml(book.title)}" autocomplete="off">
      <div class="row">
        <button type="button" class="btn-main" id="rename-ok">Enregistrer</button>
        <button type="button" class="linkish" id="rename-cancel">Annuler</button>
      </div>
      <p class="hint-sm">L'orthographe d'origine est conservée pour que les prochaines
        synchronisations retrouvent ce livre et ne le recréent pas.</p>
      <p class="form-error" id="rename-error" hidden></p>
    </div>`;
  const input = document.getElementById('new-title');
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  document.getElementById('rename-cancel').addEventListener('click', () => renderBook(book.id));
  document.getElementById('rename-ok').addEventListener('click', () => doRename(book));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') doRename(book);
    if (e.key === 'Escape') renderBook(book.id);
  });
}

async function doRename(book) {
  const input = document.getElementById('new-title');
  const err = document.getElementById('rename-error');
  const btn = document.getElementById('rename-ok');
  const next = input.value.trim();

  if (!next) { showFormError(err, 'Le titre ne peut pas être vide.'); return; }
  if (next === book.title) { renderBook(book.id); return; }

  // Un autre livre du même auteur porte déjà ce titre : la base refuserait
  // l'enregistrement (unicité auteur + titre). On le dit avant d'essayer.
  const clash = ALL_BOOKS.concat(HIDDEN_BOOKS).find(
    b => b.author_id === book.author_id && b.id !== book.id && b.title === next);
  if (clash) {
    showFormError(err, `${escapeHtml(book.author_name)} a déjà un livre intitulé « ${escapeHtml(next)} ». Ces deux fiches sont probablement le même livre : masque plutôt celle-ci.`);
    return;
  }

  btn.disabled = true;
  const payload = { title: next };
  // On ne fige l'orthographe du disque qu'à la première correction.
  if (!book.source_title) payload.source_title = book.title;

  const { error } = await sb.from('books').update(payload).eq('id', book.id);
  if (error) {
    btn.disabled = false;
    showFormError(err, "L'enregistrement a échoué. Vérifie ta connexion et réessaie.");
    return;
  }
  if (!book.source_title) book.source_title = book.title;
  book.title = next;
  // le titre corrigé entre dans l'index de recherche, l'ancien y reste
  book.search = fold(`${book.title} ${book.author_name} ${book.source_title || ''}`);
  renderBook(book.id);
}

// Bandeau de saga sur la fiche d'un livre : le nom de la série, le numéro du
// tome, et de quoi sauter au tome précédent ou suivant PARMI CEUX QUE
// POSSÈDE CHRISTOPHE — on ne propose jamais un tome absent de la
// bibliothèque. Le total affiché est donc celui de ses tomes à lui, pas celui
// de la saga complète : il a 32 Bob Morane sur une série qui en compte 105.
function seriesStrip(book) {
  if (!book.series) return '';
  const author = AUTHORS.get(book.author_id);
  if (!author) return '';
  const tomes = author.books
    .filter(b => b.series === book.series)
    .sort((a, b) => (a.series_index ?? 9999) - (b.series_index ?? 9999)
                    || a.title.localeCompare(b.title, 'fr'));
  if (tomes.length < 2) return '';
  const i = tomes.findIndex(b => b.id === book.id);
  const prev = i > 0 ? tomes[i - 1] : null;
  const next = i >= 0 && i < tomes.length - 1 ? tomes[i + 1] : null;
  const rang = book.series_index
    ? `tome ${book.series_index}`
    : `${i + 1}<sup>e</sup> de la série`;

  return `
    <div class="serie-strip">
      <div class="s-line">
        <span class="s-name">${escapeHtml(book.series)}</span>
        <span class="s-rank">${rang} · ${tomes.length} dans la bibliothèque</span>
      </div>
      <div class="s-nav">
        ${prev ? `<a href="#/book/${prev.id}" title="${escapeHtml(prev.title)}">← ${prev.series_index ? 'Tome ' + prev.series_index : 'Précédent'}</a>`
               : `<span class="off">← Précédent</span>`}
        ${next ? `<a href="#/book/${next.id}" title="${escapeHtml(next.title)}">${next.series_index ? 'Tome ' + next.series_index : 'Suivant'} →</a>`
               : `<span class="off">Suivant →</span>`}
      </div>
    </div>`;
}

// Un visiteur ne doit pas pouvoir découvrir ce que le propriétaire a lu,
// écouté ou mis en favori : cette fonction n'affiche donc plus rien.
// (Gardée pour ne pas changer l'appel en ligne 598 ; purement par
// cohérence avec formatBadges(), qui applique la même règle.)
function readOnlyStatuses(book) {
  return '';
}

function showFormError(node, msg) {
  node.innerHTML = msg;
  node.hidden = false;
}

// ---------------------------------------------------------------
// Masquer une fiche (suppression réversible)
// ---------------------------------------------------------------
function confirmHide(book) {
  const box = document.getElementById('book-actions');
  box.innerHTML = `
    <div class="inline-form">
      <p class="confirm-q">Masquer « ${escapeHtml(book.title)} » ?</p>
      <p class="hint-sm">La fiche disparaît de la bibliothèque mais reste en base,
        ce qui empêche les prochaines synchronisations de la recréer.
        Tu pourras la restaurer depuis les réglages.</p>
      <div class="row">
        <button type="button" class="btn-main danger" id="hide-ok">Masquer</button>
        <button type="button" class="linkish" id="hide-cancel">Annuler</button>
      </div>
      <p class="form-error" id="hide-error" hidden></p>
    </div>`;
  document.getElementById('hide-cancel').addEventListener('click', () => renderBook(book.id));
  document.getElementById('hide-ok').addEventListener('click', async () => {
    const btn = document.getElementById('hide-ok');
    btn.disabled = true;
    const { error } = await sb.from('books').update({ is_hidden: true }).eq('id', book.id);
    if (error) {
      btn.disabled = false;
      showFormError(document.getElementById('hide-error'), "Le masquage a échoué. Vérifie ta connexion et réessaie.");
      return;
    }
    book.is_hidden = true;
    ALL_BOOKS = ALL_BOOKS.filter(b => b.id !== book.id);
    HIDDEN_BOOKS.push(book);
    rebuildAuthors();
    scrollMemory.delete('#/');
    // on retourne à l'auteur, ou à l'accueil s'il ne lui reste plus rien
    location.hash = AUTHORS.has(book.author_id) ? `#/author/${book.author_id}` : '#/';
  });
}

async function restoreBook(book) {
  const { error } = await sb.from('books').update({ is_hidden: false }).eq('id', book.id);
  if (error) { alert("La restauration n'a pas pu être enregistrée."); return; }
  book.is_hidden = false;
  HIDDEN_BOOKS = HIDDEN_BOOKS.filter(b => b.id !== book.id);
  ALL_BOOKS.push(book);
  rebuildAuthors();
  renderSettings();
}

async function toggleField(book, field, label) {
  const newValue = !book[field];
  book[field] = newValue; // on affiche tout de suite, on corrige si ça rate
  label.classList.toggle('active', newValue);
  label.querySelector('input').checked = newValue;

  const { error } = await sb.from('books').update({ [field]: newValue }).eq('id', book.id);
  if (error) {
    book[field] = !newValue;
    label.classList.toggle('active', !newValue);
    label.querySelector('input').checked = !newValue;
    alert("La mise à jour n'a pas pu être enregistrée. Vérifie ta connexion et réessaie.");
  }
}

// ---------------------------------------------------------------
// Anomalies
//
// Six familles de défauts, toutes repérées sur les données déjà chargées :
// aucune requête supplémentaire, aucun appel extérieur. Les règles ont été
// calibrées sur la bibliothèque réelle — chacune a été élargie puis resserrée
// jusqu'à ce qu'elle ne signale pratiquement plus que de vrais défauts, car
// un écran qui crie au loup ne sert à rien.
// ---------------------------------------------------------------

// Mots qui ne sont jamais un titre : ils viennent des noms de fichiers.
const ANO_JUNK = /\b(ocr|alexandriz|vostfr|french|multi|retail|kbps|vbr|cbr)\b/gi;

// Nettoie un titre de ce qu'un nom de fichier y a laissé. On ne touche
// JAMAIS aux points isolés : « Mr. Brown », « I.G.H. » et « Un, deux,
// trois… » sont de vrais titres, et une règle trop zélée les abîmait.
function nettoieTitre(t) {
  let s = String(t || '');
  s = s.replace(/^\s*[A-ZÀ-Ý][\wÀ-ÿ'’-]+,\s*[A-ZÀ-Ý][\wÀ-ÿ'’-]+\s*-\s*/, '');  // « King,Stephen-… »
  s = s.replace(/\s*\.\s*\([^)]*\)/g, ' ');                                     // « .(Just after sunset) »
  s = s.replace(/\.(epub|pdf|mp3|azw3?|mobi|docx?|txt|ebook)\b/gi, ' ');
  s = s.replace(/\(\s*(?:19|20)\d{2}\s*\)/g, ' ');                              // « (2009) »
  s = s.replace(ANO_JUNK, ' ');
  s = s.replace(/\bebook\b/gi, ' ');
  s = s.replace(/^[a-zA-Z]{2,4}_/, '');                                         // « det_ »
  s = s.replace(/[_\[\]]+/g, ' ');
  s = s.replace(/\s{2,}/g, ' ').trim();
  // Les mots techniques retirés laissent des points isolés. On ne supprime
  // qu'un point entouré d'espaces : « Mr. Brown », « I.G.H. » et
  // « Un, deux, trois… » gardent les leurs, qui sont collés au texte.
  for (let i = 0; i < 5 && /(^|\s)\.(\s|$)/.test(s); i++) s = s.replace(/(^|\s)\.(\s|$)/g, ' ');
  s = s.replace(/\s{2,}/g, ' ').trim();
  return s.replace(/[\s,;:–—-]+$/, '').trim();
}

// Retire un préfixe du genre « Joel Dicker - » ou « Harry Quebert 2 - ».
function sansPrefixeAuteur(t) {
  const m = String(t || '').match(/^(.{2,40}?)\s[-–—]\s(.+)$/);
  return (m && m[1].split(/\s+/).length <= 4) ? m[2] : String(t || '');
}

// Neutralise ce qu'un nom propre peut contenir de caractères spéciaux :
// « Richard(King, Stephen) Bachman » existe vraiment dans la bibliothèque,
// et faisait exploser la construction de l'expression régulière.
function echappeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
}

// Clé de rapprochement de deux fiches du même auteur : titre nettoyé, sans
// préfixe, sans le nom de l'auteur, sans accents ni ponctuation.
function cleDoublon(book) {
  let t = fold(nettoieTitre(sansPrefixeAuteur(book.title))).replace(/[^a-z0-9]+/g, ' ');
  for (const mot of fold(book.author_name).replace(/[^a-z0-9]+/g, ' ').split(' ')) {
    if (mot.length > 2) t = t.replace(new RegExp('\\b' + echappeRegex(mot) + '\\b', 'g'), ' ');
  }
  return t.replace(/\s+/g, ' ').trim();
}

const ANO_MOT = "[A-ZÀ-ÝŒÆ][\\wÀ-ÿœæ'’.-]*";
const ANO_PERSONNE = new RegExp("^" + ANO_MOT + "(?:\\s+" + ANO_MOT + "){1,2}$");
// Un titre « ressemble à un nom de personne » s'il tient en deux ou trois
// mots capitalisés, sans chiffre ni chiffre romain ni mot de liaison.
function ressembleAUnNom(t) {
  const s = String(t || '').trim();
  if (!ANO_PERSONNE.test(s)) return false;
  return !/\d/.test(s) && !/\b(I{1,3}|IV|V|VI{0,3}|IX|X)\b/.test(s)
      && !/\b(de|du|des|le|la|les|un|une|et|aux?|dans|sur|pour)\b/i.test(s);
}

// Seules la virgule et la parenthèse trahissent un nom d'auteur mal découpé.
// Le trait d'union ne prouve rien : Jean-Christophe Rufin et Arturo
// Pérez-Reverte s'écrivent ainsi.
const ANO_MAL_DECOUPE = /[(,]/;

function detecteAnomalies() {
  const vus = new Set();          // une fiche n'est signalée que dans une famille
  const fam = [];
  const ajoute = (id, titre, aide, lignes, action) => {
    if (lignes.length) fam.push({ id, titre, aide, lignes, action });
  };

  // 1. Doublons probables : deux fiches du même auteur et du même livre.
  const parAuteur = new Map();
  for (const b of ALL_BOOKS) {
    if (!parAuteur.has(b.author_id)) parAuteur.set(b.author_id, []);
    parAuteur.get(b.author_id).push(b);
  }
  const doublons = [];
  for (const liste of parAuteur.values()) {
    const paquets = new Map();
    for (const b of liste) {
      const k = cleDoublon(b);
      if (!k) continue;
      if (!paquets.has(k)) paquets.set(k, []);
      paquets.get(k).push(b);
    }
    for (const groupe of paquets.values()) {
      if (groupe.length < 2) continue;
      groupe.forEach(b => vus.add(b.id));
      doublons.push({ type: 'doublon', livres: groupe });
    }
  }
  ajoute('doublons', 'Doublons probables',
    `Deux fiches du même auteur qui désignent le même livre. « Garder celle-ci » réunit les
     formats des deux sur la fiche choisie et masque l'autre — rien n'est effacé, et la fiche
     masquée empêche les prochaines synchronisations de recréer le doublon.`,
    doublons, 'fusion');

  // 2. Restes de noms de fichiers dans le titre.
  const residus = ALL_BOOKS
    .filter(b => !vus.has(b.id) && nettoieTitre(b.title) !== b.title && nettoieTitre(b.title).length > 2)
    .map(b => { vus.add(b.id); return { type: 'residu', livres: [b], propose: nettoieTitre(b.title) }; });
  ajoute('residus', 'Restes de noms de fichiers',
    `Une année entre parenthèses, une extension, un préfixe technique : ce qui reste du nom du
     fichier d'origine. Le titre proposé est modifiable avant enregistrement.`,
    residus, 'corriger');

  // 3. Auteur et titre probablement intervertis.
  // Trois signes, retenus après essais sur la bibliothèque réelle :
  //  (a) le titre est, mot pour mot, le nom d'un autre auteur du catalogue ;
  //  (b) l'auteur tient en un seul mot et le titre ressemble à un nom ;
  //  (c) le titre finit par « - <nom d'un autre auteur> », ce qui est la
  //      forme même des fichiers « Titre - Auteur.epub » mal découpés.
  // Une règle plus large signalait Gérard De Villiers ou Melissa De La Cruz
  // pour la seule raison que leur nom contient une particule : écartée.
  const auteursVus = new Set();
  const parNomAuteur = new Map();
  for (const a of AUTHORS.values()) {
    const f = fold(a.name).replace(/[^a-z0-9]+/g, ' ').trim();
    if (f.split(' ').length >= 2 && f.length >= 10) parNomAuteur.set(f, a);
  }
  const cleNom = s => fold(s).replace(/[^a-z0-9]+/g, ' ').trim();
  const inverses = [];
  for (const b of ALL_BOOKS) {
    if (vus.has(b.id)) continue;
    const direct = parNomAuteur.get(cleNom(b.title));
    const fin = String(b.title).match(/\s[-–—]\s(.+)$/);
    const suffixe = fin && parNomAuteur.get(cleNom(fin[1]));
    let cause;
    if (direct && direct.id !== b.author_id) cause = direct.name;                       // (a)
    else if (!/\s/.test(b.author_name) && ressembleAUnNom(b.title)) cause = '';         // (b)
    else if (suffixe && suffixe.id !== b.author_id) cause = suffixe.name;               // (c)
    else continue;
    vus.add(b.id);
    auteursVus.add(b.author_id);
    inverses.push({ type: 'inverse', livres: [b], vise: cause });
  }
  ajoute('inverses', 'Auteur et titre probablement intervertis',
    `Le titre ressemble à un nom de personne, et le nom de l'auteur à un titre. Déplacer un livre
     vers un autre auteur touche à la table des auteurs, réservée au rôle service_role : cela se
     corrige en SQL, pas ici. Copie la liste et transmets-la.`,
    inverses, 'copier');

  // 4. Noms d'auteurs mal découpés.
  const malDecoupes = Array.from(AUTHORS.values())
    .filter(a => ANO_MAL_DECOUPE.test(a.name))
    .map(a => ({ type: 'auteur', auteur: a, livres: a.books.slice(0, 3) }));
  ajoute('auteurs', 'Noms d\'auteurs mal découpés',
    `Une virgule ou une parenthèse dans un nom d'auteur : presque toujours un livre écrit à quatre
     mains dont les deux noms se sont mélangés. Même remarque — cela se corrige en SQL.`,
    malDecoupes, 'copier');

  // 5. Détails de présentation.
  const presentation = ALL_BOOKS
    .filter(b => !vus.has(b.id) &&
                 (/^[a-zà-ÿœ]/.test(b.title) || (b.title.length > 6 && b.title === b.title.toUpperCase())))
    .map(b => {
      vus.add(b.id);
      const p = /^[a-zà-ÿœ]/.test(b.title)
        ? b.title.charAt(0).toUpperCase() + b.title.slice(1)
        : b.title.charAt(0) + b.title.slice(1).toLowerCase();
      return { type: 'residu', livres: [b], propose: p };
    });
  ajoute('presentation', 'Détails de présentation',
    `Une minuscule au début, ou un titre tout en capitales. Rien de grave : à corriger si l'envie
     t'en prend, à laisser sinon — certains titres sont vraiment écrits en capitales.`,
    presentation, 'corriger');

  // 6. Auteurs réduits à leur nom de famille.
  const mononymes = Array.from(AUTHORS.values())
    .filter(a => !auteursVus.has(a.id) && !/\s/.test(a.name) && !ANO_MAL_DECOUPE.test(a.name))
    .map(a => ({ type: 'auteur', auteur: a, livres: a.books.slice(0, 3) }));
  ajoute('mononymes', 'Auteurs sans prénom',
    `Un seul mot en guise de nom. Souvent légitime — Ayerdhal, Collectif — parfois le signe d'un
     nom de fichier coupé trop tôt. À parcourir des yeux, rien de plus.`,
    mononymes, 'copier');

  return fam;
}

// Réunit deux fiches : « garde » hérite des formats, de la couverture et de
// la série de l'autre, qui est ensuite masquée. Deux UPDATE sur books, donc
// rien de neuf côté droits.
async function fusionnerFiches(garde, absorbe) {
  const payload = {
    has_ebook: !!(garde.has_ebook || absorbe.has_ebook),
    has_pdf:   !!(garde.has_pdf   || absorbe.has_pdf),
    has_audio: !!(garde.has_audio || absorbe.has_audio),
  };
  if (!garde.cover_path && absorbe.cover_path) payload.cover_path = absorbe.cover_path;
  if (SERIES_READY && !garde.series && absorbe.series) {
    payload.series = absorbe.series;
    payload.series_index = absorbe.series_index;
  }
  const note = [garde.source_note, absorbe.source_note].filter(Boolean).join(' || ');
  if (note && note !== garde.source_note) payload.source_note = note;

  let { error } = await sb.from('books').update(payload).eq('id', garde.id);
  if (error) return false;
  ({ error } = await sb.from('books').update({ is_hidden: true }).eq('id', absorbe.id));
  if (error) return false;

  Object.assign(garde, payload);
  absorbe.is_hidden = true;
  ALL_BOOKS = ALL_BOOKS.filter(b => b.id !== absorbe.id);
  HIDDEN_BOOKS.push(absorbe);
  rebuildAuthors();
  return true;
}

// Enregistre un titre corrigé depuis l'écran des anomalies. Comme ailleurs,
// l'orthographe du disque est figée dans source_title à la première
// correction, pour que la prochaine synchronisation ne la rétablisse pas.
async function corrigeTitre(book, next) {
  if (!next || next === book.title) return 'inchangé';
  const clash = ALL_BOOKS.concat(HIDDEN_BOOKS).find(
    b => b.author_id === book.author_id && b.id !== book.id && b.title === next);
  if (clash) return 'doublon';
  const payload = { title: next };
  if (!book.source_title) payload.source_title = book.title;
  const { error } = await sb.from('books').update(payload).eq('id', book.id);
  if (error) return 'erreur';
  if (!book.source_title) book.source_title = book.title;
  book.title = next;
  book.search = fold(`${book.title} ${book.author_name} ${book.source_title || ''}`);
  return 'ok';
}

// ---------------------------------------------------------------
// Réglages
// ---------------------------------------------------------------
function renderSettings() {
  const cur = prefGet('theme');
  const mode = prefGet('mode');
  const n = ALL_BOOKS.length || 1;
  const read = ALL_BOOKS.filter(b => b.is_read).length;
  const listened = ALL_BOOKS.filter(b => b.is_listened).length;
  const fav = ALL_BOOKS.filter(b => b.is_favorite).length;
  const done = ALL_BOOKS.filter(b => b.is_read || b.is_listened).length;

  el.app.innerHTML = `
    <div class="settings">
      <a class="back-link" href="#/">← Retour à la bibliothèque</a>
      <h1>Réglages</h1>
      <p class="lede">Dix habillages pour la même bibliothèque. Le choix est enregistré sur cet appareil :
        ton téléphone et ton PC peuvent avoir deux ambiances différentes.</p>

      <div class="set-block">
        <div class="section-title">Clair ou sombre <span class="rule"></span></div>
        <div class="segmented" id="mode-seg">
          <button data-mode="auto" class="${mode==='auto'?'on':''}">Automatique</button>
          <button data-mode="light" class="${mode==='light'?'on':''}">Clair</button>
          <button data-mode="dark" class="${mode==='dark'?'on':''}">Sombre</button>
        </div>
        <p class="lede" style="margin:0.8rem 0 0; font-size:0.8rem;">
          « Automatique » suit le réglage de ton téléphone ou de ton PC. Chacun des dix thèmes
          existe dans les deux ambiances.</p>
      </div>

      <div class="set-block">
        <div class="section-title">Thème <span class="rule"></span></div>
        <div class="theme-grid" id="theme-grid">
          ${THEMES.map(t => themeCard(t, t.id === cur)).join('')}
        </div>
      </div>

      <div class="set-block">
        <div class="section-title">Page d'accueil <span class="rule"></span></div>
        <div class="segmented" id="rail-seg">
          <button data-rail="on" class="${prefGet('rail')==='on'?'on':''}">Avec « Derniers ajouts »</button>
          <button data-rail="off" class="${prefGet('rail')==='off'?'on':''}">Sans</button>
        </div>
      </div>

      <div class="set-block">
        <div class="section-title">Mode propriétaire <span class="rule"></span></div>
        ${renderOwnerBlock()}
      </div>

      ${OWNER ? `<div class="set-block">
        <div class="section-title">Où j'en suis <span class="rule"></span></div>
        <div class="stats">
          <div class="stat"><div class="n">${ALL_BOOKS.length}</div><div class="l">livres</div></div>
          <div class="stat"><div class="n">${AUTHORS.size}</div><div class="l">auteurs</div></div>
          <div class="stat"><div class="n">${read}</div><div class="l">lus</div></div>
          <div class="stat"><div class="n">${listened}</div><div class="l">écoutés</div></div>
          <div class="stat"><div class="n">${fav}</div><div class="l">favoris</div></div>
        </div>
        <div class="bar" title="${done} livres sur ${ALL_BOOKS.length}"><i style="width:${(done/n*100).toFixed(1)}%"></i></div>
        <p class="lede" style="margin:0.6rem 0 0; font-size:0.8rem;">
          ${done} livre${done>1?'s':''} lu${done>1?'s':''} ou écouté${done>1?'s':''}, soit ${(done/n*100).toFixed(1)} % de la bibliothèque.</p>
      </div>` : ''}

      ${(EDITABLE && OWNER) ? `<div class="set-block">
        <div class="section-title">Anomalies <span class="rule"></span></div>
        ${renderAnomaliesBlock()}
      </div>` : ''}

      ${(EDITABLE && OWNER) ? `<div class="set-block">
        <div class="section-title">Livres masqués <span class="rule"></span></div>
        ${renderHiddenBlock()}
      </div>` : ''}

      ${OWNER ? `<div class="set-block">
        <div class="section-title">Outil d'administration <span class="rule"></span></div>
        <p class="lede" style="margin:0 0 0.8rem; font-size:0.85rem;">
          Pour ajouter des livres, des auteurs ou des couvertures directement dans la base Supabase.
          Détail de son fonctionnement dans la rubrique Aide ci-dessous.</p>
        <a class="btn-main" href="supabase_import_tool.html" target="_blank" rel="noopener">Ouvrir l'outil d'import Supabase ↗</a>
      </div>` : ''}

      ${OWNER ? `<div class="set-block">
        <div class="section-title">Aide <span class="rule"></span></div>
        ${renderAideProprietaire()}
      </div>` : ''}
    </div>`;

  el.app.querySelectorAll('#theme-grid .theme-card').forEach(card => {
    card.addEventListener('click', () => {
      prefSet('theme', card.dataset.theme);
      applyTheme();
      renderSettings();   // on redessine pour que les vignettes suivent le nouveau thème
    });
  });
  el.app.querySelectorAll('#mode-seg button').forEach(b => {
    b.addEventListener('click', () => { prefSet('mode', b.dataset.mode); applyTheme(); renderSettings(); });
  });
  el.app.querySelectorAll('#rail-seg button').forEach(b => {
    b.addEventListener('click', () => { prefSet('rail', b.dataset.rail); renderSettings(); });
  });
  wireOwnerBlock();
  wireAnomalies();
  wireAide();
  el.app.querySelectorAll('.hidden-row button').forEach(b => {
    b.addEventListener('click', () => {
      const book = HIDDEN_BOOKS.find(x => x.id === b.dataset.id);
      if (book) restoreBook(book);
    });
  });
}

function renderOwnerBlock() {
  if (OWNER) {
    return `
      <p class="lede" style="margin:0 0 1rem; font-size:0.85rem;">
        Mode propriétaire actif sur cet appareil : tu peux corriger un titre, masquer une fiche
        et cocher les statuts. Tes visiteurs, eux, ne voient que la bibliothèque.</p>
      <button type="button" class="linkish" id="owner-off">Quitter le mode propriétaire</button>`;
  }
  if (!OWNER_CONFIGURED) {
    return `
      <p class="lede" style="margin:0 0 1rem; font-size:0.85rem;">
        Pas encore configuré. Tant qu'aucun code n'est défini, <strong>personne</strong> ne peut
        modifier la bibliothèque depuis l'application — toi non plus. Choisis un code ci-dessous :
        l'empreinte à recopier dans <code>js/config.js</code> s'affichera, et ton code lui-même
        ne sera écrit nulle part.</p>
      <div class="inline-form">
        <label for="owner-new">Code de ton choix</label>
        <input type="password" id="owner-new" autocomplete="new-password">
        <div class="row"><button type="button" class="btn-main" id="owner-gen">Générer l'empreinte</button></div>
        <p class="form-error" id="owner-msg" hidden></p>
        <pre class="snippet" id="owner-out" hidden></pre>
      </div>`;
  }
  return `
    <p class="lede" style="margin:0 0 1rem; font-size:0.85rem;">
      Saisis ton code pour activer les commandes de correction et de masquage sur cet appareil.
      Il reste actif jusqu'à ce que tu en sortes.</p>
    <div class="inline-form">
      <label for="owner-code">Code</label>
      <input type="password" id="owner-code" autocomplete="current-password">
      <div class="row"><button type="button" class="btn-main" id="owner-ok">Déverrouiller</button></div>
      <p class="form-error" id="owner-msg" hidden></p>
    </div>
    <p class="hint-sm" style="max-width:52ch;">
      Ce code est un garde-fou contre les fausses manœuvres de tes visiteurs, pas une sécurité :
      l'application étant publique, quelqu'un de déterminé pourrait toujours écrire dans la base.</p>`;
}

function wireOwnerBlock() {
  const msg = document.getElementById('owner-msg');
  const off = document.getElementById('owner-off');
  if (off) off.addEventListener('click', () => { setOwner(false); renderSettings(); });

  const gen = document.getElementById('owner-gen');
  if (gen) gen.addEventListener('click', async () => {
    const code = document.getElementById('owner-new').value;
    if (code.length < 4) { showFormError(msg, 'Choisis un code d\'au moins 4 caractères.'); return; }
    const h = await hashCode(code);
    if (!h) { showFormError(msg, "Le calcul de l'empreinte n'est possible que sur le site publié (https), pas en ouvrant le fichier en local."); return; }
    msg.hidden = true;
    const out = document.getElementById('owner-out');
    out.textContent = `ownerHash: "${h}",`;
    out.hidden = false;
  });

  const ok = document.getElementById('owner-ok');
  if (ok) {
    const tryCode = async () => {
      const h = await hashCode(document.getElementById('owner-code').value);
      if (!h) { showFormError(msg, "Vérification impossible ici : l'application doit être ouverte depuis son adresse https."); return; }
      if (h !== cfg.ownerHash) { showFormError(msg, 'Code incorrect.'); return; }
      setOwner(true);
      renderSettings();
    };
    ok.addEventListener('click', tryCode);
    document.getElementById('owner-code').addEventListener('keydown', e => { if (e.key === 'Enter') tryCode(); });
  }
}

// Familles dépliées : conservées entre deux rendus, sinon le panneau se
// referme à chaque correction.
const ANO_OUVERTES = new Set();

function renderAnomaliesBlock() {
  const familles = detecteAnomalies();
  const total = familles.reduce((n, f) => n + f.lignes.length, 0);
  if (!total) {
    return `<p class="lede" style="margin:0; font-size:0.85rem;">
      Rien à signaler : aucun doublon probable, aucun reste de nom de fichier, aucun nom
      d'auteur suspect. Cet écran se recalcule à chaque ouverture des réglages.</p>`;
  }
  const fmt = b => [b.has_ebook && 'EBOOK', b.has_pdf && 'PDF', b.has_audio && 'AUDIO']
    .filter(Boolean).map(x => `<span class="badge">${x}</span>`).join('');

  const ligne = (l, action, i) => {
    if (action === 'fusion') {
      return `<div class="ano-row">
        <div class="ano-who"><span class="a">${escapeHtml(l.livres[0].author_name)}</span></div>
        <div class="ano-opts">
          ${l.livres.map(b => `
            <div class="ano-opt">
              <div class="ano-t">${escapeHtml(b.title)}</div>
              <div class="badges">${fmt(b)}</div>
              <button type="button" class="btn-mini" data-fusion="${b.id}"
                data-autres="${l.livres.filter(x => x.id !== b.id).map(x => x.id).join(',')}">Garder celle-ci</button>
            </div>`).join('')}
        </div>
        <p class="ano-msg" hidden></p>
      </div>`;
    }
    if (action === 'corriger') {
      const b = l.livres[0];
      return `<div class="ano-row">
        <div class="ano-who">
          <span class="t">${escapeHtml(b.title)}</span>
          <span class="a">${escapeHtml(b.author_name)}</span>
        </div>
        <div class="ano-fix">
          <label class="sr-only" for="ano-i-${b.id}">Titre corrigé</label>
          <input type="text" id="ano-i-${b.id}" value="${escapeHtml(l.propose)}">
          <button type="button" class="btn-mini" data-fix="${b.id}">Enregistrer</button>
        </div>
        <p class="ano-msg" hidden></p>
      </div>`;
    }
    const a = l.auteur;
    const sous = a ? a.books.map(b => b.title).slice(0, 3).join(' · ')
                   : l.livres[0].author_name + (l.vise ? ` — vise probablement ${l.vise}` : '');
    return `<div class="ano-row">
      <div class="ano-who">
        <span class="t">${escapeHtml(a ? a.name : l.livres[0].title)}</span>
        <span class="a">${escapeHtml(sous)}</span>
      </div>
    </div>`;
  };

  return `
    <p class="lede" style="margin:0 0 1.2rem; font-size:0.85rem;">
      ${total} point${total > 1 ? 's' : ''} à regarder, répartis en ${familles.length} familles.
      Tout est calculé à partir des livres déjà chargés : rien n'est envoyé nulle part, et rien
      ne change tant que tu ne cliques pas.</p>
    ${familles.map(f => `
      <div class="ano-fam">
        <button type="button" class="ano-head" data-fam="${f.id}"
                aria-expanded="${ANO_OUVERTES.has(f.id) ? 'true' : 'false'}">
          <span class="t">${escapeHtml(f.titre)}</span>
          <span class="n">${f.lignes.length}</span>
        </button>
        <div class="ano-body" ${ANO_OUVERTES.has(f.id) ? '' : 'hidden'}>
          <p class="hint-sm" style="margin:0 0 0.9rem;">${f.aide}</p>
          ${f.lignes.map((l, i) => ligne(l, f.action, i)).join('')}
          ${f.action === 'copier'
            ? `<button type="button" class="linkish" data-copie="${f.id}">Copier la liste</button>` : ''}
        </div>
      </div>`).join('')}`;
}

function wireAnomalies() {
  const familles = detecteAnomalies();
  const parId = new Map(familles.map(f => [f.id, f]));

  el.app.querySelectorAll('.ano-head').forEach(h => {
    h.addEventListener('click', () => {
      const id = h.dataset.fam;
      const corps = h.nextElementSibling;
      const ouvert = h.getAttribute('aria-expanded') === 'true';
      h.setAttribute('aria-expanded', ouvert ? 'false' : 'true');
      corps.hidden = ouvert;
      if (ouvert) ANO_OUVERTES.delete(id); else ANO_OUVERTES.add(id);
    });
  });

  el.app.querySelectorAll('[data-copie]').forEach(b => {
    b.addEventListener('click', async () => {
      const f = parId.get(b.dataset.copie);
      if (!f) return;
      const txt = f.lignes.map(l => l.auteur
        ? `${l.auteur.name} — ${l.auteur.books.map(x => x.title).join(' | ')}`
        : `${l.livres[0].author_name} — ${l.livres[0].title}`).join('\n');
      try { await navigator.clipboard.writeText(txt); b.textContent = 'Liste copiée'; }
      catch (e) { b.textContent = 'Copie impossible sur cet appareil'; }
    });
  });

  el.app.querySelectorAll('[data-fix]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const book = ALL_BOOKS.find(b => b.id === btn.dataset.fix);
      const champ = document.getElementById('ano-i-' + btn.dataset.fix);
      const msg = btn.closest('.ano-row').querySelector('.ano-msg');
      if (!book || !champ) return;
      btn.disabled = true;
      const r = await corrigeTitre(book, champ.value.trim());
      if (r === 'ok') { renderSettings(); return; }
      btn.disabled = false;
      msg.hidden = false;
      msg.textContent = r === 'doublon'
        ? `${book.author_name} a déjà un livre portant ce titre : ces deux fiches sont sans doute le même livre.`
        : r === 'inchangé' ? 'Le titre est déjà celui-là.'
        : "L'enregistrement a échoué. Vérifie ta connexion et réessaie.";
    });
  });

  el.app.querySelectorAll('[data-fusion]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const garde = ALL_BOOKS.find(b => b.id === btn.dataset.fusion);
      const autres = btn.dataset.autres.split(',').map(id => ALL_BOOKS.find(b => b.id === id)).filter(Boolean);
      const msg = btn.closest('.ano-row').querySelector('.ano-msg');
      if (!garde || !autres.length) return;
      btn.disabled = true;
      for (const a of autres) {
        if (!(await fusionnerFiches(garde, a))) {
          btn.disabled = false;
          msg.hidden = false;
          msg.textContent = "La fusion a échoué. Vérifie ta connexion et réessaie.";
          return;
        }
      }
      renderSettings();
    });
  });
}

function renderHiddenBlock() {
  if (!HIDDEN_BOOKS.length) {
    return `<p class="lede" style="margin:0; font-size:0.85rem;">
      Aucun livre masqué. Masquer une fiche depuis sa page retire le livre de la bibliothèque
      sans l'effacer : la ligne reste en base pour empêcher les prochaines synchronisations
      de la recréer.</p>`;
  }
  const list = HIDDEN_BOOKS.slice()
    .sort((a, b) => a.author_name_sort.localeCompare(b.author_name_sort, 'fr') || a.title.localeCompare(b.title, 'fr'));
  return `
    <p class="lede" style="margin:0 0 1rem; font-size:0.85rem;">
      ${list.length} fiche${list.length > 1 ? 's' : ''} masquée${list.length > 1 ? 's' : ''}.
      Elles restent en base pour bloquer toute réinsertion ; tu peux les remettre à tout moment.</p>
    <div class="hidden-list">
      ${list.map(b => `
        <div class="hidden-row">
          <div class="who">
            <span class="t">${escapeHtml(b.title)}</span>
            <span class="a">${escapeHtml(b.author_name)}</span>
          </div>
          <button type="button" class="linkish" data-id="${b.id}">Restaurer</button>
        </div>`).join('')}
    </div>`;
}

// ---------------------------------------------------------------
// Aide — mode d'emploi propriétaire
//
// Réservée à OWNER (pas EDITABLE : même si la base manque d'une colonne,
// Christophe doit pouvoir relire comment les choses fonctionnent). Le
// contenu reprend, en plus court, le PDF remis à part ; les deux sont tenus
// à jour ensemble.
// ---------------------------------------------------------------
const AIDE_OUVERTES = new Set();

const AIDE_FAMILLES = [
  { nom: 'Doublons probables', repere: 'deux fiches du même auteur pour le même livre (souvent ebook + audio importés séparément)',
    action: '« Garder celle-ci » : la fiche choisie hérite des formats de l\'autre, qui est masquée.' },
  { nom: 'Restes de noms de fichiers', repere: 'une année entre parenthèses, une extension, un préfixe technique resté dans le titre',
    action: 'Titre nettoyé proposé, modifiable avant d\'Enregistrer.' },
  { nom: 'Détails de présentation', repere: 'une minuscule au début du titre, ou un titre tout en capitales',
    action: 'Pareil — à corriger si l\'envie t\'en prend, à laisser sinon.' },
  { nom: 'Auteur et titre probablement intervertis', repere: 'le titre ressemble à un nom d\'auteur du catalogue, et inversement',
    action: 'Copier la liste, à transmettre.' },
  { nom: 'Noms d\'auteurs mal découpés', repere: 'une virgule ou une parenthèse dans un nom d\'auteur — presque toujours deux auteurs mélangés',
    action: 'Pareil — Copier la liste, à transmettre.' },
  { nom: 'Auteurs sans prénom', repere: 'un seul mot en guise de nom (parfois légitime : Ayerdhal, Collectif)',
    action: 'À parcourir des yeux, rien de plus.' },
];

const AIDE_SECTIONS = [
  {
    id: 'activer',
    titre: 'Activer le mode propriétaire',
    corps: `
      <p class="hint-sm" style="margin:0 0 0.8rem;">
        Dans <strong>Réglages</strong> (cette page), la rubrique « Mode propriétaire » plus haut
        demande ton code. Une fois déverrouillé, il reste actif sur cet appareil jusqu'à ce que tu
        cliques sur « Quitter le mode propriétaire » — y compris si tu fermes l'onglet ou éteins
        l'appareil. Chaque appareil mémorise son propre état.</p>
      <p class="hint-sm" style="margin:0;">
        Ce code est un garde-fou contre une fausse manœuvre d'un visiteur, pas un coffre-fort :
        l'application étant publique, quelqu'un de déterminé pourrait toujours écrire dans la base
        sans passer par elle.</p>`,
  },
  {
    id: 'fiche',
    titre: "Sur la fiche d'un livre",
    corps: `
      <p class="hint-sm" style="margin:0 0 0.8rem;">
        Trois cases cliquables sous le titre — Lu sur liseuse, Écouté en audio, Favori — qui
        s'enregistrent tout de suite, sans valider. Ces cases, le filtre « Statut » et les
        badges correspondants n'apparaissent qu'en mode propriétaire : un visiteur ne peut
        jamais voir ce que tu as lu, écouté ou mis en favori.</p>
      <p class="hint-sm" style="margin:0 0 0.8rem;">
        <strong>Corriger le titre</strong> : le nouveau texte devient le titre affiché ;
        l'orthographe du fichier d'origine reste conservée en coulisses, pour que la prochaine
        synchronisation retrouve ce livre et ne le recrée pas en double. Si l'auteur a déjà un
        livre portant ce titre, c'est signalé au lieu d'être enregistré — masque plutôt la fiche
        en trop.</p>
      <p class="hint-sm" style="margin:0;">
        <strong>Masquer ce livre</strong> : la fiche disparaît de la bibliothèque sans être
        effacée de la base, ce qui empêche toute recréation par une synchronisation future. Elle
        se restaure à tout moment (section suivante).</p>`,
  },
  {
    id: 'masques',
    titre: 'Les livres masqués',
    corps: `
      <p class="hint-sm" style="margin:0;">
        Juste au-dessus : la liste de tout ce qui a été masqué, avec un bouton Restaurer sur
        chaque ligne. Rien ne se perd jamais.</p>`,
  },
  {
    id: 'anomalies',
    titre: "L'écran des anomalies",
    corps: `
      <p class="hint-sm" style="margin:0 0 0.8rem;">
        Six familles, recalculées à chaque ouverture de cette page, à partir des livres déjà
        chargés — rien n'est envoyé nulle part tant qu'aucun bouton n'est cliqué.</p>
      ${AIDE_FAMILLES.map(f => `
        <p class="hint-sm" style="margin:0 0 0.6rem;">
          <strong>${escapeHtml(f.nom)}</strong> — ${escapeHtml(f.repere)}<br>
          <em>${escapeHtml(f.action)}</em></p>`).join('')}
      <p class="hint-sm" style="margin:0.4rem 0 0;">
        Les trois premières s'enregistrent directement ici. Les trois dernières touchent à la
        liste des auteurs elle-même, réservée au rôle technique « service_role » : Copier la
        liste, puis la transmettre pour qu'un script soit préparé.</p>`,
  },
  {
    id: 'stats',
    titre: "Où j'en suis",
    corps: `
      <p class="hint-sm" style="margin:0;">
        Un peu plus haut dans ces réglages : nombre de livres, d'auteurs, de lectures et d'écoutes
        terminées, de favoris — pour suivre l'avancement, sans rien à cliquer.</p>`,
  },
  {
    id: 'alimenter',
    titre: 'Alimenter la base : ajouter de nouveaux livres',
    corps: `
      <p class="hint-sm" style="margin:0 0 0.8rem;">
        L'application elle-même ne sait qu'afficher et corriger ce qui existe déjà : ajouter des
        livres se fait à part, avec un deuxième outil, en dehors de l'application. Le principe en
        trois temps :</p>
      <p class="hint-sm" style="margin:0 0 0.5rem;">
        <strong>1.</strong> Les fichiers (epub, mp3…) arrivent dans les dossiers habituels
        (Mes Ebooks, Mes livres audio).</p>
      <p class="hint-sm" style="margin:0 0 0.5rem;">
        <strong>2.</strong> Il faut comparer ce qui est nouveau à ce qui est déjà en base, pour ne
        rien importer en double et retrouver, pour chaque livre, s'il faut créer une fiche ou juste
        activer un format sur une fiche existante — typiquement la version audio d'un livre déjà
        présent en ebook. C'est l'étape où passer par Claude fait gagner du temps : repérer les
        nouveautés, résoudre les cas particuliers (traductions, pseudonymes, noms mal
        orthographiés) et préparer les fichiers JSON prêts à l'emploi.</p>
      <p class="hint-sm" style="margin:0 0 0.8rem;">
        <strong>3.</strong> Ces fichiers JSON se collent ensuite dans l'outil d'import Supabase
        (section suivante) — la seule étape qui écrit réellement dans la base, et qui se fait sur
        cet ordinateur, sans Claude.</p>
      <p class="hint-sm" style="margin:0;">
        Rien n'empêche d'écrire ce JSON à la main : le format exact de chaque bloc est rappelé
        directement dans l'outil. Mais la comparaison avec l'existant est le plus souvent plus
        rapide à faire avec Claude.</p>`,
  },
  {
    id: 'outil',
    titre: "L'outil d'import Supabase",
    corps: `
      <p class="hint-sm" style="margin:0 0 0.8rem;">
        <code>supabase_import_tool.html</code> : un outil autonome, accessible par le bouton
        « Ouvrir l'outil d'import Supabase » un peu plus haut dans ces réglages (visible seulement
        en mode propriétaire). Il reste aussi ouvrable directement depuis le fichier conservé dans
        le dossier « Claude outputs », par un double-clic. Dans les deux cas il tourne entièrement
        dans le navigateur et ne parle qu'au projet Supabase — jamais à Claude.</p>
      <p class="hint-sm" style="margin:0 0 0.8rem;">
        Avant toute chose, l'outil demande la clé <code>service_role</code> — à distinguer de la
        clé <code>anon</code> qu'utilise l'application : <code>service_role</code> donne un accès
        total à la base, sans restriction. Elle se retrouve dans Supabase Studio → Project
        Settings → API → service_role (secret). Claude ne la détient pas et ne doit jamais la
        détenir. Dans l'outil, elle reste uniquement en mémoire de la page tant qu'elle est
        ouverte.</p>
      <p class="hint-sm" style="margin:0 0 0.4rem;"><strong>1. Connexion</strong> — URL du projet
        (pré-remplie) et clé service_role, puis « Tester la connexion ».</p>
      <p class="hint-sm" style="margin:0 0 0.4rem;"><strong>2. Importer des auteurs</strong> —
        un tableau JSON <code>[{"name": "...", "name_sort": "..."}]</code>. Un auteur déjà présent
        (même nom) est fusionné, jamais dupliqué.</p>
      <p class="hint-sm" style="margin:0 0 0.4rem;"><strong>3. Importer des livres</strong> —
        l'auteur doit déjà exister (étape 2 d'abord). Un livre déjà présent (même auteur + même
        titre) est ignoré sans erreur : relancer un import ne crée jamais de doublon. Un
        <code>cover_i</code> Open Library fourni déclenche le téléversement automatique de la
        couverture.</p>
      <p class="hint-sm" style="margin:0 0 0.4rem;"><strong>4. Couvertures seules</strong> —
        ajouter ou remplacer une couverture sur un livre déjà en base, à partir d'un
        <code>cover_i</code>.</p>
      <p class="hint-sm" style="margin:0 0 0.4rem;"><strong>5. Recherche automatique des
        couvertures manquantes</strong> — une vignette proposée pour chaque livre sans couverture,
        avec un niveau de confiance (fiable / probable / incertain) ; rien n'est envoyé tant que
        rien n'est coché puis validé par « Téléverser la sélection ».</p>
      <p class="hint-sm" style="margin:0 0 0.4rem;"><strong>6. Ajouter une couverture trouvée
        ailleurs</strong> — pour les livres qu'Open Library ne connaît pas :
        (1) trouver l'image ailleurs (Fnac, Amazon, Babelio…) et l'enregistrer sur l'ordinateur ;
        (2) saisir l'auteur et le titre exactement comme dans l'application ;
        (3) choisir le fichier image et « Téléverser cette couverture » ;
        (4) elle apparaît dans l'application au prochain chargement, rien à redéployer. Pour une
        bibliothèque strictement personnelle, pas pour republier l'image ailleurs.</p>
      <p class="hint-sm" style="margin:0 0 0.4rem;"><strong>7. Mettre à jour des livres
        existants</strong> — changer un ou plusieurs champs sans toucher au reste, par exemple
        activer <code>has_audio</code> : <code>[{"author_name": "...", "title": "...",
        "fields": {"has_audio": true}}]</code>.</p>
      <p class="hint-sm" style="margin:0 0 0.4rem;"><strong>8. Requête personnalisée (avancé)</strong> —
        pour parler directement à l'API Supabase avec les pleins pouvoirs de service_role : c'est
        par ce chemin qu'un auteur peut par exemple être renommé, ce que l'écran des anomalies se
        contente de signaler. Utilisable directement si l'idée est confortable ; sinon, transmettre
        à Claude ce que l'écran des anomalies a copié, pour recevoir la commande exacte ou un
        script équivalent pour Supabase Studio.</p>
      <p class="hint-sm" style="margin:0;"><strong>9. Importer un lot de couvertures</strong> —
        pour déposer plusieurs images d'un coup plutôt qu'une par une avec l'étape 6 : chaque
        fichier doit être nommé avec l'identifiant du livre (<code>&lt;id&gt;.jpg</code>), que
        l'outil reconnaît et associe automatiquement à la bonne fiche.</p>`,
  },
  {
    id: 'limites',
    titre: 'Ce qui reste utile de transmettre à Claude',
    corps: `
      <p class="hint-sm" style="margin:0;">
        Au quotidien : statuts, corrections de titre, masquage et couvertures se font sans Claude,
        depuis l'application ou l'outil. Ce qui reste plus sûr à vérifier ensemble : l'arrivée d'un
        gros lot de nouveaux fichiers (éviter les doublons demande de comparer au disque), et les
        cas ambigus que l'écran des anomalies se contente de signaler sans les corriger. Un nom
        collé depuis cet écran suffit pour que Claude s'en occupe.</p>`,
  },
];

function renderAideProprietaire() {
  return `
    <p class="lede" style="margin:0 0 1.2rem; font-size:0.85rem;">
      Ce que permet le mode propriétaire, et où s'arrête ce que l'application sait faire seule.
      La version complète existe aussi en PDF, remise à part.</p>
    ${AIDE_SECTIONS.map(s => `
      <div class="aide-fam">
        <button type="button" class="aide-head" data-aide="${s.id}"
                aria-expanded="${AIDE_OUVERTES.has(s.id) ? 'true' : 'false'}">
          <span class="t">${escapeHtml(s.titre)}</span>
        </button>
        <div class="aide-body" ${AIDE_OUVERTES.has(s.id) ? '' : 'hidden'}>${s.corps}</div>
      </div>`).join('')}`;
}

function wireAide() {
  el.app.querySelectorAll('.aide-head').forEach(h => {
    h.addEventListener('click', () => {
      const id = h.dataset.aide;
      const corps = h.nextElementSibling;
      const ouvert = h.getAttribute('aria-expanded') === 'true';
      h.setAttribute('aria-expanded', ouvert ? 'false' : 'true');
      corps.hidden = ouvert;
      if (ouvert) AIDE_OUVERTES.delete(id); else AIDE_OUVERTES.add(id);
    });
  });
}

// Vignette d'un thème : une interface miniature peinte avec les couleurs
// de ce thème, pour juger sans avoir à l'appliquer.
function themeCard(t, on) {
  return `
    <button class="theme-card ${on?'on':''}" data-theme="${t.id}"
            aria-pressed="${on}" title="Appliquer le thème ${escapeHtml(t.label)}">
      <span class="tick">✓</span>
      <div class="tp" data-preview="${t.id}">
        <div class="tp-bar">
          <span class="tp-brand">Ma Bibliothèque</span>
          <span class="tp-pill"></span>
        </div>
        <div class="tp-row">
          <span class="tp-cover"></span>
          <span class="tp-lines">
            <span class="tp-l" style="width:85%"></span>
            <span class="tp-l" style="width:55%"></span>
            <span class="tp-chips"><span class="tp-chip"></span><span class="tp-chip"></span></span>
          </span>
        </div>
      </div>
      <div class="tp-meta">
        <div class="tp-name">${escapeHtml(t.label)}</div>
        <div class="tp-desc">${escapeHtml(t.desc)}</div>
      </div>
    </button>`;
}

// ---------------------------------------------------------------
// Visionneuse de couverture
// ---------------------------------------------------------------
function openLightbox(url, alt) {
  el.lightboxImg.src = url;
  el.lightboxImg.alt = alt || '';
  el.lightbox.classList.remove('hidden');
}
function closeLightbox() {
  el.lightbox.classList.add('hidden');
  el.lightboxImg.src = '';
}
el.lightboxClose.addEventListener('click', closeLightbox);
el.lightbox.addEventListener('click', e => { if (e.target === el.lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// Au clavier, ← et → font la même chose que les flèches de la page auteur.
// On s'abstient dès qu'on est en train de taper, sinon on ne pourrait plus
// déplacer le curseur dans la zone de recherche.
document.addEventListener('keydown', e => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
  const actif = document.activeElement;
  if (actif && (/^(INPUT|SELECT|TEXTAREA)$/.test(actif.tagName) || actif.isContentEditable)) return;
  if (el.lightbox && !el.lightbox.classList.contains('hidden')) return;
  const m = (location.hash || '').match(/^#\/author\/(.+)$/);
  if (!m) return;
  const i = AUTHOR_ORDER.indexOf(m[1]);
  if (i < 0) return;
  const cible = AUTHOR_ORDER[e.key === 'ArrowLeft' ? i - 1 : i + 1];
  if (!cible) return;
  e.preventDefault();
  location.hash = `#/author/${cible}`;
});

// ---------------------------------------------------------------
// Routage
// ---------------------------------------------------------------
let lastHash = null;

function route() {
  if (!LOADED) return;
  // on mémorise où on en était sur la page qu'on quitte
  if (lastHash !== null) scrollMemory.set(lastHash, window.scrollY);

  const hash = location.hash || '#/';
  const authorMatch = hash.match(/^#\/author\/(.+)$/);
  const bookMatch = hash.match(/^#\/book\/(.+)$/);

  if (hash === '#/settings') renderSettings();
  else if (authorMatch) renderAuthor(authorMatch[1]);
  else if (bookMatch) renderBook(bookMatch[1]);
  else renderHome();

  // et on y revient si on avait déjà visité cette page
  const back = scrollMemory.get(hash);
  window.scrollTo(0, back || 0);
  lastHash = hash;
}

window.addEventListener('hashchange', route);

[el.search, el.filterFormat, el.filterGenre, el.filterStatus].forEach(input => {
  input.addEventListener('input', () => {
    scrollMemory.delete('#/');            // nouvelle recherche = on repart du haut
    if (location.hash !== '#/' && location.hash !== '') location.hash = '#/';
    else renderHome();
  });
});

// Croix pour vider la recherche d'un tap/clic, sur tous les appareils (la croix native
// de Safari iOS a été désactivée en CSS car elle causait l'affichage disproportionné).
// Protégé par une vérification d'existence : certaines pages de test minimales n'ont pas
// ce bouton, et il ne doit pas empêcher le reste du script de s'exécuter.
if (el.searchClear) {
  function syncSearchClearVisibility(){
    el.searchClear.hidden = el.search.value.length === 0;
  }
  el.search.addEventListener('input', syncSearchClearVisibility);
  el.searchClear.addEventListener('click', () => {
    el.search.value = '';
    el.search.dispatchEvent(new Event('input', { bubbles: true }));
    el.search.focus();
  });
  syncSearchClearVisibility();
}

el.menuToggle.addEventListener('click', () => el.controls.classList.toggle('open'));
el.settingsBtn.addEventListener('click', () => { location.hash = '#/settings'; });

// ---------------------------------------------------------------
// Démarrage
// ---------------------------------------------------------------
syncStatusFilterVisibility();

(async function init() {
  const ok = await loadLibrary();
  if (ok) route();
})();
