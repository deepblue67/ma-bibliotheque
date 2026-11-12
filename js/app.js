// ===========================================================
// Ma Bibliothèque — application (vanilla JS, pas de build)
// Socle (1/7) : thèmes et préférences, mode propriétaire, données privées, chargement et
// cache du catalogue, utilitaires. Suite : accueil.js, livres.js, carnet.js, anomalies.js,
// reglages.js, demarrage.js — chargés par index.html dans cet ordre (version 3.7).
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
const DEFAULTS = {theme:"nordique", mode:"auto", tri:"auteur", accueil:"eventail", ordre:"alpha"};
for (const [k, v] of Object.entries(STYLE_PRESETS.find(p => p[0] === 'mixte')[2])) DEFAULTS['style.' + k] = v;

// Version de la livraison — à augmenter à CHAQUE livraison, en même temps que le ?v= des
// liens css/js dans index.html et l'historique « Versions » du README.
const APP_VERSION = '3.7';
const APP_VERSION_DATE = '2026-11-12';

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
  sagasBtn: document.getElementById('sagas-btn'),
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
// Mode propriétaire (version 3.0)
//
// Un appareil est « propriétaire » quand il est connecté à Supabase (Réglages → Mode
// propriétaire → Connexion sécurisée : e-mail + mot de passe, une fois par appareil ;
// la session est gardée par supabase-js). Les inscriptions étant fermées dans Supabase,
// le seul compte possible est celui que Christophe a créé à la main.
//
// Ce n'est plus l'appli qui protège : une fois le script de verrouillage exécuté
// (migration_2026-11_securite.sql), la base elle-même refuse toute écriture sans cette
// connexion, et ne montre ni statuts ni avis à la clé publique. L'ancien code
// propriétaire (empreinte ownerHash dans config.js, note « mabiblio.owner ») ne sert plus.
// ---------------------------------------------------------------
let OWNER = false;
let OWNER_EMAIL = '';
const AUTH_EMAIL_KEY = 'mabiblio.auth.email';   // l'adresse seule, pour la reproposer
try { localStorage.removeItem('mabiblio.owner'); } catch (e) {}

function estProprietaire(session) {
  return !!(session && session.user && !session.user.is_anonymous);
}

function setOwner(on) {
  OWNER = !!on;
  syncStatusFilterVisibility();
  if (OWNER) loadPrivate().then(nouveau => { if (nouveau) route(); });
  else clearPrivate();
}

// ---------------------------------------------------------------
// Statuts et avis : données privées (version 3.0)
//
// Avant le script de verrouillage, ils sont des colonnes de `books`, lisibles par tous.
// Après, ils vivent dans la table `lecture` (un livre, ses statuts, sa note, sa date,
// son commentaire), lisible et modifiable par le seul propriétaire connecté. L'appli
// détecte laquelle des deux situations est la bonne : elle marche donc avant ET après
// le script, ce qui permet de valider la connexion avant de verrouiller.
// ---------------------------------------------------------------
const STATUS_FIELDS = ['is_read', 'is_listened', 'is_favorite', 'is_in_progress'];
let LECTURE = null;          // null = pas encore vérifié ; true = table « lecture » ; false = colonnes de books
let PRIVATE_LOADED = false;

async function detecteLecture() {
  if (LECTURE !== null) return LECTURE;
  const { error } = await sb.from('lecture').select('book_id').limit(1);
  if (!error) LECTURE = true;
  else if (/lecture|schema cache|does not exist|42P01|PGRST20[45]/i.test((error.code || '') + ' ' + (error.message || ''))) LECTURE = false;
  return LECTURE;            // reste null si la base n'a pas répondu : on réessaiera
}

// Lit statuts et avis du propriétaire. Renvoie true si l'écran doit être redessiné.
async function loadPrivate() {
  if (!OWNER || PRIVATE_LOADED || !LOADED) return false;
  const lect = await detecteLecture();
  if (lect === null) return false;
  if (!lect) {                                   // avant le script : comme en 2.x
    PRIVATE_LOADED = true;
    return loadReviews();
  }
  const PAGE = 1000;
  let rows = [], offset = 0;
  while (true) {
    const { data, error } = await sb.from('lecture').select('*')
      .order('book_id', { ascending: true }).range(offset, offset + PAGE - 1);
    if (error) return false;
    rows = rows.concat(data);
    if (data.length < PAGE) break;
    offset += PAGE;
  }
  const parId = new Map(rows.map(r => [r.book_id, r]));
  for (const b of ALL_BOOKS.concat(HIDDEN_BOOKS)) {
    const r = parId.get(b.id) || {};
    for (const f of STATUS_FIELDS) b[f] = !!r[f];
    b.rating = (r.rating >= 1 && r.rating <= 10) ? r.rating : null;
    b.finished_on = r.finished_on || null;
    b.review_comment = r.review_comment || null;
  }
  PROGRESS_READY = true;
  REVIEWS_READY = true;
  REVIEWS_LOADED = true;
  PRIVATE_LOADED = true;
  syncStatusFilterVisibility();
  return true;
}

function clearPrivate() {
  clearReviews();
  // après le script, les statuts ne viennent que de la table privée : on les oublie
  // aussi (avant, ils viennent de books et sont déjà en mémoire pour tout le monde)
  if (LECTURE) for (const b of ALL_BOOKS.concat(HIDDEN_BOOKS)) STATUS_FIELDS.forEach(f => { b[f] = false; });
  PRIVATE_LOADED = false;
}

// Enregistre une modification d'un livre : statuts et avis dans la table privée quand
// elle existe, le reste (titre, masquage, formats, couverture, saga…) dans books.
async function ecritLivre(book, payload) {
  if (LECTURE === null) await detecteLecture();
  const prive = {}, pub = {};
  for (const [k, v] of Object.entries(payload)) {
    if (LECTURE && (STATUS_FIELDS.includes(k) || REVIEW_FIELDS.includes(k))) prive[k] = v; else pub[k] = v;
  }
  if (Object.keys(prive).length) {
    ECRITURES++;
    const { error } = await sb.from('lecture').upsert({ book_id: book.id, ...prive }, { onConflict: 'book_id' });
    if (error) return { error };
  }
  if (Object.keys(pub).length) {
    const { error } = await majBooks(book.id, pub);
    if (error) return { error };
  }
  return { error: null };
}

// Met à jour un livre dans books en vérifiant qu'une ligne a vraiment changé : quand la base
// verrouillée refuse (session expirée, déconnecté sur un autre onglet…), elle ne renvoie pas
// d'erreur, elle ne modifie simplement rien. Sans ce contrôle, l'appli croirait avoir enregistré.
async function majBooks(id, payload) {
  ECRITURES++;
  const { data, error } = await sb.from('books').update(payload).eq('id', id).select('id');
  if (error) return { error };
  if (!data || !data.length) return { error: { message: 'modification refusée par la base (connexion expirée ?)' } };
  return { error: null };
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
// Lit tout le catalogue public (livres visibles et masqués) sans rien modifier de l'état de
// l'appli : renvoie { all, drapeaux } ou { error }. Les drapeaux disent quelles colonnes
// existent dans la base (migrations d'octobre 2026) ; ils partent de true à chaque lecture.
async function litCatalogue() {
  const d = { EDITABLE: true, SERIES_READY: true, PROGRESS_READY: true };
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
    + (d.EDITABLE ? ` source_title, is_hidden,` : ``)
    + (d.SERIES_READY ? ` series, series_index,` : ``)
    + (d.PROGRESS_READY ? ` is_in_progress,` : ``)
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
      if (d.SERIES_READY && /series/i.test(msg)) d.SERIES_READY = false;
      else if (d.PROGRESS_READY && /in_progress/i.test(msg)) d.PROGRESS_READY = false;
      else if (d.EDITABLE && /source_title|is_hidden|column/i.test(msg)) d.EDITABLE = false;
      else break;
      ({ data: page, error } = await sb
        .from('books').select(cols())
        .order('id', { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1));
    }

    if (error) return { error, drapeaux: d };

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

  return { all, drapeaux: d };
}

function afficheErreurChargement(error) {
  el.app.innerHTML = `<div class="empty">Impossible de charger la bibliothèque.<br>
        <span style="font-family:var(--font-mono); font-size:0.75rem;">${escapeHtml(error.message)}</span><br><br>
        Vérifie que le script <code>supabase_schema.sql</code> a bien été exécuté et que les données ont été importées.</div>`;
}

// Met en place un catalogue (lu dans la base ou dans le cache de l'appareil).
function appliqueCatalogue(all, drapeaux) {
  EDITABLE = drapeaux.EDITABLE;
  SERIES_READY = drapeaux.SERIES_READY;
  PROGRESS_READY = drapeaux.PROGRESS_READY;
  // Les fiches masquées restent en base pour empêcher leur réinsertion lors
  // d'une synchronisation, mais l'application ne les montre nulle part.
  ALL_BOOKS = all.filter(b => !b.is_hidden);
  HIDDEN_BOOKS = all.filter(b => b.is_hidden);

  rebuildAuthors();
  populateGenreFilter();
  LOADED = true;
}

// ---- Cache du catalogue sur l'appareil (version 3.7) ----
// Au démarrage, l'appli affiche aussitôt le catalogue de la visite précédente, puis relit la
// base en arrière-plan et ne redessine que si quelque chose a changé. Seul le catalogue PUBLIC
// est gardé (ce que voit n'importe quel visiteur) : jamais les statuts, notes, dates ni
// commentaires du propriétaire, qui restent lus dans la base à chaque visite.
const CACHE_CLE = 'mabiblio.cache.catalogue';
const CACHE_FORMAT = 1;
let ECRITURES = 0;           // modifications envoyées à la base pendant cette visite
function lisCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_CLE) || 'null');
    if (!c || c.format !== CACHE_FORMAT || c.url !== cfg.url || !Array.isArray(c.livres) || !c.drapeaux) return null;
    return c;
  } catch (e) { return null; }
}
// site : réglages du site lus dans la table « reglages » ({ accueil, pret }), affichés eux aussi
function ecritCache(all, drapeaux, site) {
  try {
    localStorage.setItem(CACHE_CLE, JSON.stringify({ format: CACHE_FORMAT, url: cfg.url, date: new Date().toISOString(),
      drapeaux, site, livres: all }));
  } catch (e) {
    try { localStorage.removeItem(CACHE_CLE); } catch (e2) {}   // appareil plein ou stockage refusé : tant pis
  }
}
const signatureCatalogue = (all, drapeaux, site) => JSON.stringify([drapeaux, site, all]);
// Redessine la page en cours, sauf si l'on est en train d'écrire dans un champ de la page :
// le nouveau catalogue sera de toute façon affiché à la page suivante.
function redessineSiPossible() {
  const a = document.activeElement;
  if (a && el.app.contains(a) && (/^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName) || a.isContentEditable)) return;
  route();
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
  // appelée une seconde fois quand le catalogue est relu après le cache : on repart de
  // « Tous genres » seul, en gardant le genre choisi s'il existe toujours
  const choix = el.filterGenre.value;
  while (el.filterGenre.options.length > 1) el.filterGenre.remove(1);
  for (const g of sorted) {
    const opt = document.createElement('option');
    opt.value = g; opt.textContent = g;
    el.filterGenre.appendChild(opt);
  }
  if (choix && genres.has(choix)) el.filterGenre.value = choix;
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
    // lettres nordiques et d'Europe centrale qui ne sont pas des lettres accentuées,
    // donc que NFD ne simplifie pas : « nesbo » doit trouver Jo Nesbø
    .replace(/ø/g, 'o').replace(/ß/g, 'ss').replace(/[đð]/g, 'd').replace(/ł/g, 'l')
    .replace(/þ/g, 'th').replace(/ı/g, 'i')
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

