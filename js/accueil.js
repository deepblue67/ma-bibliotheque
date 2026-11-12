// Ma Bibliothèque — accueil.js (2/7) : accueil (présentations, ordre des auteurs, réglages du site) et tri des résultats.
// Les sept fichiers js/ forment un seul programme, chargé par index.html dans l'ordre indiqué.
// ---------------------------------------------------------------
// Accueil : rayon des derniers ajouts + index A–Z + grille d'auteurs
// ---------------------------------------------------------------
function renderHome() {
  const f = currentFilters();

  if (filtersActive(f)) {
    const results = ALL_BOOKS.filter(b => matchesFilters(b, f)).sort(comparateurTri(triActif()));
    renderBookResults(results, auteursTrouves(f));
    return;
  }

  const authors = AUTHOR_ORDER.map(id => AUTHORS.get(id));

  // présentation : celle choisie sur cet appareil (Réglages), sinon celle du site (versions 3.4, 3.5)
  const vue = vueAccueil();
  const corps = list => {
    if (vue === 'liste') return `<ul class="author-list">
      ${list.map(a => `<li><a href="#/author/${a.id}"><span class="nom">${escapeHtml(a.name)}</span><span class="nb">${a.books.length}</span></a></li>`).join('')}
    </ul>`;
    if (vue === 'eventail') return `<div class="author-grid fan-grid">${list.map(carteEventail).join('')}</div>`;
    if (vue === 'etagere') return `<div class="shelf">${list.map(carteEtagere).join('')}</div>`;
    if (vue === 'mur') return `<div class="wall">${list.map(carteMur).join('')}</div>`;
    return `<div class="author-grid">${list.map(a => authorCard(a)).join('')}</div>`;
  };

  // ordre « nombre de livres » ou « enrichis récemment » (version 3.6) : une seule suite,
  // sans lettres ni index A–Z, qui n'auraient plus de sens
  const ordre = ordreAuteurs();
  if (ordre !== 'alpha') {
    el.app.innerHTML = `
    <p class="ordre-note">Auteurs classés ${ordre === 'livres' ? 'du plus fourni au moins fourni' : 'du plus récemment enrichi au plus ancien'}
      · <a href="#/settings">changer l'ordre</a></p>
    ${corps(authors.slice().sort(comparateurAuteurs(ordre)))}`;
    return;
  }

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
    ${corps(list)}
  `).join('');

  el.app.innerHTML = `
    <div class="home-head">
      <nav class="az" aria-label="Aller à une lettre">${az}</nav>
    </div>
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


// ---- Présentations de l'accueil (version 3.3) ----
// Grille (cartes à quatre emplacements, depuis l'origine), Éventail, Étagère, Mur et Liste
// (version 3.1). Choix mémorisé sur l'appareil (préférence « accueil »).
const VUES_ACCUEIL = [['grille', 'Grille'], ['eventail', 'Éventail'], ['etagere', 'Étagère'], ['mur', 'Mur'], ['liste', 'Liste']];
function couverturesAuteur(a, n) {
  return a.books.filter(b => b.cover_path).concat(a.books.filter(b => !b.cover_path)).slice(0, n);
}
const nbLivres = n => `${n} livre${n > 1 ? 's' : ''}`;
const vueValide = v => VUES_ACCUEIL.some(x => x[0] === v);
// Présentation de l'accueil (version 3.4) : le choix fait sur CET appareil (boutons de
// l'accueil) l'emporte ; sinon la présentation par défaut du site, réglée par le
// propriétaire et lue dans la table « reglages » ; sinon l'Éventail.
function vueAccueil() {
  let perso = null;
  try { perso = localStorage.getItem('mabiblio.accueil'); } catch (e) {}
  if (vueValide(perso)) return perso;
  if (vueValide(SITE.accueil)) return SITE.accueil;
  return DEFAULTS.accueil;
}
const libelleVue = v => (VUES_ACCUEIL.find(x => x[0] === v) || [, v])[1];

// Ordre des auteurs sur l'accueil (version 3.6), choisi sur cet appareil dans les Réglages.
// Les flèches « auteur précédent / suivant » gardent toujours l'ordre alphabétique.
const ORDRES_AUTEURS = [['alpha', 'Alphabétique'], ['livres', 'Nombre de livres'], ['recent', 'Enrichis récemment']];
function ordreAuteurs() {
  const o = prefGet('ordre');
  return ORDRES_AUTEURS.some(x => x[0] === o) ? o : DEFAULTS.ordre;
}
// date du livre le plus récemment ajouté chez cet auteur
const dernierAjout = a => a.books.reduce((m, b) => (b.created_at || '') > m ? (b.created_at || '') : m, '');
function comparateurAuteurs(ordre) {
  const alpha = (a, b) => (a.name_sort || a.name).localeCompare(b.name_sort || b.name, 'fr');
  if (ordre === 'livres') return (a, b) => b.books.length - a.books.length || alpha(a, b);
  if (ordre === 'recent') return (a, b) => {
    const da = dernierAjout(a), db = dernierAjout(b);
    return (db > da ? 1 : db < da ? -1 : 0) || alpha(a, b);
  };
  return alpha;
}

// ---- Réglages du site (version 3.4) : table « reglages », lisible par tous, modifiable par
// le propriétaire seul. Tant que le script SQL n'a pas été exécuté, la table n'existe pas :
// l'appli garde ses valeurs par défaut et la rubrique des Réglages le dit.
const SITE = { accueil: null };
let REGLAGES_READY = null;      // null = pas encore lu ; true = table présente ; false = absente
async function chargeReglagesSite() {
  try {
    const r = await sb.from('reglages').select('cle, valeur');
    if (!r || r.error) {
      REGLAGES_READY = r && r.error && (r.error.code === 'PGRST205' || /reglages/i.test(r.error.message || '')) ? false : null;
      return;
    }
    REGLAGES_READY = true;
    SITE.accueil = null;          // une valeur venue du cache de l'appareil cède la place à la base
    for (const row of r.data || []) if (row.cle === 'accueil_defaut') SITE.accueil = row.valeur;
  } catch (e) { /* hors ligne : on garde les valeurs par défaut */ }
}
// ce qui, des réglages du site, change l'affichage (gardé dans le cache du catalogue, 3.7)
const etatSite = () => ({ accueil: SITE.accueil || null, pret: REGLAGES_READY });
async function enregistreAccueilSite(v) {
  const { data, error } = await sb.from('reglages')
    .upsert({ cle: 'accueil_defaut', valeur: v, updated_at: new Date().toISOString() }, { onConflict: 'cle' })
    .select('cle');
  if (error) throw error;
  if (!Array.isArray(data) || data.length !== 1) throw new Error('aucune ligne enregistrée');
  SITE.accueil = v;
  REGLAGES_READY = true;
}
// Éventail : les couvertures se chevauchent en éventail ; une seule est centrée. Carte toujours pleine.
function carteEventail(a) {
  const pick = couverturesAuteur(a, 5), n = pick.length;
  return `<a class="author-card fan-card" href="#/author/${a.id}">
    <div class="fan" style="--n:${n}">${pick.map((b, i) => `<div class="fan-item" style="--i:${i - (n - 1) / 2}">${coverTile(b)}</div>`).join('')}</div>
    <div class="meta"><span class="name">${escapeHtml(a.name)}</span><span class="count">${a.books.length}</span></div>
  </a>`;
}
// Étagère : les livres debout, côte à côte, sur une planche ; le nom de l'auteur sur l'étiquette.
function carteEtagere(a) {
  const pick = couverturesAuteur(a, 6), reste = a.books.length - pick.length;
  return `<a class="shelf-author" href="#/author/${a.id}" title="${escapeHtml(a.name)} — ${nbLivres(a.books.length)}">
    <div class="shelf-books">${pick.map(b => coverTile(b)).join('')}${reste > 0 ? `<span class="shelf-more">+${reste}</span>` : ''}</div>
    <span class="shelf-name">${escapeHtml(a.name)}</span>
  </a>`;
}
// Mur : une grande couverture par auteur, son nom par-dessus ; une pile derrière quand il a plusieurs livres.
function carteMur(a) {
  const b = couverturesAuteur(a, 1)[0], nb = a.books.length;
  return `<a class="wall-tile ${nb >= 3 ? 'pile3' : nb === 2 ? 'pile2' : ''}" href="#/author/${a.id}">
    ${coverTile(b)}
    <span class="wall-cap"><span class="name">${escapeHtml(a.name)}</span><span class="count">${nbLivres(nb)}</span></span>
  </a>`;
}
// Mini-mosaïque : jusqu'à 4 couvertures de l'auteur, les vraies d'abord.
function authorCard(a, avecSagas = false) {
  const nbSagas = avecSagas ? groupBySeries(a.books).filter(g => g.nom).length : 0;
  const withCover = a.books.filter(b => b.cover_path);
  const rest = a.books.filter(b => !b.cover_path);
  const pick = withCover.concat(rest).slice(0, 4);
  return `
    <a class="author-card" href="#/author/${a.id}">
      <div class="mosaic">${pick.map(b => coverTile(b)).join('')}</div>
      <div class="meta">
        <span class="name">${escapeHtml(a.name)}</span>
        ${avecSagas ? '' : `<span class="count">${a.books.length}</span>`}
      </div>
      ${avecSagas ? `<span class="sagas">${a.books.length} livre${a.books.length > 1 ? 's' : ''}${nbSagas ? ` · ${nbSagas} saga${nbSagas > 1 ? 's' : ''}` : ''} →</span>` : ''}
    </a>`;
}

// Saga « affichable » d'un livre : celle dont l'auteur a au moins deux tomes visibles
// (même règle que la page de l'auteur, cf. groupBySeries). Sinon null.
function sagaDe(b) {
  if (!b.series) return null;
  const a = AUTHORS.get(b.author_id);
  if (!a) return null;
  let n = 0;
  for (const x of a.books) if (x.series === b.series && ++n >= 2) return b.series;
  return null;
}
// Auteurs dont le nom contient tous les mots tapés : affichés en tête des résultats,
// pour aller en un clic à leur page (découpée par saga).
function auteursTrouves(f) {
  if (!f.terms.length) return [];
  return AUTHOR_ORDER.map(id => AUTHORS.get(id))
    .filter(a => a && a.books.length && f.terms.every(t => fold(a.name).includes(t)))
    .slice(0, 8);
}

// ---------------------------------------------------------------
// Tri des résultats (version 3.1) : mémorisé sur l'appareil. « Lus récemment » et « Note »
// reposent sur les données privées : proposés au seul propriétaire connecté.
// ---------------------------------------------------------------
const TRIS = [
  ['auteur', 'Auteur', false],
  ['titre', 'Titre', false],
  ['recent', 'Ajoutés récemment', false],
  ['lus', 'Lus récemment', true],
  ['note', 'Note', true],
];
function trisDisponibles() {
  return TRIS.filter(([cle, , prive]) => !prive || (OWNER && (cle !== 'note' || REVIEWS_READY) && (cle !== 'lus' || REVIEWS_READY)));
}
function triActif() {
  const t = prefGet('tri');
  return trisDisponibles().some(([cle]) => cle === t) ? t : 'auteur';
}
function comparateurTri(tri) {
  const fr = (x, y) => (x || '').localeCompare(y || '', 'fr', { sensitivity: 'base' });
  const parTitre = (a, b) => fr(a.title, b.title) || a.author_name_sort.localeCompare(b.author_name_sort, 'fr');
  if (tri === 'titre') return parTitre;
  // les plus récents d'abord ; sans date, en fin de liste
  const recentD = k => (a, b) => ((b[k] || '') > (a[k] || '') ? 1 : (b[k] || '') < (a[k] || '') ? -1 : 0) || parTitre(a, b);
  if (tri === 'recent') return recentD('created_at');
  if (tri === 'lus') return recentD('finished_on');
  if (tri === 'note') return (a, b) => (b.rating || 0) - (a.rating || 0) || parTitre(a, b);
  // par auteur : les tomes d'une saga se suivent dans l'ordre, placés au nom de la saga
  const cle = b => sagaDe(b) || b.title;
  return (a, b) => a.author_name_sort.localeCompare(b.author_name_sort, 'fr')
    || fr(cle(a), cle(b))
    || (sagaDe(a) && sagaDe(b) ? (a.series_index ?? 9999) - (b.series_index ?? 9999) : 0)
    || fr(a.title, b.title);
}
// Petite ligne sous l'auteur, selon le tri : la date qui explique l'ordre.
function ligneTri(b, tri) {
  const jour = d => { const [y, m, j] = String(d).slice(0, 10).split('-'); return `${j}/${m}/${y}`; };
  if (tri === 'recent' && b.created_at) return `<p class="tri-line">ajouté le ${jour(b.created_at)}</p>`;
  if (tri === 'lus' && b.finished_on) return `<p class="tri-line">lu le ${jour(b.finished_on)}</p>`;
  return '';
}

function renderBookResults(results, auteurs = []) {
  if (!results.length && !auteurs.length) {
    el.app.innerHTML = `<div class="empty">Aucun livre ne correspond à ta recherche.</div>`;
    return;
  }
  const tri = triActif();
  el.app.innerHTML = `
    ${auteurs.length ? `
    <div class="section-title">Auteur${auteurs.length > 1 ? 's' : ''} <span class="rule"></span></div>
    <div class="author-grid auteurs-trouves">${auteurs.map(a => authorCard(a, true)).join('')}</div>` : ''}
    <div class="section-title results-head">${results.length} résultat${results.length > 1 ? 's' : ''} <span class="rule"></span>
      ${results.length > 1 ? `<label class="tri-select">Trier par
        <select id="tri-resultats">${trisDisponibles().map(([cle, lab]) => `<option value="${cle}"${cle === tri ? ' selected' : ''}>${lab}</option>`).join('')}</select>
      </label>` : ''}</div>
    <div class="book-grid">
      ${results.map(b => `
        <a class="book-card" href="#/book/${b.id}">
          ${coverTile(b)}
          <div class="info">
            <h3>${escapeHtml(b.title)}</h3>
            <p class="by">${escapeHtml(b.author_name)}</p>
            ${sagaDe(b) ? `<p class="saga-line">${escapeHtml(b.series)}${b.series_index ? ` · tome ${b.series_index}` : ''}</p>` : ''}
            ${ligneTri(b, tri)}
            <div class="badges">${formatBadges(b)}<span class="badge genre">${escapeHtml(b.genre)}</span></div>
          </div>
        </a>`).join('')}
    </div>`;
  const sel = document.getElementById('tri-resultats');
  if (sel) sel.addEventListener('change', () => { prefSet('tri', sel.value); renderHome(); document.getElementById('tri-resultats')?.focus(); });
}

