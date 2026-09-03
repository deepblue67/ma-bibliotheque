// ===========================================================
// Ma Bibliothèque — application (vanilla JS, pas de build)
// ===========================================================

const cfg = window.SUPABASE_CONFIG;
const sb = window.supabase.createClient(cfg.url, cfg.anonKey);

const el = {
  app: document.getElementById('app'),
  search: document.getElementById('search-input'),
  filterFormat: document.getElementById('filter-format'),
  filterGenre: document.getElementById('filter-genre'),
  filterStatus: document.getElementById('filter-status'),
  controls: document.getElementById('controls'),
  menuToggle: document.getElementById('menu-toggle'),
  lightbox: document.getElementById('lightbox'),
  lightboxImg: document.getElementById('lightbox-img'),
  lightboxClose: document.getElementById('lightbox-close'),
};

let ALL_BOOKS = [];      // liste plate {id, title, author_id, author_name, ...}
let AUTHORS = new Map(); // id -> {id, name, name_sort, books:[...]}
let LOADED = false;

const FORMAT_LABEL = { ebook: 'Ebook', pdf: 'PDF', audio: 'Audio' };

// ---------------------------------------------------------------
// Chargement des données (une fois, tout le catalogue est petit)
// ---------------------------------------------------------------
async function loadLibrary() {
  // Supabase/PostgREST ne renvoie que 1000 lignes max par requête : on doit
  // paginer avec .range() jusqu'à avoir tout récupéré (le catalogue fait
  // ~1900 livres, donc 2 pages). Sans ça, seuls les ~1000 premiers livres
  // (selon l'ordre interne de la table) s'affichaient, ce qui coupait aussi
  // des auteurs entiers dont tous les livres tombaient après la limite.
  const PAGE_SIZE = 1000;
  let data = [];
  let offset = 0;
  while (true) {
    const { data: page, error } = await sb
      .from('books')
      .select(`
        id, title, has_ebook, has_pdf, has_audio,
        is_read, is_listened, is_favorite,
        genre, cover_path, source_note,
        author_id, authors ( id, name, name_sort )
      `)
      .order('id', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

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

  ALL_BOOKS = data.map(b => ({
    id: b.id,
    title: b.title,
    author_id: b.author_id,
    author_name: b.authors ? b.authors.name : 'Auteur inconnu',
    author_name_sort: b.authors ? b.authors.name_sort : 'zzz',
    has_ebook: b.has_ebook, has_pdf: b.has_pdf, has_audio: b.has_audio,
    is_read: b.is_read, is_listened: b.is_listened, is_favorite: b.is_favorite,
    genre: b.genre || 'Non classé',
    cover_path: b.cover_path,
    source_note: b.source_note,
  }));

  AUTHORS = new Map();
  for (const b of ALL_BOOKS) {
    if (!AUTHORS.has(b.author_id)) {
      AUTHORS.set(b.author_id, { id: b.author_id, name: b.author_name, name_sort: b.author_name_sort, books: [] });
    }
    AUTHORS.get(b.author_id).books.push(b);
  }

  populateGenreFilter();
  LOADED = true;
  return true;
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

function coverUrl(cover_path) {
  if (!cover_path) return null;
  return `${cfg.url}/storage/v1/object/public/${cfg.coversBucket}/${cover_path}`;
}

function coverTile(book, sizeClass) {
  const url = coverUrl(book.cover_path);
  const initial = (book.title || '?').trim().charAt(0).toUpperCase();
  if (url) {
    return `<div class="cover ${sizeClass||''}"><img src="${url}" alt="Couverture de ${escapeHtml(book.title)}" loading="lazy"></div>`;
  }
  return `<div class="cover ${sizeClass||''}">${escapeHtml(initial)}</div>`;
}

function formatBadges(book) {
  let out = '';
  if (book.has_ebook) out += `<span class="badge">Ebook</span>`;
  if (book.has_pdf) out += `<span class="badge">PDF</span>`;
  if (book.has_audio) out += `<span class="badge">Audio</span>`;
  if (book.is_favorite) out += `<span class="badge fav">★ Favori</span>`;
  if (book.is_read) out += `<span class="badge status">Lu</span>`;
  if (book.is_listened) out += `<span class="badge status">Écouté</span>`;
  return out;
}

function currentFilters() {
  return {
    q: el.search.value.trim().toLowerCase(),
    format: el.filterFormat.value,
    genre: el.filterGenre.value,
    status: el.filterStatus.value,
  };
}

function filtersActive(f) {
  return !!(f.q || f.format || f.genre || f.status);
}

function matchesFilters(b, f) {
  if (f.q) {
    const hay = (b.title + ' ' + b.author_name).toLowerCase();
    if (!hay.includes(f.q)) return false;
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

// ---------------------------------------------------------------
// Rendu — accueil (liste d'auteurs, ou résultats de recherche)
// ---------------------------------------------------------------
function renderHome() {
  const f = currentFilters();

  if (filtersActive(f)) {
    const results = ALL_BOOKS.filter(b => matchesFilters(b, f))
      .sort((a, b) => a.author_name_sort.localeCompare(b.author_name_sort, 'fr') || a.title.localeCompare(b.title, 'fr'));
    renderBookResults(results);
    return;
  }

  const authors = Array.from(AUTHORS.values()).sort((a, b) => a.name_sort.localeCompare(b.name_sort, 'fr'));
  el.app.innerHTML = `
    <div class="section-title">${authors.length} auteurs · ${ALL_BOOKS.length} livres</div>
    <div class="author-grid">
      ${authors.map(a => `
        <a class="author-card" href="#/author/${a.id}">
          <span class="name">${escapeHtml(a.name)}</span>
          <span class="count">${a.books.length} livre${a.books.length > 1 ? 's' : ''}</span>
        </a>
      `).join('')}
    </div>
  `;
}

function renderBookResults(results) {
  if (!results.length) {
    el.app.innerHTML = `<div class="empty">Aucun livre ne correspond à ta recherche.</div>`;
    return;
  }
  el.app.innerHTML = `
    <div class="section-title">${results.length} résultat${results.length > 1 ? 's' : ''}</div>
    <div class="book-grid">
      ${results.map(b => `
        <a class="book-card" href="#/book/${b.id}">
          ${coverTile(b)}
          <div class="info">
            <h3>${escapeHtml(b.title)}</h3>
            <p class="by">${escapeHtml(b.author_name)}</p>
            <div class="badges">${formatBadges(b)}<span class="badge genre">${escapeHtml(b.genre)}</span></div>
          </div>
        </a>
      `).join('')}
    </div>
  `;
}

// ---------------------------------------------------------------
// Rendu — page auteur
// ---------------------------------------------------------------
function renderAuthor(authorId) {
  const author = AUTHORS.get(authorId);
  if (!author) {
    el.app.innerHTML = `<div class="empty">Auteur introuvable.</div>`;
    return;
  }
  const books = author.books.slice().sort((a, b) => a.title.localeCompare(b.title, 'fr'));
  el.app.innerHTML = `
    <a class="back-link" href="#/">← Tous les auteurs</a>
    <div class="author-header">
      <h1>${escapeHtml(author.name)}</h1>
      <span class="count">${books.length} livre${books.length > 1 ? 's' : ''}</span>
    </div>
    <div class="book-grid">
      ${books.map(b => `
        <a class="book-card" href="#/book/${b.id}">
          ${coverTile(b)}
          <div class="info">
            <h3>${escapeHtml(b.title)}</h3>
            <p class="by">${escapeHtml(b.genre)}</p>
            <div class="badges">${formatBadges(b)}</div>
          </div>
        </a>
      `).join('')}
    </div>
  `;
}

// ---------------------------------------------------------------
// Rendu — fiche livre
// ---------------------------------------------------------------
function renderBook(bookId) {
  const book = ALL_BOOKS.find(b => b.id === bookId);
  if (!book) {
    el.app.innerHTML = `<div class="empty">Livre introuvable.</div>`;
    return;
  }
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
        ${url ? `<button class="magnify" id="magnify-btn" aria-label="Agrandir la couverture">🔍</button>` : ''}
      </div>
      <div class="details">
        <h1>${escapeHtml(book.title)}</h1>
        <p class="by-line"><a href="#/author/${book.author_id}">${escapeHtml(book.author_name)}</a> · ${escapeHtml(book.genre)}</p>
        <div class="badges">${formats.map(f => `<span class="badge">${f}</span>`).join('')}</div>

        <div class="toggles">
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

        ${book.source_note ? `<div class="source-note">${escapeHtml(book.source_note)}</div>` : ''}
      </div>
    </div>
  `;

  if (url) {
    document.getElementById('magnify-btn').addEventListener('click', () => openLightbox(url, book.title));
  }

  el.app.querySelectorAll('.toggle').forEach(label => {
    label.addEventListener('click', (ev) => {
      ev.preventDefault();
      const field = label.dataset.field;
      toggleField(book, field, label);
    });
  });
}

async function toggleField(book, field, label) {
  const newValue = !book[field];
  book[field] = newValue; // optimistic
  label.classList.toggle('active', newValue);
  label.querySelector('input').checked = newValue;

  const { error } = await sb.from('books').update({ [field]: newValue }).eq('id', book.id);
  if (error) {
    // rollback
    book[field] = !newValue;
    label.classList.toggle('active', !newValue);
    label.querySelector('input').checked = !newValue;
    alert("La mise à jour n'a pas pu être enregistrée. Vérifie ta connexion et réessaie.");
  }
}

// ---------------------------------------------------------------
// Lightbox
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
el.lightbox.addEventListener('click', (e) => { if (e.target === el.lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

// ---------------------------------------------------------------
// Routage
// ---------------------------------------------------------------
function route() {
  if (!LOADED) return;
  const hash = location.hash || '#/';
  const authorMatch = hash.match(/^#\/author\/(.+)$/);
  const bookMatch = hash.match(/^#\/book\/(.+)$/);

  if (authorMatch) {
    renderAuthor(authorMatch[1]);
  } else if (bookMatch) {
    renderBook(bookMatch[1]);
  } else {
    renderHome();
  }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);

// filtres -> reviennent à l'accueil et rafraîchissent
[el.search, el.filterFormat, el.filterGenre, el.filterStatus].forEach(input => {
  input.addEventListener('input', () => {
    if (location.hash !== '#/' && location.hash !== '') location.hash = '#/';
    else renderHome();
  });
});

el.menuToggle.addEventListener('click', () => {
  el.controls.classList.toggle('open');
});

// ---------------------------------------------------------------
// Démarrage
// ---------------------------------------------------------------
(async function init() {
  const ok = await loadLibrary();
  if (ok) route();
})();
