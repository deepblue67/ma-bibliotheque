// Ma Bibliothèque — demarrage.js (7/7) : visionneuse, raccourcis clavier, routage et démarrage de l'appli.
// Les sept fichiers js/ forment un seul programme, chargé par index.html dans l'ordre indiqué.
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

  if (!authorMatch) SAGA_CIBLE = null;
  if (hash === '#/settings') renderSettings();
  else if (hash === '#/sagas') renderSagas();
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
  if (!(authorMatch && allerALaSaga(authorMatch[1]))) window.scrollTo(0, back || 0);
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
if (el.sagasBtn) el.sagasBtn.addEventListener('click', () => { location.hash = '#/sagas'; });

// ---------------------------------------------------------------
// Démarrage
// ---------------------------------------------------------------
syncStatusFilterVisibility();

(async function init() {
  // la session Supabase est lue sur l'appareil (pas d'attente réseau) ; ses changements
  // (connexion, déconnexion, session expirée) remettent l'appli dans le bon mode
  try {
    const { data } = await sb.auth.getSession();
    OWNER = estProprietaire(data && data.session);
    OWNER_EMAIL = (data && data.session && data.session.user && data.session.user.email) || '';
    sb.auth.onAuthStateChange((evenement, session) => {
      OWNER_EMAIL = (session && session.user && session.user.email) || '';
      const maintenant = estProprietaire(session);
      if (maintenant !== OWNER) { setOwner(maintenant); route(); }
    });
  } catch (e) { OWNER = false; }
  syncStatusFilterVisibility();

  // 1. catalogue de la visite précédente, s'il y en a un : affiché tout de suite
  const cache = lisCache();
  let affiche = null;             // signature du catalogue à l'écran
  if (cache) {
    const site = cache.site || {};
    SITE.accueil = site.accueil || null;
    REGLAGES_READY = site.pret === undefined ? null : site.pret;
    affiche = signatureCatalogue(cache.livres, cache.drapeaux, etatSite());   // avant que l'appli n'enrichisse les livres
    appliqueCatalogue(cache.livres, cache.drapeaux);
    syncStatusFilterVisibility();
    await loadPrivate();          // propriétaire : ses statuts avant le premier affichage
    route();
  }

  // 2. la base
  const ecritures = ECRITURES;
  const [r] = await Promise.all([litCatalogue(), chargeReglagesSite()]);
  if (r.error) {
    // sans cache : message d'erreur, comme avant ; avec cache : on garde ce qui est affiché
    if (!cache) afficheErreurChargement(r.error);
    return;
  }
  ecritCache(r.all, r.drapeaux, etatSite());
  if (cache) {
    // une modification faite entre-temps est déjà à l'écran : on ne la recouvre pas
    if (ECRITURES !== ecritures) return;
    if (signatureCatalogue(r.all, r.drapeaux, etatSite()) === affiche) return;   // rien n'a changé
  }
  appliqueCatalogue(r.all, r.drapeaux);
  syncStatusFilterVisibility();   // la pastille « En cours » dépend de la base chargée
  PRIVATE_LOADED = false;         // les livres ont été remplacés : leurs données privées sont à remettre
  REVIEWS_LOADED = false;
  await loadPrivate();            // ne fait rien pour un visiteur
  if (cache) redessineSiPossible(); else route();
})();
