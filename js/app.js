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
// Style de l'interface (Réglages → Style) : chaque aspect se choisit séparément, et se
// mémorise sur l'appareil comme le thème. Valeurs par défaut = préréglage « Mixte ».
// groupe : sous-titre sous lequel la ligne s'affiche dans Réglages → Style.
const STYLE_OPTIONS = [
  { groupe: 'Bandeau', cle: 'bandeau', lab: 'Police du titre', hint: '« Ma Bibliothèque », en haut de chaque page', choix: [
      ['bd', 'BD'], ['titres', 'Comme les titres'], ['affiche', 'Affiche'], ['classique', 'Classique'], ['prestige', 'Prestige'],
      ['elegant', 'Élégant'], ['moderne', 'Moderne'], ['sobre', 'Sobre'], ['machine', 'Machine à écrire'], ['manuscrit', 'Manuscrit']] },
  { groupe: 'Bandeau', cle: 'hdrcasse', lab: 'Écriture du titre', hint: 'MA BIBLIOTHÈQUE ou Ma Bibliothèque', choix: [
      ['maj', 'Majuscules'], ['normale', 'Normale']] },
  { groupe: 'Bandeau', cle: 'hdrombre', lab: 'Ombre du titre', hint: 'Ombre décalée façon BD, ombre floue, ou rien', choix: [
      ['decalee', 'Décalée'], ['douce', 'Douce'], ['aucune', 'Aucune']] },
  { groupe: 'Bandeau', cle: 'hdrfond', lab: 'Fond du bandeau', hint: 'Toujours dans la couleur du thème ; la trame ajoute les points et le gros filet', choix: [
      ['trame', 'Trame BD'], ['uni', 'Uni'], ['degrade', 'Dégradé']] },
  { groupe: 'Bandeau', cle: 'hdrchamps', lab: 'Champs de recherche et filtres', hint: 'Recherche, Format, Genre', choix: [
      ['bd', 'BD'], ['doux', 'Doux'], ['arrondis', 'Arrondis'], ['soulignes', 'Soulignés']] },
  { groupe: 'Bandeau', cle: 'hdrpastilles', lab: 'Pastilles de statut', hint: 'Lus, Écoutés, En cours, Non lus, Favoris', choix: [
      ['bd', 'BD'], ['douces', 'Douces'], ['contour', 'Contour']] },
  { groupe: 'Bandeau', cle: 'hdrboutons', lab: 'Boutons Carnet et Réglages', hint: 'Les deux boutons ronds, à droite du titre', choix: [
      ['bd', 'BD'], ['doux', 'Doux'], ['contour', 'Contour'], ['discrets', 'Discrets']] },
  { groupe: 'Pages', cle: 'titres', lab: 'Titres', hint: "Nom de l'auteur, titre du livre, titres des pages et des sections", choix: [
      ['theme', 'Police du thème'], ['bd', 'BD'], ['classique', 'Classique'], ['moderne', 'Moderne']] },
  { groupe: 'Pages', cle: 'cartes', lab: 'Cartes et fiche', hint: "Cartes d'auteurs et de livres, fiche d'un livre", choix: [
      ['douces', 'Douces'], ['bd', 'BD'], ['epurees', 'Épurées']] },
  { groupe: 'Pages', cle: 'pastilles', lab: 'Pastilles', hint: 'Ebook, PDF, Audio, Lu, Écouté, En cours, Favori, note', choix: [
      ['contour', 'Contour'], ['bd', 'BD']] },
  { groupe: 'Pages', cle: 'commandes', lab: 'Boutons, cases et champs', hint: 'Boutons, cases à cocher, champs de saisie, menus, boutons de note', choix: [
      ['douces', 'Doux'], ['bd', 'BD']] },
  { groupe: 'Pages', cle: 'panneaux', lab: 'Panneaux', hint: 'Statistiques, thèmes, anomalies, aide, livres masqués, carnet', choix: [
      ['doux', 'Doux'], ['bd', 'BD']] },
];
// chaque bouton « Police du titre » s'écrit dans sa propre police (mêmes familles que style.css)
const POLICES_BANDEAU = { bd: "'Bangers', Impact", titres: 'var(--titre-font)', affiche: "'Anton', Impact", classique: "'Fraunces', Georgia",
  prestige: "'Abril Fatface', Georgia", elegant: "'Spectral', Georgia", moderne: "'Space Grotesk', sans-serif", sobre: "'Libre Franklin', sans-serif",
  machine: "'Special Elite', monospace", manuscrit: "'Caveat', cursive" };
const BANDEAU_BD = { hdrcasse: 'maj', hdrombre: 'decalee', hdrfond: 'trame', hdrchamps: 'bd', hdrpastilles: 'bd', hdrboutons: 'bd' };
const STYLE_PRESETS = [
  ['ebook',   'Ebook (d’origine)', { titres: 'theme', bandeau: 'titres', cartes: 'douces', pastilles: 'contour', commandes: 'douces', panneaux: 'doux',
                                     hdrcasse: 'normale', hdrombre: 'aucune', hdrfond: 'uni', hdrchamps: 'doux', hdrpastilles: 'douces', hdrboutons: 'doux' }],
  ['elegant', 'Élégant',           { titres: 'classique', bandeau: 'classique', cartes: 'epurees', pastilles: 'contour', commandes: 'douces', panneaux: 'doux',
                                     hdrcasse: 'normale', hdrombre: 'douce', hdrfond: 'degrade', hdrchamps: 'arrondis', hdrpastilles: 'contour', hdrboutons: 'contour' }],
  ['mixte',   'Mixte',             { titres: 'theme', bandeau: 'bd', cartes: 'bd', pastilles: 'bd', commandes: 'bd', panneaux: 'bd', ...BANDEAU_BD }],
  ['bd',      'Tout BD',           { titres: 'bd',    bandeau: 'bd', cartes: 'bd', pastilles: 'bd', commandes: 'bd', panneaux: 'bd', ...BANDEAU_BD }],
];
const DEFAULTS = {theme:"nordique", mode:"auto"};
for (const [k, v] of Object.entries(STYLE_PRESETS.find(p => p[0] === 'mixte')[2])) DEFAULTS['style.' + k] = v;

// Version de la livraison — à augmenter à CHAQUE livraison, en même temps que le ?v= des
// liens css/js dans index.html et l'historique « Versions » du README.
const APP_VERSION = '1.9';
const APP_VERSION_DATE = '2026-10-25';

// localStorage peut lever une exception (navigation privée, cookies bloqués) :
// l'app doit continuer à fonctionner sans, d'où les try/catch.
function prefGet(k){
  try{ return localStorage.getItem("mabiblio."+k) || DEFAULTS[k]; }
  catch(e){ return DEFAULTS[k]; }
}
function prefSet(k, v){
  try{ localStorage.setItem("mabiblio."+k, v); }catch(e){}
}
function styleGet(cle){
  const o = STYLE_OPTIONS.find(x => x.cle === cle);
  const v = prefGet('style.' + cle);
  return o.choix.some(c => c[0] === v) ? v : DEFAULTS['style.' + cle];
}
function applyTheme(){
  const t = THEMES.some(x => x.id === prefGet("theme")) ? prefGet("theme") : DEFAULTS.theme;
  document.documentElement.setAttribute("data-theme", t);
  document.documentElement.setAttribute("data-mode", prefGet("mode"));
  for (const o of STYLE_OPTIONS) document.documentElement.setAttribute('data-' + o.cle, styleGet(o.cle));
  // la barre d'état du téléphone suit la couleur de fond du thème
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta){
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    if (bg) meta.setAttribute("content", bg);
  }
  ajusterTitreBandeau();
}
// Sur iPhone, le titre du bandeau a une colonne fixe à gauche des boutons ronds. Certaines
// polices en majuscules (Élégant, Classique, Manuscrit…) y dépassent de quelques pixels :
// on réduit alors juste ce qu'il faut la taille du titre, au lieu de le laisser chevaucher.
function ajusterTitreBandeau(){
  const e = document.querySelector('.topbar .brand');
  if (!e) return;
  e.style.fontSize = '';
  if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0){
    const px = parseFloat(getComputedStyle(e).fontSize);
    e.style.fontSize = Math.floor(px * e.clientWidth / e.scrollWidth * 0.97) + 'px';
  }
}
window.addEventListener('resize', ajusterTitreBandeau);
try { document.fonts.ready.then(ajusterTitreBandeau); document.fonts.addEventListener?.('loadingdone', ajusterTitreBandeau); } catch (e) {}
applyTheme();

const el = {
  app: document.getElementById('app'),
  search: document.getElementById('search-input'),
  searchClear: document.getElementById('search-clear'),
  filterFormat: document.getElementById('filter-format'),
  filterGenre: document.getElementById('filter-genre'),
  statusPills: document.getElementById('status-pills'),
  controls: document.getElementById('controls'),
  settingsBtn: document.getElementById('settings-btn'),
  carnetBtn: document.getElementById('carnet-btn'),
  brandStats: document.getElementById('brand-stats'),
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

// Idem pour la migration « en cours » (colonne is_in_progress) : sans elle, la
// case « En cours », sa pastille et son badge n'apparaissent simplement pas.
let PROGRESS_READY = true;

// Note, date de lecture et commentaire (migration « avis ») : privés. Ces colonnes ne
// sont jamais demandées à la base pour un visiteur — seul le mode propriétaire les
// télécharge (loadReviews), et elles sont effacées de la mémoire en le quittant.
let REVIEWS_READY = true;
let REVIEWS_LOADED = false;
const REVIEW_FIELDS = ['rating', 'finished_on', 'review_comment'];

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
  if (OWNER) loadReviews().then(nouveau => { if (nouveau) route(); });
  else clearReviews();
}

// Télécharge notes, dates et commentaires — uniquement en mode propriétaire.
// Renvoie true si de nouvelles données sont arrivées (l'écran doit être redessiné).
async function loadReviews() {
  if (!OWNER || !REVIEWS_READY || REVIEWS_LOADED || !LOADED) return false;
  const PAGE = 1000;
  let rows = [], offset = 0;
  while (true) {
    const { data, error } = await sb.from('books').select('id, ' + REVIEW_FIELDS.join(', '))
      .order('id', { ascending: true }).range(offset, offset + PAGE - 1);
    if (error) {
      // migration pas encore exécutée : la fonction « avis » est simplement absente
      if (/rating|finished_on|review_comment|column/i.test(error.message || '')) REVIEWS_READY = false;
      return false;
    }
    rows = rows.concat(data);
    if (data.length < PAGE) break;
    offset += PAGE;
  }
  const parId = new Map(rows.map(r => [r.id, r]));
  for (const b of ALL_BOOKS.concat(HIDDEN_BOOKS)) {
    const r = parId.get(b.id) || {};
    b.rating = (r.rating >= 1 && r.rating <= 10) ? r.rating : null;
    b.finished_on = r.finished_on || null;
    b.review_comment = r.review_comment || null;
  }
  REVIEWS_LOADED = true;
  return true;
}

// En quittant le mode propriétaire, on ne garde rien de privé en mémoire.
function clearReviews() {
  for (const b of ALL_BOOKS.concat(HIDDEN_BOOKS)) REVIEW_FIELDS.forEach(f => { b[f] = null; });
  REVIEWS_LOADED = false;
}

function hasReview(book) {
  return !!(book.rating || book.finished_on || book.review_comment);
}
// Le bloc « Mon avis » apparaît dès que le livre est lu ou écouté (ou a déjà un avis).
function reviewEligible(book) {
  return !!(book.is_read || book.is_listened || hasReview(book));
}
function dateFr(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}
function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Le filtre « Statut » ne sert qu'à retrouver SES lus/écoutés/favoris :
// un visiteur n'a aucune raison d'en avoir besoin, et le proposer
// laisserait deviner ce que le propriétaire a lu ou aimé.
let statusValue = '';
function syncStatusFilterVisibility() {
  if (el.carnetBtn) el.carnetBtn.hidden = !OWNER;   // le carnet, comme les statuts, est privé
  if (!el.statusPills) return;
  el.statusPills.hidden = !OWNER;
  const pEnCours = el.statusPills.querySelector('.pill[data-status="inprogress"]');
  if (pEnCours) {
    pEnCours.hidden = !PROGRESS_READY;
    if (!PROGRESS_READY && statusValue === 'inprogress') {
      statusValue = ''; pEnCours.classList.remove('on');
    }
  }
  if (!OWNER && statusValue) {
    statusValue = '';
    el.statusPills.querySelectorAll('.pill').forEach(b => b.classList.remove('on'));
    triggerRefilter();
  }
}

// Repart du haut et relance le rendu de l'accueil — recherche, filtres et
// pastilles de statut partagent tous la même logique de rafraîchissement.
function triggerRefilter() {
  scrollMemory.delete('#/');
  if (location.hash !== '#/' && location.hash !== '') location.hash = '#/';
  else renderHome();
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
    + (PROGRESS_READY ? ` is_in_progress,` : ``)
    + COLS_BASE.replace('id, title,', '');

  const PAGE_SIZE = 1000;
  let data = [];
  let offset = 0;
  while (true) {
    let { data: page, error } = await sb
      .from('books').select(cols())
      .order('id', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    // trois essais au plus : on retire d'abord les séries, puis « en cours »,
    // puis l'édition (dont le motif « column » est le plus large : il vient en dernier)
    for (let essai = 0; error && essai < 3; essai++) {
      const msg = error.message || '';
      if (SERIES_READY && /series/i.test(msg)) SERIES_READY = false;
      else if (PROGRESS_READY && /in_progress/i.test(msg)) PROGRESS_READY = false;
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
    is_in_progress: !!b.is_in_progress,
    genre: b.genre || 'Non classé',
    cover_path: b.cover_path,
    source_note: b.source_note,
    created_at: b.created_at || '',
  }));

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
  rebuildSearch();
  updateBrandStats();
}

// Texte de recherche de chaque livre visible : le titre AFFICHÉ et l'auteur, rien
// d'autre. Un titre corrigé ne se retrouve donc plus par son ancienne orthographe
// (source_title reste en base, mais ne sert plus qu'aux synchronisations).
// Seule exception : une fiche fusionnée reste trouvable sous le titre de la fiche
// qu'elle a absorbée. La base ne garde pas de lien explicite entre les deux ; on le
// retrouve ici en rapprochant chaque fiche masquée de la fiche visible du même auteur
// qui a la même clé de doublon (la règle de l'écran des anomalies, celle-là même qui
// a proposé la fusion). Une fiche masquée qui n'est le doublon de rien n'apporte rien.
// Appelée par rebuildAuthors(), donc au chargement et après chaque fusion, masquage,
// restauration ; et après chaque correction de titre.
function rebuildSearch() {
  const absorbes = new Map();   // "auteur|clé" -> titres des fiches masquées
  for (const h of HIDDEN_BOOKS) {
    const k = cleDoublon(h);
    if (!k) continue;
    const cle = h.author_id + '|' + k;
    if (!absorbes.has(cle)) absorbes.set(cle, []);
    absorbes.get(cle).push(h.title);
  }
  for (const b of ALL_BOOKS) {
    const k = cleDoublon(b);
    const fusion = k ? (absorbes.get(b.author_id + '|' + k) || []) : [];
    b.search = fold([b.title, b.author_name, ...fusion].join(' '));
  }
}

// Totaux affichés dans le bandeau d'en-tête, à côté du titre — toujours les
// chiffres globaux de la bibliothèque, pas ceux d'une recherche en cours.
function updateBrandStats() {
  if (!el.brandStats) return;
  const nAuth = AUTHORS.size, nBooks = ALL_BOOKS.length;
  el.brandStats.textContent =
    `${nAuth} auteur${nAuth > 1 ? 's' : ''} · ${nBooks} livre${nBooks > 1 ? 's' : ''}`;
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
    if (PROGRESS_READY && book.is_in_progress) out += `<span class="badge inprogress">En cours</span>`;
    if (book.rating) out += `<span class="badge rating" title="Ma note">${book.rating}/10</span>`;
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
    status: statusValue,
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
    if (f.status === 'inprogress' && !b.is_in_progress) return false;
    // « Non lus » = pas encore commencés : un livre en cours n'en fait plus partie
    if (f.status === 'unread' && (b.is_read || b.is_in_progress)) return false;
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
          ${PROGRESS_READY ? `<label class="toggle ${book.is_in_progress ? 'active' : ''}" data-field="is_in_progress">
            <input type="checkbox" ${book.is_in_progress ? 'checked' : ''}> En cours
          </label>` : ''}
          <label class="toggle ${book.is_read ? 'active' : ''}" data-field="is_read">
            <input type="checkbox" ${book.is_read ? 'checked' : ''}> Lu sur liseuse
          </label>
          <label class="toggle ${book.is_listened ? 'active' : ''}" data-field="is_listened">
            <input type="checkbox" ${book.is_listened ? 'checked' : ''}> Écouté en audio
          </label>
          <label class="toggle ${book.is_favorite ? 'active' : ''}" data-field="is_favorite">
            <input type="checkbox" ${book.is_favorite ? 'checked' : ''}> Favori
          </label>
        </div>
        ${renderReviewBlock(book)}` : readOnlyStatuses(book)}

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

  // On écoute le changement de la case elle-même, pas le clic sur l'étiquette : le
  // navigateur coche la case une seule fois, que l'on touche la case ou le texte, puis
  // déclenche « change ». (Avant, un preventDefault() sur le clic de l'étiquette faisait
  // que le navigateur décochait aussitôt la case quand on la touchait directement :
  // la fiche était enregistrée comme lue, mais la case restait vide.)
  el.app.querySelectorAll('.toggle').forEach(label => {
    const input = label.querySelector('input');
    input.addEventListener('change', () => toggleField(book, label.dataset.field, label, input.checked));
  });

  wireReviewBlock(book);

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
  // la recherche suit le titre affiché : l'ancien titre ne la nourrit plus
  rebuildSearch();
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

async function toggleField(book, field, label, checked) {
  const newValue = !!checked;
  const payload = { [field]: newValue };
  // Cocher « Lu » ou « Écouté » termine la lecture : « En cours » se décoche tout
  // seul, dans la même mise à jour (comme dans l'appli BD, où une série entièrement
  // lue n'est plus « en cours »).
  const finit = PROGRESS_READY && newValue && book.is_in_progress
    && (field === 'is_read' || field === 'is_listened');
  if (finit) payload.is_in_progress = false;
  const avant = { [field]: book[field], is_in_progress: book.is_in_progress };

  const affiche = (f, v) => {
    const lab = f === field ? label : el.app.querySelector(`.toggle[data-field="${f}"]`);
    if (!lab) return;
    lab.classList.toggle('active', v);
    lab.querySelector('input').checked = v;
  };
  // on affiche tout de suite, on corrige si ça rate
  for (const [f, v] of Object.entries(payload)) { book[f] = v; affiche(f, v); }

  const majAvis = () => {
    const rb = document.getElementById('review-block');
    if (rb) rb.hidden = !reviewEligible(book);
  };
  majAvis();

  const { error } = await sb.from('books').update(payload).eq('id', book.id);
  if (error) {
    for (const f of Object.keys(payload)) { book[f] = avant[f]; affiche(f, avant[f]); }
    majAvis();
    alert("La mise à jour n'a pas pu être enregistrée. Vérifie ta connexion et réessaie.");
  }
}

// ---------------------------------------------------------------
// Mon carnet de lecture — page privée (mode propriétaire) : « Où j'en suis », les livres
// en cours, et la liste triable/filtrable des livres lus ou écoutés.
// ---------------------------------------------------------------
const CARNET = { tri: 'date-desc', annee: '', format: '', note: '' };   // gardé entre deux visites
const CARNET_TRIS = [
  ['date-desc', 'Date de lecture, plus récente d’abord', true],
  ['date-asc',  'Date de lecture, plus ancienne d’abord', true],
  ['note-desc', 'Note, meilleure d’abord', true],
  ['note-asc',  'Note, moins bonne d’abord', true],
  ['titre',     'Titre (A → Z)', false],
  ['auteur',    'Auteur (A → Z)', false],
];

function renderCarnet() {
  const avis = REVIEWS_READY && REVIEWS_LOADED;
  if (!avis && !CARNET_TRIS.some(t => t[0] === CARNET.tri && !t[2])) CARNET.tri = 'titre';
  const finis = ALL_BOOKS.filter(b => b.is_read || b.is_listened);
  const enCours = PROGRESS_READY ? ALL_BOOKS.filter(b => b.is_in_progress) : [];
  const annees = [...new Set(finis.filter(b => b.finished_on).map(b => b.finished_on.slice(0, 4)))].sort().reverse();
  if (CARNET.annee && CARNET.annee !== 'none' && !annees.includes(CARNET.annee)) CARNET.annee = '';

  el.app.innerHTML = `
    <div class="carnet">
      <a class="back-link" href="#/">← Retour à la bibliothèque</a>
      <h1>Mon carnet de lecture</h1>
      <p class="lede">Ce que tu as lu ou écouté, quand, et ce que tu en as pensé — visible de toi seul.</p>

      <section class="carnet-sec">
        <div class="section-title">Où j'en suis <span class="rule"></span></div>
        ${carnetStats(finis, annees, avis)}
      </section>

      ${enCours.length ? `<section class="carnet-sec">
        <div class="section-title">En cours · ${enCours.length} <span class="rule"></span></div>
        <div class="carnet-list">${enCours.sort((a, b) => a.title.localeCompare(b.title, 'fr')).map(b => carnetLigne(b, avis, true)).join('')}</div>
      </section>` : ''}

      <section class="carnet-sec">
        <div class="section-title">Livres lus ou écoutés <span class="rule"></span></div>
        ${!REVIEWS_READY ? `<p class="hint-sm">Les notes, dates et commentaires apparaîtront ici une fois la migration
          <code>migration_2026-10_avis.sql</code> exécutée dans Supabase.</p>` : ''}
        <div class="carnet-ctrls">
          <label>Trier
            <select id="carnet-tri">${CARNET_TRIS.filter(t => avis || !t[2]).map(([v, l]) =>
              `<option value="${v}" ${CARNET.tri === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
          </label>
          ${avis ? `<label>Année
            <select id="carnet-annee">
              <option value="">Toutes</option>
              ${annees.map(a => `<option value="${a}" ${CARNET.annee === a ? 'selected' : ''}>${a}</option>`).join('')}
              <option value="none" ${CARNET.annee === 'none' ? 'selected' : ''}>Date non renseignée</option>
            </select>
          </label>` : ''}
          <label>Format
            <select id="carnet-format">
              <option value="">Lus et écoutés</option>
              <option value="read" ${CARNET.format === 'read' ? 'selected' : ''}>Lus sur liseuse</option>
              <option value="listened" ${CARNET.format === 'listened' ? 'selected' : ''}>Écoutés en audio</option>
            </select>
          </label>
          ${avis ? `<label>Note
            <select id="carnet-note">
              <option value="">Tous</option>
              <option value="rated" ${CARNET.note === 'rated' ? 'selected' : ''}>Notés</option>
              <option value="unrated" ${CARNET.note === 'unrated' ? 'selected' : ''}>Pas encore notés</option>
            </select>
          </label>` : ''}
        </div>
        <p class="carnet-count" id="carnet-count"></p>
        <div class="carnet-list" id="carnet-list"></div>
      </section>
    </div>`;

  const majListe = () => {
    const liste = carnetFiltre(finis);
    document.getElementById('carnet-count').textContent =
      liste.length === finis.length ? `${liste.length} livre${liste.length > 1 ? 's' : ''}`
        : `${liste.length} livre${liste.length > 1 ? 's' : ''} sur ${finis.length}`;
    document.getElementById('carnet-list').innerHTML = liste.length
      ? carnetGroupes(liste, avis)
      : `<div class="empty">Aucun livre ne correspond à ces filtres.</div>`;
  };
  for (const [id, cle] of [['carnet-tri', 'tri'], ['carnet-annee', 'annee'], ['carnet-format', 'format'], ['carnet-note', 'note']]) {
    const sel = document.getElementById(id);
    if (sel) sel.addEventListener('change', () => { CARNET[cle] = sel.value; majListe(); });
  }
  majListe();
}

function carnetStats(finis, annees, avis) {
  const total = ALL_BOOKS.length || 1;
  const nb = f => ALL_BOOKS.filter(f).length;
  const notes = ALL_BOOKS.filter(b => b.rating).map(b => b.rating);
  const moyenne = notes.length ? (notes.reduce((a, x) => a + x, 0) / notes.length).toFixed(1).replace('.', ',') : '—';
  const done = finis.length;
  const parAnnee = annees.map(a => `${a} : ${finis.filter(b => (b.finished_on || '').startsWith(a)).length}`);
  const sansDate = finis.filter(b => !b.finished_on).length;
  if (sansDate) parAnnee.push(`date non renseignée : ${sansDate}`);
  const stat = (n, l) => `<div class="stat"><div class="n">${n}</div><div class="l">${l}</div></div>`;
  return `
        <div class="stats">
          ${stat(ALL_BOOKS.length, 'livres')}${stat(AUTHORS.size, 'auteurs')}
          ${stat(nb(b => b.is_read), 'lus')}${stat(nb(b => b.is_listened), 'écoutés')}
          ${PROGRESS_READY ? stat(nb(b => b.is_in_progress), 'en cours') : ''}
          ${avis ? stat(notes.length, 'notés') + stat(moyenne, 'note moyenne /10') : ''}
          ${stat(nb(b => b.is_favorite), 'favoris')}
        </div>
        <div class="bar" title="${done} livres sur ${ALL_BOOKS.length}"><i style="width:${(done / total * 100).toFixed(1)}%"></i></div>
        <p class="lede carnet-lede">${done} livre${done > 1 ? 's' : ''} lu${done > 1 ? 's' : ''} ou écouté${done > 1 ? 's' : ''},
          soit ${(done / total * 100).toFixed(1).replace('.', ',')} % de la bibliothèque.</p>
        ${avis && done ? `<p class="lede carnet-lede" id="carnet-annees">Par année : ${parAnnee.join(' · ')}</p>` : ''}`;
}

function carnetFiltre(finis) {
  const c = CARNET;
  const liste = finis.filter(b => {
    if (c.format === 'read' && !b.is_read) return false;
    if (c.format === 'listened' && !b.is_listened) return false;
    if (c.annee === 'none' && b.finished_on) return false;
    if (c.annee && c.annee !== 'none' && !(b.finished_on || '').startsWith(c.annee)) return false;
    if (c.note === 'rated' && !b.rating) return false;
    if (c.note === 'unrated' && b.rating) return false;
    return true;
  });
  const titre = (a, b) => a.title.localeCompare(b.title, 'fr');
  const auteur = (a, b) => (a.author_name_sort || '').localeCompare(b.author_name_sort || '', 'fr') || titre(a, b);
  // ce qui n'a pas de date (ou pas de note) va toujours en fin de liste, quel que soit le sens
  const parDate = sens => (a, b) => (!a.finished_on - !b.finished_on)
    || (a.finished_on && b.finished_on ? sens * a.finished_on.localeCompare(b.finished_on) : 0) || titre(a, b);
  const parNote = sens => (a, b) => (!a.rating - !b.rating)
    || (a.rating && b.rating ? sens * (a.rating - b.rating) : 0)
    || ((b.finished_on || '').localeCompare(a.finished_on || '')) || titre(a, b);
  const cmp = { 'date-desc': parDate(-1), 'date-asc': parDate(1), 'note-desc': parNote(-1),
                'note-asc': parNote(1), titre, auteur }[c.tri] || titre;
  return liste.sort(cmp);
}

// Tri par date : un intertitre par année, puis « Date non renseignée ».
function carnetGroupes(liste, avis) {
  if (!avis || !CARNET.tri.startsWith('date')) return liste.map(b => carnetLigne(b, avis)).join('');
  let out = '', courant = null;
  for (const b of liste) {
    const g = b.finished_on ? b.finished_on.slice(0, 4) : 'Date non renseignée';
    if (g !== courant) { out += `<h3 class="carnet-groupe">${g}</h3>`; courant = g; }
    out += carnetLigne(b, avis);
  }
  return out;
}

// enCours : dans la section « En cours », date et note ne s'affichent que si elles existent
function carnetLigne(b, avis, enCours) {
  const com = avis && b.review_comment ? b.review_comment.replace(/\s+/g, ' ') : '';
  const extrait = com.length > 140 ? com.slice(0, 140).replace(/\s+\S*$/, '') + '…' : com;
  return `
          <a class="carnet-row" href="#/book/${b.id}">
            <div class="c-main">
              <span class="c-titre">${escapeHtml(b.title)}</span>
              <span class="c-auteur">${escapeHtml(b.author_name)}</span>
            </div>
            <div class="c-meta">
              ${b.is_read ? '<span class="badge status">Lu</span>' : ''}
              ${b.is_listened ? '<span class="badge status">Écouté</span>' : ''}
              ${PROGRESS_READY && b.is_in_progress ? '<span class="badge inprogress">En cours</span>' : ''}
              ${avis && !(enCours && !b.finished_on) ? `<span class="c-date">${b.finished_on ? dateFr(b.finished_on) : 'sans date'}</span>` : ''}
              ${avis && !(enCours && !b.rating) ? `<span class="c-note${b.rating ? '' : ' vide'}">${b.rating ? b.rating + '/10' : '—'}</span>` : ''}
            </div>
            ${extrait ? `<p class="c-com">${escapeHtml(extrait)}</p>` : ''}
          </a>`;
}

// ---------------------------------------------------------------
// Mon avis : note sur 10, date de lecture/écoute, commentaire.
// Réservé au propriétaire, jamais affiché ni même téléchargé pour un visiteur.
// ---------------------------------------------------------------
function renderReviewBlock(book) {
  if (!REVIEWS_READY || !REVIEWS_LOADED) return '';
  const r = book.rating || 0;
  return `
        <section class="review" id="review-block" ${reviewEligible(book) ? '' : 'hidden'}>
          <div class="review-head">Mon avis <span class="review-private">· visible de toi seul</span></div>
          <div class="review-row">
            <span class="review-lab" id="rating-lab">Note</span>
            <div class="rating" role="group" aria-labelledby="rating-lab">
              ${[1,2,3,4,5,6,7,8,9,10].map(n => `<button type="button" class="rate${n <= r ? ' fill' : ''}${n === r ? ' on' : ''}"
                 data-rate="${n}" aria-pressed="${n === r}" aria-label="${n} sur 10">${n}</button>`).join('')}
            </div>
            <span class="rating-val" id="rating-val">${r ? r + '/10' : 'pas de note'}</span>
          </div>
          <div class="review-row">
            <label class="review-lab" for="finished-on">Lu / écouté le</label>
            <input type="date" id="finished-on" value="${book.finished_on || ''}">
            <button type="button" class="linkish" id="finished-today">Aujourd'hui</button>
            <button type="button" class="linkish" id="finished-clear" ${book.finished_on ? '' : 'hidden'}>Effacer</button>
          </div>
          <div class="review-row review-col">
            <label class="review-lab" for="review-comment">Commentaire</label>
            <textarea id="review-comment" rows="4" maxlength="4000"
              placeholder="Ce que tu en as pensé (facultatif)…">${escapeHtml(book.review_comment || '')}</textarea>
            <div class="review-actions">
              <button type="button" class="btn-main" id="review-save">Enregistrer le commentaire</button>
              <span class="review-msg" id="review-msg" aria-live="polite"></span>
            </div>
          </div>
        </section>`;
}

function wireReviewBlock(book) {
  const bloc = document.getElementById('review-block');
  if (!bloc) return;
  const msg = document.getElementById('review-msg');
  const dit = (t, erreur) => { msg.textContent = t; msg.classList.toggle('err', !!erreur); };

  // Une seule fonction d'enregistrement : on affiche tout de suite, on revient en
  // arrière si la base refuse.
  async function enregistre(champs, rendu) {
    const avant = {};
    for (const k of Object.keys(champs)) avant[k] = book[k];
    Object.assign(book, champs); rendu();
    dit('Enregistrement…');
    const { error } = await sb.from('books').update(champs).eq('id', book.id);
    if (error) {
      Object.assign(book, avant); rendu();
      dit("L'enregistrement a échoué. Vérifie ta connexion et réessaie.", true);
      return false;
    }
    dit('Enregistré ✓');
    return true;
  }

  // note : toucher un chiffre la fixe, toucher la note actuelle l'efface
  const renduNote = () => {
    const r = book.rating || 0;
    bloc.querySelectorAll('.rate').forEach(b => {
      const n = +b.dataset.rate;
      b.classList.toggle('fill', n <= r); b.classList.toggle('on', n === r);
      b.setAttribute('aria-pressed', n === r ? 'true' : 'false');
    });
    document.getElementById('rating-val').textContent = r ? r + '/10' : 'pas de note';
  };
  bloc.querySelectorAll('.rate').forEach(b => b.addEventListener('click', () => {
    const n = +b.dataset.rate;
    enregistre({ rating: book.rating === n ? null : n }, renduNote);
  }));

  // date
  const date = document.getElementById('finished-on');
  const effacer = document.getElementById('finished-clear');
  const renduDate = () => { date.value = book.finished_on || ''; effacer.hidden = !book.finished_on; };
  date.addEventListener('change', () => {
    const v = /^\d{4}-\d{2}-\d{2}$/.test(date.value) ? date.value : null;
    if (v !== (book.finished_on || null)) enregistre({ finished_on: v }, renduDate);
  });
  document.getElementById('finished-today').addEventListener('click', () => {
    if (book.finished_on !== todayIso()) enregistre({ finished_on: todayIso() }, renduDate);
  });
  effacer.addEventListener('click', () => enregistre({ finished_on: null }, renduDate));

  // commentaire : bouton, ou automatiquement quand on quitte le champ
  const zone = document.getElementById('review-comment');
  const renduCom = () => { if (zone.value.trim() !== (book.review_comment || '')) zone.value = book.review_comment || ''; };
  const sauveCom = () => {
    const v = zone.value.trim() || null;
    if (v === (book.review_comment || null)) return;
    enregistre({ review_comment: v }, renduCom);
  };
  document.getElementById('review-save').addEventListener('click', sauveCom);
  zone.addEventListener('blur', sauveCom);
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
  if (REVIEWS_LOADED) {
    if (!garde.rating && absorbe.rating) payload.rating = absorbe.rating;
    if (!garde.finished_on && absorbe.finished_on) payload.finished_on = absorbe.finished_on;
    if (absorbe.review_comment && absorbe.review_comment !== garde.review_comment)
      payload.review_comment = [garde.review_comment, absorbe.review_comment].filter(Boolean).join('\n\n');
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
  rebuildSearch();
  return 'ok';
}

// ---------------------------------------------------------------
// Réglages
// ---------------------------------------------------------------
function renderSettings() {
  const cur = prefGet('theme');
  const mode = prefGet('mode');

  el.app.innerHTML = `
    <div class="settings">
      <a class="back-link" href="#/">← Retour à la bibliothèque</a>
      <h1>Réglages</h1>
      <p class="lede">Dix habillages pour la même bibliothèque. Le choix est enregistré sur cet appareil :
        ton téléphone et ton PC peuvent avoir deux ambiances différentes.</p>

      <div class="set-all">
        <button type="button" class="set-all-btn" data-all="open">Tout déplier</button>
        <span aria-hidden="true">·</span>
        <button type="button" class="set-all-btn" data-all="close">Tout replier</button>
      </div>

      ${setBlock('mode', 'Clair ou sombre', `
        <div class="segmented" id="mode-seg">
          <button data-mode="auto" class="${mode==='auto'?'on':''}">Automatique</button>
          <button data-mode="light" class="${mode==='light'?'on':''}">Clair</button>
          <button data-mode="dark" class="${mode==='dark'?'on':''}">Sombre</button>
        </div>
        <p class="lede" style="margin:0.8rem 0 0; font-size:0.8rem;">
          « Automatique » suit le réglage de ton téléphone ou de ton PC. Chacun des dix thèmes
          existe dans les deux ambiances.</p>`)}

      ${setBlock('theme', 'Thème', `
        <div class="theme-grid" id="theme-grid">
          ${THEMES.map(t => themeCard(t, t.id === cur)).join('')}
        </div>`)}

      ${setBlock('style', 'Style', renderStyleBlock())}

      ${setBlock('proprietaire', 'Mode propriétaire', renderOwnerBlock())}


      ${(EDITABLE && OWNER) ? setBlock('anomalies', 'Anomalies', renderAnomaliesBlock()) : ''}

      ${(EDITABLE && OWNER) ? setBlock('masques', 'Livres masqués', renderHiddenBlock()) : ''}

      ${OWNER ? setBlock('admin', "Outil d'administration et mode d'emploi", `
        <p class="lede" style="margin:0 0 0.8rem; font-size:0.85rem;">
          L'outil d'import sert à ajouter des livres, des auteurs ou des couvertures directement dans
          la base Supabase. Le mode d'emploi (PDF) explique tout ce que permet le mode propriétaire.</p>
        <div class="admin-links">
          <a class="btn-main" id="link-import-tool" href="supabase_import_tool.html" target="_blank" rel="noopener">Ouvrir l'outil d'import Supabase ↗</a>
          <a class="btn-main" id="link-mode-emploi" href="Mode_emploi_proprietaire.pdf" target="_blank" rel="noopener">Ouvrir le mode d'emploi (PDF) ↗</a>
        </div>`) : ''}

      ${OWNER ? setBlock('aide', 'Aide', renderAideProprietaire()) : ''}

      <p class="app-version">Ma Bibliothèque — version ${APP_VERSION} du ${APP_VERSION_DATE.split('-').reverse().join('/')}</p>
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
  wireSetBlocks();
  wireStyleBlock();
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

// Sections des Réglages repliables (titre cliquable, comme la rubrique Aide). Ce qui est
// replié est mémorisé sur l'appareil : la page se rouvre telle qu'on l'a laissée.
const SET_CLOSED_KEY = 'mabiblio.reglages.replies';
let SET_CLOSED = (() => {
  try { return new Set(JSON.parse(localStorage.getItem(SET_CLOSED_KEY) || '[]')); }
  catch (e) { return new Set(); }
})();
function saveSetClosed() {
  try { localStorage.setItem(SET_CLOSED_KEY, JSON.stringify([...SET_CLOSED])); } catch (e) {}
}
function setBlock(id, titre, corps) {
  const ouvert = !SET_CLOSED.has(id);
  return `
      <section class="set-block${ouvert ? '' : ' is-closed'}" data-sec="${id}">
        <button type="button" class="section-title set-head" data-sec="${id}" aria-expanded="${ouvert}">
          <span class="t">${titre}</span><span class="rule"></span>
        </button>
        <div class="set-body"${ouvert ? '' : ' hidden'}>${corps}</div>
      </section>`;
}
function toggleSetBlock(head, ouvrir) {
  const id = head.dataset.sec;
  head.setAttribute('aria-expanded', ouvrir ? 'true' : 'false');
  head.nextElementSibling.hidden = !ouvrir;
  head.parentElement.classList.toggle('is-closed', !ouvrir);
  if (ouvrir) SET_CLOSED.delete(id); else SET_CLOSED.add(id);
}
function wireSetBlocks() {
  el.app.querySelectorAll('.set-head').forEach(h => h.addEventListener('click', () => {
    toggleSetBlock(h, h.getAttribute('aria-expanded') !== 'true');
    saveSetClosed();
  }));
  el.app.querySelectorAll('.set-all-btn').forEach(b => b.addEventListener('click', () => {
    el.app.querySelectorAll('.set-head').forEach(h => toggleSetBlock(h, b.dataset.all === 'open'));
    saveSetClosed();
  }));
}

// ---------------------------------------------------------------
// Réglages → Style : un sélecteur par aspect, trois préréglages, et un aperçu en direct
// (de vrais éléments de l'application, qui prennent le style choisi à l'instant).
// ---------------------------------------------------------------
function presetActif() {
  const p = STYLE_PRESETS.find(([, , v]) => STYLE_OPTIONS.every(o => styleGet(o.cle) === v[o.cle]));
  return p ? p[0] : null;
}
function renderStyleBlock() {
  const actif = presetActif();
  return `
        <p class="lede" style="margin:0 0 1rem; font-size:0.85rem;">
          Chaque partie de l'interface se règle séparément ; le choix est enregistré sur cet appareil,
          comme le thème. Les couleurs restent celles du thème.</p>
        <div class="style-presets">
          <span class="style-lab">Préréglages :</span>
          <div class="segmented" id="style-presets">
            ${STYLE_PRESETS.map(([id, lab]) => `<button type="button" data-preset="${id}" class="${actif === id ? 'on' : ''}">${lab}</button>`).join('')}
          </div>
          ${actif ? '' : '<span class="style-lab" id="style-perso">personnalisé</span>'}
        </div>
        <div class="style-grid">
          <div class="style-rows">
            ${STYLE_OPTIONS.map((o, i) => `
            ${i === 0 || STYLE_OPTIONS[i - 1].groupe !== o.groupe ? `<p class="style-groupe">${o.groupe}</p>` : ''}
            <div class="style-row">
              <span class="style-lab" id="style-lab-${o.cle}">${o.lab}</span>
              <span class="style-hint">${o.hint}</span>
              <div class="segmented" role="group" aria-labelledby="style-lab-${o.cle}" data-style="${o.cle}">
                ${o.choix.map(([v, l]) => `<button type="button" data-val="${v}" class="${styleGet(o.cle) === v ? 'on' : ''}"
                   aria-pressed="${styleGet(o.cle) === v}"${o.cle === 'bandeau' ? ` style="font-family:${POLICES_BANDEAU[v]}"` : ''}>${l}</button>`).join('')}
              </div>
            </div>`).join('')}
          </div>
          <div class="style-apercu" aria-hidden="true">
            <span class="apercu-lab">Aperçu</span>
            <div class="topbar apercu-bandeau">
              <div class="brand-row">
                <span class="brand">Ma Bibliothèque</span>
                <span class="hdr-btns">
                  <span class="icon-btn">${document.getElementById('carnet-btn')?.innerHTML || ''}</span>
                  <span class="icon-btn gear">${document.getElementById('settings-btn')?.innerHTML || ''}</span>
                </span>
              </div>
              <div class="controls">
                <div class="field search-wrap">
                  ${document.querySelector('.search-wrap .icon')?.outerHTML || ''}
                  <span class="apercu-saisie">Follett</span>
                  <span class="search-clear">${document.getElementById('search-clear')?.innerHTML || ''}</span>
                </div>
                <div class="status-pills"><span class="pill on">Lus</span><span class="pill">En cours</span><span class="pill">★ Favoris</span></div>
              </div>
            </div>
            <p class="apercu-titre">Les Piliers de la Terre</p>
            <div class="book-card">
              ${coverTile({ id: 'apercu', title: 'Les Piliers de la Terre', author_name: 'Ken Follett', cover_path: null })}
              <div class="info">
                <h3>Les Piliers de la Terre</h3>
                <p class="by">Ken Follett</p>
                <div class="badges"><span class="badge">Ebook</span><span class="badge">Audio</span><span class="badge fav">★ Favori</span><span class="badge rating">8/10</span></div>
              </div>
            </div>
            <div class="apercu-cmd">
              <span class="btn-main">Bouton</span>
              <label class="toggle active"><input type="checkbox" checked tabindex="-1"> Lu sur liseuse</label>
            </div>
            <div class="stat"><div class="n">12</div><div class="l">lus</div></div>
          </div>
        </div>`;
}
function wireStyleBlock() {
  const majPage = () => { applyTheme(); renderSettings(); };
  el.app.querySelectorAll('.segmented[data-style] button').forEach(b => b.addEventListener('click', () => {
    prefSet('style.' + b.parentElement.dataset.style, b.dataset.val);
    majPage();
  }));
  el.app.querySelectorAll('#style-presets button').forEach(b => b.addEventListener('click', () => {
    const p = STYLE_PRESETS.find(x => x[0] === b.dataset.preset);
    for (const [k, v] of Object.entries(p[2])) prefSet('style.' + k, v);
    majPage();
  }));
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
        Quatre cases cliquables sous le titre — En cours, Lu sur liseuse, Écouté en audio,
        Favori — qui s'enregistrent tout de suite, sans valider. Cocher « Lu » ou « Écouté »
        décoche « En cours » automatiquement : le livre est terminé. Un livre en cours ne fait
        plus partie des « Non lus ». Ces cases, les pastilles de statut du bandeau (Lus, Écoutés,
        En cours, Non lus, Favoris) et les badges correspondants n'apparaissent qu'en mode
        propriétaire : un visiteur ne peut jamais voir ce que tu lis, as lu, écouté ou mis en
        favori.</p>
      <p class="hint-sm" style="margin:0 0 0.8rem;">
        <strong>Mon avis</strong> : dès qu'un livre est coché « Lu » ou « Écouté », un bloc
        apparaît sous les cases — une note de 1 à 10 (toucher la note actuelle l'efface), la date
        à laquelle tu l'as lu ou écouté (bouton « Aujourd'hui »), et un commentaire libre. Tout est
        facultatif et s'enregistre aussitôt (le commentaire, au bouton ou en quittant le champ).
        La note apparaît sur les cartes du livre, et tout se retrouve dans ton carnet de lecture. Rien de tout
        cela n'est montré aux visiteurs, ni même envoyé à leur navigateur.</p>
      <p class="hint-sm" style="margin:0 0 0.8rem;">
        <strong>Corriger le titre</strong> : le nouveau texte devient le titre affiché ;
        l'orthographe du fichier d'origine reste conservée en coulisses, pour que la prochaine
        synchronisation retrouve ce livre et ne le recrée pas en double. La recherche, elle, ne
        connaît plus que le nouveau titre (seule une fiche fusionnée reste aussi trouvable sous le
        titre de celle qu'elle a absorbée). Si l'auteur a déjà un
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
    titre: 'Mon carnet de lecture',
    corps: `
      <p class="hint-sm" style="margin:0 0 0.8rem;">
        L'icône en forme de carnet, à côté de la roue crantée, ouvre une page qui n'est visible
        qu'en mode propriétaire. En haut, « Où j'en suis » : livres, auteurs, lectures et écoutes
        terminées, en cours, notés, note moyenne, favoris, et le nombre de lectures par année.
        Puis les livres en cours, et la liste de tous les livres lus ou écoutés, avec leur date,
        leur note et le début de ton commentaire.</p>
      <p class="hint-sm" style="margin:0;">
        La liste se trie par date de lecture (les plus récents d'abord, par défaut), par note, par
        titre ou par auteur, et se filtre par année, par lu / écouté, et par noté / pas encore
        noté. Les livres sans date de lecture sont regroupés en fin de liste, sous « Date non
        renseignée » : de quoi les compléter peu à peu. Toucher une ligne ouvre la fiche du livre.</p>`,
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
      La version complète existe aussi en PDF :
      <a href="Mode_emploi_proprietaire.pdf" target="_blank" rel="noopener">ouvrir le mode d'emploi</a>.</p>
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
  else if (hash === '#/carnet') {
    // réservé au propriétaire : un visiteur qui tape l'adresse revient à l'accueil
    if (OWNER) renderCarnet();
    else { history.replaceState(null, '', '#/'); renderHome(); }
  }
  else if (authorMatch) renderAuthor(authorMatch[1]);
  else if (bookMatch) renderBook(bookMatch[1]);
  else renderHome();

  // et on y revient si on avait déjà visité cette page
  const back = scrollMemory.get(hash);
  window.scrollTo(0, back || 0);
  lastHash = hash;
}

window.addEventListener('hashchange', route);

[el.search, el.filterFormat, el.filterGenre].forEach(input => {
  input.addEventListener('input', triggerRefilter);
});

// Pastilles de statut (Favoris / Lus / Écoutés / Non lus) : un seul choix actif à la
// fois — cliquer sur la pastille déjà active l'annule, comme un menu déroulant qu'on
// remettrait sur « Tous statuts ».
if (el.statusPills) {
  el.statusPills.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.status;
      if (statusValue === val) {
        statusValue = '';
        btn.classList.remove('on');
      } else {
        statusValue = val;
        el.statusPills.querySelectorAll('.pill').forEach(b => b.classList.toggle('on', b === btn));
      }
      triggerRefilter();
    });
  });
}

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

el.settingsBtn.addEventListener('click', () => { location.hash = '#/settings'; });
if (el.carnetBtn) el.carnetBtn.addEventListener('click', () => { location.hash = '#/carnet'; });

// ---------------------------------------------------------------
// Démarrage
// ---------------------------------------------------------------
syncStatusFilterVisibility();

(async function init() {
  const ok = await loadLibrary();
  syncStatusFilterVisibility();   // la pastille « En cours » dépend de la base chargée
  if (ok) await loadReviews();    // ne fait rien pour un visiteur
  if (ok) route();
})();
