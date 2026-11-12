// Ma Bibliothèque — livres.js (3/7) : page auteur, fiche livre, correction de titre, masquage.
// Les sept fichiers js/ forment un seul programme, chargé par index.html dans l'ordre indiqué.
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
      ${g.nom ? `<div class="serie-head" data-saga="${escapeHtml(g.nom)}">
          <span class="s-nom">${escapeHtml(g.nom)}</span>
          <span class="s-cnt">${g.livres.length} tome${g.livres.length > 1 ? 's' : ''}</span>
        </div>${OWNER ? tomesAbsents(g.livres) : ''}` : (groupes.length > 1 ? `<div class="serie-head hors">
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

// Tomes absents d'une saga (version 3.2, propriétaire seulement) : les numéros
// entiers manquants entre 1 et le plus grand tome possédé. On ne connaît pas la
// longueur réelle de la saga, donc rien n'est dit des tomes qui suivraient le
// dernier possédé. « 1, 2, 8 à 10 » : trois numéros consécutifs ou plus forment
// une plage.
function plagesTomes(nums) {
  const out = [];
  for (let i = 0; i < nums.length; ) {
    let j = i;
    while (j + 1 < nums.length && nums[j + 1] === nums[j] + 1) j++;
    if (j - i >= 2) out.push(`${nums[i]} à ${nums[j]}`);
    else for (let k = i; k <= j; k++) out.push(String(nums[k]));
    i = j + 1;
  }
  return out.join(', ');
}
function numerosAbsents(livres) {
  const presents = new Set(livres.map(b => Number(b.series_index))
    .filter(n => Number.isInteger(n) && n >= 1));
  if (!presents.size) return [];
  const max = Math.max(...presents);
  const manque = [];
  for (let n = 1; n < max; n++) if (!presents.has(n)) manque.push(n);
  return manque;
}
function tomesAbsents(livres) {
  const manque = numerosAbsents(livres);
  if (!manque.length) return '';
  return `<p class="s-manque">Tome${manque.length > 1 ? 's' : ''} absent${manque.length > 1 ? 's' : ''} : ${plagesTomes(manque)}
    <span class="s-prive">· visible de toi seul</span></p>`;
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

  const { error } = await majBooks(book.id, payload);
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
    const { error } = await majBooks(book.id, { is_hidden: true });
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
  const { error } = await majBooks(book.id, { is_hidden: false });
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

  const { error } = await ecritLivre(book, payload);
  if (error) {
    for (const f of Object.keys(payload)) { book[f] = avant[f]; affiche(f, avant[f]); }
    majAvis();
    alert("La mise à jour n'a pas pu être enregistrée. Vérifie ta connexion et réessaie.");
  }
}

