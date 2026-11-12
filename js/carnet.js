// Ma Bibliothèque — carnet.js (4/7) : toutes les sagas, Mon carnet de lecture et ses graphiques, Mon avis.
// Les sept fichiers js/ forment un seul programme, chargé par index.html dans l'ordre indiqué.
// ---------------------------------------------------------------
// Toutes les sagas (version 3.6) — page ouverte à tous, bouton du bandeau. Une saga est
// la même que sur la page d'un auteur : une série dont au moins deux tomes sont visibles
// (groupBySeries). Le propriétaire connecté voit en plus où il en est (« 3 lus sur 5 »)
// et les tomes absents ; un visiteur ne voit jamais rien de ce qui est privé.
// ---------------------------------------------------------------
const SAGAS = { tri: 'nom', etat: '', q: '' };   // gardé entre deux visites
const SAGAS_TRIS = [
  ['nom', 'Nom de la saga (A → Z)', false],
  ['auteur', 'Auteur (A → Z)', false],
  ['tomes', 'Nombre de tomes', false],
  ['progression', 'Progression de lecture', true],
];
let SAGA_CIBLE = null;   // saga à montrer en arrivant sur la page de son auteur
const livreFini = b => !!(b.is_read || b.is_listened);

function toutesLesSagas() {
  const out = [];
  for (const a of AUTHORS.values()) {
    for (const g of groupBySeries(a.books)) {
      if (!g.nom) continue;
      out.push({ nom: g.nom, auteur: a, livres: g.livres, lus: OWNER ? g.livres.filter(livreFini).length : 0 });
    }
  }
  return out;
}

function sagasFiltrees(toutes) {
  const s = SAGAS;
  const termes = fold(s.q).split(/\s+/).filter(Boolean);
  const liste = toutes.filter(x => {
    if (termes.length && !termes.every(t => fold(x.nom + ' ' + x.auteur.name).includes(t))) return false;
    if (OWNER && s.etat === 'encours' && !(x.lus > 0 && x.lus < x.livres.length)) return false;
    if (OWNER && s.etat === 'finies' && x.lus !== x.livres.length) return false;
    if (OWNER && s.etat === 'jamais' && x.lus !== 0) return false;
    return true;
  });
  const fr = (a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' });
  const parNom = (a, b) => fr(a.nom, b.nom) || fr(a.auteur.name_sort || a.auteur.name, b.auteur.name_sort || b.auteur.name);
  const cmp = {
    nom: parNom,
    auteur: (a, b) => fr(a.auteur.name_sort || a.auteur.name, b.auteur.name_sort || b.auteur.name) || parNom(a, b),
    tomes: (a, b) => b.livres.length - a.livres.length || parNom(a, b),
    // les plus avancées d'abord ; à égalité, celles qui ont le plus de tomes lus
    progression: (a, b) => (b.lus / b.livres.length) - (a.lus / a.livres.length) || b.lus - a.lus || parNom(a, b),
  }[s.tri] || parNom;
  return liste.sort(cmp);
}

function sagaLigne(x) {
  const n = x.livres.length;
  const manque = OWNER ? numerosAbsents(x.livres) : [];
  return `
          <a class="carnet-row saga-row" href="#/author/${x.auteur.id}" data-auteur="${x.auteur.id}" data-saga="${escapeHtml(x.nom)}">
            <div class="saga-covers" aria-hidden="true">${x.livres.slice(0, 5).map(b => coverTile(b)).join('')}</div>
            <div class="saga-txt">
              <span class="c-titre">${escapeHtml(x.nom)}</span>
              <span class="c-auteur">${escapeHtml(x.auteur.name)} · ${n} tome${n > 1 ? 's' : ''}</span>
              ${OWNER ? `<span class="saga-prog${x.lus === n ? ' fini' : ''}">
                <span class="bar" aria-hidden="true"><i style="width:${(x.lus / n * 100).toFixed(1)}%"></i></span>
                <span class="saga-lus">${x.lus === n ? `${n === 2 ? 'les deux' : `les ${n}`} lus ✓` : x.lus ? `${x.lus} lu${x.lus > 1 ? 's' : ''} sur ${n}` : `aucun lu sur ${n}`}</span>
              </span>` : ''}
              ${manque.length ? `<span class="saga-manque">Tome${manque.length > 1 ? 's' : ''} absent${manque.length > 1 ? 's' : ''} : ${plagesTomes(manque)}</span>` : ''}
            </div>
          </a>`;
}

function renderSagas() {
  const toutes = toutesLesSagas();
  if (!OWNER) { SAGAS.etat = ''; if (SAGAS.tri === 'progression') SAGAS.tri = 'nom'; }
  const nbFinies = OWNER ? toutes.filter(x => x.lus === x.livres.length).length : 0;
  const nbEnCours = OWNER ? toutes.filter(x => x.lus > 0 && x.lus < x.livres.length).length : 0;
  const combien = (n, mot) => n ? `${n} ${mot}${n > 1 ? 's' : ''}` : `aucune ${mot}`;

  el.app.innerHTML = `
    <div class="carnet sagas-page">
      <a class="back-link" href="#/">← Retour à la bibliothèque</a>
      <h1>Toutes les sagas</h1>
      <p class="lede">${toutes.length} saga${toutes.length > 1 ? 's' : ''} : les séries dont la bibliothèque a au moins deux tomes.
        Un clic mène à la page de l'auteur, à l'endroit de la saga.</p>
      ${OWNER && toutes.length ? `<p class="lede saga-bilan">Où tu en es : ${combien(nbFinies, 'terminée')}, ${combien(nbEnCours, 'commencée')},
        ${nbFinies + nbEnCours === toutes.length ? 'aucune à commencer' : `${toutes.length - nbFinies - nbEnCours} à commencer`}
        <span class="s-prive">· visible de toi seul</span></p>` : ''}
      ${toutes.length ? `
      <div class="carnet-ctrls">
        <label>Chercher
          <input type="search" id="sagas-q" placeholder="Saga ou auteur…" value="${escapeHtml(SAGAS.q)}" autocomplete="off" enterkeyhint="search">
        </label>
        <label>Trier
          <select id="sagas-tri">${SAGAS_TRIS.filter(t => OWNER || !t[2]).map(([v, l]) =>
            `<option value="${v}" ${SAGAS.tri === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
        </label>
        ${OWNER ? `<label>Lecture
          <select id="sagas-etat">
            <option value="">Toutes</option>
            <option value="encours" ${SAGAS.etat === 'encours' ? 'selected' : ''}>Commencées</option>
            <option value="finies" ${SAGAS.etat === 'finies' ? 'selected' : ''}>Terminées</option>
            <option value="jamais" ${SAGAS.etat === 'jamais' ? 'selected' : ''}>Pas commencées</option>
          </select>
        </label>` : ''}
      </div>
      <p class="carnet-count" id="sagas-count"></p>
      <div class="carnet-list saga-list" id="sagas-list"></div>` : `<div class="empty">Aucune saga pour l'instant.</div>`}
    </div>`;
  if (!toutes.length) return;

  const majListe = () => {
    const liste = sagasFiltrees(toutes);
    document.getElementById('sagas-count').textContent = liste.length === toutes.length
      ? `${liste.length} saga${liste.length > 1 ? 's' : ''}` : `${liste.length} saga${liste.length > 1 ? 's' : ''} sur ${toutes.length}`;
    document.getElementById('sagas-list').innerHTML = liste.length ? liste.map(sagaLigne).join('')
      : `<div class="empty">Aucune saga ne correspond.</div>`;
  };
  const q = document.getElementById('sagas-q');
  q.addEventListener('input', () => { SAGAS.q = q.value; majListe(); });
  for (const [id, cle] of [['sagas-tri', 'tri'], ['sagas-etat', 'etat']]) {
    const sel = document.getElementById(id);
    if (sel) sel.addEventListener('change', () => { SAGAS[cle] = sel.value; majListe(); });
  }
  // le clic retient la saga : la page de l'auteur s'ouvrira à son niveau
  document.getElementById('sagas-list').addEventListener('click', ev => {
    const a = ev.target.closest('.saga-row');
    if (a) SAGA_CIBLE = { auteur: a.dataset.auteur, nom: a.dataset.saga };
  });
  majListe();
}

// Après l'affichage d'une page auteur : si on vient de la page des sagas, on descend
// jusqu'à la saga choisie (le retour arrière retrouve ensuite la position mémorisée).
function allerALaSaga(authorId) {
  const c = SAGA_CIBLE;
  SAGA_CIBLE = null;
  if (!c || c.auteur !== authorId) return false;
  const h = Array.from(el.app.querySelectorAll('.serie-head[data-saga]')).find(x => x.dataset.saga === c.nom);
  if (!h) return false;
  h.scrollIntoView({ block: 'start' });
  return true;
}

// ---------------------------------------------------------------
// Mon carnet de lecture — page privée (mode propriétaire) : « Où j'en suis », les livres
// en cours, et la liste triable/filtrable des livres lus ou écoutés.
// ---------------------------------------------------------------
const CARNET = { tri: 'date-desc', annee: '', format: '', note: '', periode: '' };   // gardé entre deux visites
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
  wireCarnetGraphes(finis);
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
        ${avis && done ? `<p class="lede carnet-lede" id="carnet-annees">Par année : ${parAnnee.join(' · ')}</p>` : ''}
        ${avis && done ? carnetGraphes(finis, annees) : ''}`;
}

// ---- Graphiques du carnet (version 3.6) : répartition des notes et lectures par mois.
// Barres d'une seule couleur (celle du thème), sans bibliothèque externe. La valeur de
// chaque barre s'affiche au survol ou au toucher ; une phrase résume le graphique et
// l'aria-label en donne toutes les valeurs, pour les lecteurs d'écran.
const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const nbLiv = n => `${n} livre${n > 1 ? 's' : ''}`;

function histogramme(cols, legende) {
  const max = Math.max(1, ...cols.map(c => c.n));
  return `
          <div class="h-plot" role="img" aria-label="${escapeHtml(legende + ' — ' + cols.map(c => c.info).join(', '))}">
            <span class="h-max" aria-hidden="true">${max}</span>
            <div class="h-bars">${cols.map(c => `<span class="h-slot${c.n ? '' : ' zero'}" tabindex="0" style="--h:${(c.n / max * 100).toFixed(1)}%"
              data-info="${escapeHtml(c.info)}"><i></i></span>`).join('')}</div>
            <div class="h-libs" aria-hidden="true">${cols.map(c => `<span>${escapeHtml(c.lib)}</span>`).join('')}</div>
            <span class="h-tip" aria-hidden="true" hidden></span>
          </div>`;
}
// Bulle d'une barre (souris, toucher ou clavier) : posée au-dessus de la barre, sans
// jamais déborder du graphique, pour ne pas créer de défilement horizontal sur iPhone.
function montreBulle(slot) {
  const plot = slot.closest('.h-plot'), tip = plot && plot.querySelector('.h-tip');
  if (!tip) return;
  plot.querySelectorAll('.h-slot.on').forEach(x => x.classList.remove('on'));
  slot.classList.add('on');
  tip.textContent = slot.dataset.info;
  tip.hidden = false;
  const pr = plot.getBoundingClientRect(), sr = slot.getBoundingClientRect(), br = slot.firstElementChild.getBoundingClientRect();
  const x = sr.left + sr.width / 2 - pr.left - tip.offsetWidth / 2;
  tip.style.left = Math.max(0, Math.min(x, pr.width - tip.offsetWidth)) + 'px';
  tip.style.top = Math.max(0, br.top - pr.top - tip.offsetHeight - 6) + 'px';
}
function cacheBulle(plot) {
  if (!plot) return;
  plot.querySelectorAll('.h-slot.on').forEach(x => x.classList.remove('on'));
  const tip = plot.querySelector('.h-tip');
  if (tip) tip.hidden = true;
}
document.addEventListener('pointerover', e => { const s = e.target.closest && e.target.closest('.h-slot'); if (s) montreBulle(s); });
document.addEventListener('pointerout', e => {
  const plot = e.target.closest && e.target.closest('.h-plot');
  if (plot && !(e.relatedTarget && plot.contains(e.relatedTarget))) cacheBulle(plot);
});
document.addEventListener('focusin', e => { const s = e.target.closest && e.target.closest('.h-slot'); if (s) montreBulle(s); });
document.addEventListener('focusout', e => { const s = e.target.closest && e.target.closest('.h-slot'); if (s) cacheBulle(s.closest('.h-plot')); });

function grapheNotes() {
  const cpt = Array(11).fill(0);
  for (const b of ALL_BOOKS) {
    const r = Math.round(Number(b.rating));
    if (r >= 1 && r <= 10) cpt[r]++;
  }
  const total = cpt.reduce((a, x) => a + x, 0);
  if (!total) return `<p class="hint-sm">Aucun livre noté pour l'instant.</p>`;
  const cols = [];
  for (let r = 1; r <= 10; r++) cols.push({ lib: String(r), n: cpt[r], info: `${r}/10 : ${nbLiv(cpt[r])}` });
  const max = Math.max(...cpt.slice(1));
  const tete = [];
  for (let r = 1; r <= 10; r++) if (cpt[r] === max) tete.push(r);
  const liste = tete.length > 1 ? tete.slice(0, -1).join(', ') + ' et ' + tete[tete.length - 1] : String(tete[0]);
  return histogramme(cols, 'Répartition des notes') + `<p class="h-resume">${tete.length > 1
    ? `Notes les plus fréquentes : <b>${liste}/10</b> (${nbLiv(max)} chacune, sur ${total} notés).`
    : `Note la plus fréquente : <b>${liste}/10</b> (${nbLiv(max)} sur ${total} notés).`}</p>`;
}

// periode : '' = les douze derniers mois (celui en cours compris) ; 'AAAA' = cette année-là
function moisDeLaPeriode(periode) {
  const out = [];
  if (periode) {
    for (let m = 1; m <= 12; m++) out.push(`${periode}-${String(m).padStart(2, '0')}`);
  } else {
    const [y, m] = todayIso().split('-').map(Number);
    for (let k = 11; k >= 0; k--) {
      const d = new Date(y, m - 1 - k, 1);
      out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
  }
  return out;
}

function grapheMois(finis, periode) {
  const mois = moisDeLaPeriode(periode);
  const cpt = new Map(mois.map(k => [k, 0]));
  for (const b of finis) {
    const k = (b.finished_on || '').slice(0, 7);
    if (cpt.has(k)) cpt.set(k, cpt.get(k) + 1);
  }
  const nomMois = k => `${MOIS_COURTS[Number(k.slice(5, 7)) - 1]} ${k.slice(0, 4)}`;
  const cols = mois.map(k => ({
    // l'initiale du mois ; en janvier, l'année en plus quand la période en couvre deux
    lib: !periode && k.endsWith('-01') ? `${MOIS_COURTS[0][0].toUpperCase()}·${k.slice(2, 4)}` : MOIS_COURTS[Number(k.slice(5, 7)) - 1][0].toUpperCase(),
    n: cpt.get(k), info: `${nomMois(k)} : ${nbLiv(cpt.get(k))}`,
  }));
  const total = cols.reduce((a, c) => a + c.n, 0);
  const sansDate = finis.filter(b => !b.finished_on).length;
  let resume;
  if (!total) resume = `Aucune lecture datée sur cette période.`;
  else {
    const top = mois.reduce((a, k) => cpt.get(k) > cpt.get(a) ? k : a, mois[0]);
    resume = `${nbLiv(total)} sur la période ; le mois le plus chargé : <b>${nomMois(top)}</b> (${cpt.get(top)}).`;
  }
  if (sansDate) resume += ` <span class="h-note">${nbLiv(sansDate)} sans date de lecture ${sansDate > 1 ? 'ne sont' : 'n’est'} pas compté${sansDate > 1 ? 's' : ''}.</span>`;
  return histogramme(cols, 'Lectures par mois') + `<p class="h-resume">${resume}</p>`;
}

function carnetGraphes(finis, annees) {
  if (CARNET.periode && !annees.includes(CARNET.periode)) CARNET.periode = '';
  return `
        <div class="histos">
          <figure class="histo" id="histo-notes">
            <figcaption>Répartition des notes</figcaption>
            ${grapheNotes()}
          </figure>
          <figure class="histo" id="histo-mois">
            <figcaption>Lectures par mois
              <select id="carnet-periode" aria-label="Période du graphique">
                <option value="">12 derniers mois</option>
                ${annees.map(a => `<option value="${a}" ${CARNET.periode === a ? 'selected' : ''}>${a}</option>`).join('')}
              </select>
            </figcaption>
            <div id="histo-mois-corps">${grapheMois(finis, CARNET.periode)}</div>
          </figure>
        </div>`;
}
function wireCarnetGraphes(finis) {
  const sel = document.getElementById('carnet-periode');
  if (!sel) return;
  sel.addEventListener('change', () => {
    CARNET.periode = sel.value;
    document.getElementById('histo-mois-corps').innerHTML = grapheMois(finis, CARNET.periode);
  });
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
    const { error } = await ecritLivre(book, champs);
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

