// Ma Bibliothèque — reglages.js (6/7) : page Réglages, rubrique Style, aide.
// Les sept fichiers js/ forment un seul programme, chargé par index.html dans l'ordre indiqué.
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

      ${setBlock('presentation', "Présentation de l'accueil", renderPresentationBlock())}

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


      ${OWNER ? setBlock('accueil-site', 'Accueil des visiteurs', renderAccueilSiteBlock()) : ''}

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
  wirePresentation();
  wireAccueilSite();
  wireAide();
  el.app.querySelectorAll('.hidden-row button').forEach(b => {
    b.addEventListener('click', () => {
      const book = HIDDEN_BOOKS.find(x => x.id === b.dataset.id);
      if (book) restoreBook(book);
    });
  });
}

// Rubrique « Présentation de l'accueil » (pour tous, version 3.5) : le choix de CET appareil.
// « Par défaut » suit la présentation réglée par le propriétaire pour tout le monde.
function renderPresentationBlock() {
  let perso = null;
  try { perso = localStorage.getItem('mabiblio.accueil'); } catch (e) {}
  const choix = vueValide(perso) ? perso : 'defaut';
  const defaut = vueValide(SITE.accueil) ? SITE.accueil : DEFAULTS.accueil;
  return `
    <div class="segmented" id="presentation-seg" role="group" aria-label="Présentation de l'accueil sur cet appareil">
      <button type="button" data-vue="defaut" class="${choix === 'defaut' ? 'on' : ''}" aria-pressed="${choix === 'defaut'}">Par défaut</button>
      ${VUES_ACCUEIL.map(([k, lib]) => `<button type="button" data-vue="${k}" class="${choix === k ? 'on' : ''}" aria-pressed="${choix === k}">${lib}</button>`).join('')}
    </div>
    <p class="lede" style="margin:0.8rem 0 0; font-size:0.8rem;">
      Comment les auteurs s'affichent sur l'accueil, sur cet appareil. « Par défaut » suit la
      présentation choisie pour tous (actuellement : ${escapeHtml(libelleVue(defaut))}).</p>
    <p class="set-sub" id="ordre-lab">Ordre des auteurs</p>
    <div class="segmented" id="ordre-seg" role="group" aria-labelledby="ordre-lab">
      ${ORDRES_AUTEURS.map(([k, lib]) => `<button type="button" data-ordre="${k}" class="${ordreAuteurs() === k ? 'on' : ''}" aria-pressed="${ordreAuteurs() === k}">${lib}</button>`).join('')}
    </div>
    <p class="lede" style="margin:0.8rem 0 0; font-size:0.8rem;">
      « Alphabétique » range les auteurs par lettre, avec l'index A–Z en haut de l'accueil. Les deux
      autres ordres donnent une seule suite, sans lettres : du plus fourni au moins fourni, ou de celui
      qui a reçu un livre le plus récemment au plus ancien. Choix enregistré sur cet appareil.</p>`;
}
function wirePresentation() {
  document.querySelectorAll('#presentation-seg button').forEach(bt => bt.addEventListener('click', () => {
    try {
      if (bt.dataset.vue === 'defaut') localStorage.removeItem('mabiblio.accueil');
      else localStorage.setItem('mabiblio.accueil', bt.dataset.vue);
    } catch (e) {}
    renderSettings();
  }));
  document.querySelectorAll('#ordre-seg button').forEach(bt => bt.addEventListener('click', () => {
    prefSet('ordre', bt.dataset.ordre);
    renderSettings();
  }));
}

// Rubrique « Accueil des visiteurs » (propriétaire, version 3.4) : la présentation que voit
// en arrivant quiconque n'a pas encore choisi la sienne. Enregistrée dans la base, donc
// valable sur tous les appareils, y compris ceux de la famille.
function renderAccueilSiteBlock() {
  const actuelle = vueValide(SITE.accueil) ? SITE.accueil : DEFAULTS.accueil;
  return `
    <p class="hint-sm" style="margin:0 0 0.8rem; max-width:60ch;">
      La présentation de l'accueil pour tous ceux qui n'en ont pas choisi une autre sur leur
      appareil (rubrique « Présentation de l'accueil » ci-dessus).</p>
    <div class="segmented" id="accueil-site-seg" role="group" aria-label="Présentation de l'accueil par défaut">
      ${VUES_ACCUEIL.map(([k, lib]) => `<button type="button" data-vue="${k}" class="${actuelle === k ? 'on' : ''}" aria-pressed="${actuelle === k}">${lib}</button>`).join('')}
    </div>
    <p class="site-msg" id="accueil-site-msg" aria-live="polite">${
      REGLAGES_READY === false
        ? "La base n'a pas encore la table des réglages : exécute <code>migration_2026-11_reglages.sql</code> dans Supabase (SQL Editor). En attendant, l'accueil s'ouvre sur l'Éventail."
        : ''}</p>
`;
}
function wireAccueilSite() {
  const seg = document.getElementById('accueil-site-seg');
  if (!seg) return;
  const msg = document.getElementById('accueil-site-msg');
  seg.querySelectorAll('button').forEach(bt => bt.addEventListener('click', async () => {
    const v = bt.dataset.vue;
    seg.querySelectorAll('button').forEach(x => { x.disabled = true; });
    msg.className = 'site-msg'; msg.textContent = 'Enregistrement…';
    try {
      await enregistreAccueilSite(v);
      renderSettings();
      const m = document.getElementById('accueil-site-msg');
      if (m) { m.className = 'site-msg ok'; m.textContent = `Enregistré : les visiteurs arrivent sur « ${libelleVue(v)} ».`; }
    } catch (e) {
      const code = e && e.code;
      msg.className = 'site-msg err';
      msg.innerHTML = code === 'PGRST205' || /reglages/i.test((e && e.message) || '')
        ? "La base n'a pas encore la table des réglages : exécute <code>migration_2026-11_reglages.sql</code> dans Supabase (SQL Editor)."
        : code === '42501' || /row-level|aucune ligne/.test((e && e.message) || '')
          ? 'Refusé par la base : ta session a peut-être expiré. Reconnecte-toi, puis recommence.'
          : 'Échec de l’enregistrement (' + escapeHtml((e && e.message) || 'erreur inconnue') + ').';
      seg.querySelectorAll('button').forEach(x => { x.disabled = false; });
    }
  }));
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
                  ${document.getElementById('sagas-btn') ? `<span class="icon-btn">${document.getElementById('sagas-btn').innerHTML}</span>` : ''}
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
        Connecté${OWNER_EMAIL ? ` en tant que <strong>${escapeHtml(OWNER_EMAIL)}</strong>` : ''} :
        tu peux cocher les statuts, noter, corriger un titre et masquer une fiche sur cet appareil.
        Tes visiteurs, eux, ne voient que la bibliothèque.</p>
      <button type="button" class="linkish" id="owner-off">Se déconnecter</button>`;
  }
  let email = '';
  try { email = localStorage.getItem(AUTH_EMAIL_KEY) || ''; } catch (e) {}
  return `
    <p class="lede" style="margin:0 0 1rem; font-size:0.85rem;">
      <strong>Connexion sécurisée.</strong> Saisis l'adresse et le mot de passe de ton compte
      Supabase : une seule fois par appareil, la connexion est ensuite gardée.</p>
    <form class="inline-form" id="auth-form" autocomplete="on">
      <label for="auth-email">Adresse e-mail</label>
      <input type="email" id="auth-email" autocomplete="username" inputmode="email" value="${escapeHtml(email)}" required>
      <label for="auth-password">Mot de passe</label>
      <input type="password" id="auth-password" autocomplete="current-password" required>
      <div class="row"><button type="submit" class="btn-main" id="auth-login">Se connecter</button></div>
      <p class="form-error" id="owner-msg" hidden></p>
    </form>
    <p class="hint-sm" style="max-width:52ch;">
      Le compte se crée dans Supabase (Authentication → Users), pas ici : les inscriptions
      sont fermées, personne d'autre ne peut en ouvrir un.</p>`;
}

// Traduit en clair les refus de Supabase Auth.
function messageConnexion(error) {
  const m = ((error && error.message) || '').toLowerCase();
  if (/invalid login|invalid credentials|invalid_grant/.test(m)) return 'Adresse ou mot de passe incorrect.';
  if (/not confirmed/.test(m)) return "Ce compte n'est pas confirmé : dans Supabase, recrée-le en cochant « Auto Confirm User ».";
  if (/fetch|network|failed/.test(m) || (error && error.status === 0)) return 'Connexion impossible : vérifie ta connexion Internet et réessaie.';
  if (/rate|too many/.test(m)) return 'Trop de tentatives : attends quelques minutes et réessaie.';
  return 'Connexion refusée : ' + ((error && error.message) || 'erreur inconnue') + '.';
}

function wireOwnerBlock() {
  const msg = document.getElementById('owner-msg');
  const off = document.getElementById('owner-off');
  if (off) off.addEventListener('click', async () => {
    off.disabled = true;
    try { await sb.auth.signOut({ scope: 'local' }); } catch (e) {}
    setOwner(false);
    renderSettings();
  });

  const form = document.getElementById('auth-form');
  if (form) form.addEventListener('submit', async ev => {
    ev.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    if (!email || !password) { showFormError(msg, "Saisis ton adresse et ton mot de passe."); return; }
    const btn = document.getElementById('auth-login');
    btn.disabled = true; btn.textContent = 'Connexion…';
    let res;
    try { res = await sb.auth.signInWithPassword({ email, password }); }
    catch (e) { res = { error: { message: 'Failed to fetch', status: 0 } }; }
    btn.disabled = false; btn.textContent = 'Se connecter';
    if (res.error || !estProprietaire(res.data && res.data.session)) {
      showFormError(msg, messageConnexion(res.error));
      return;
    }
    try { localStorage.setItem(AUTH_EMAIL_KEY, email); } catch (e) {}
    OWNER_EMAIL = email;
    if (!OWNER) setOwner(true);   // onAuthStateChange peut l'avoir déjà fait
    renderSettings();
  });
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
        propose la <strong>connexion sécurisée</strong> : ton adresse e-mail et le mot de passe de
        ton compte Supabase, puis « Se connecter ». La connexion reste active sur cet appareil
        jusqu'à ce que tu cliques sur « Se déconnecter », y compris si tu fermes l'onglet ou
        éteins l'appareil. Il faut se connecter une fois sur chaque appareil.</p>
      <p class="hint-sm" style="margin:0;">
        C'est la base elle-même qui protège : sans cette connexion, elle refuse toute
        modification et ne montre ni tes statuts ni tes avis, même à quelqu'un qui contournerait
        l'application. Mot de passe oublié : dans Supabase → Authentication → Users, supprime ton
        compte et recrée-le avec un nouveau mot de passe ; rien d'autre n'est à changer, tes
        statuts et avis ne sont pas rattachés au compte.</p>`,
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
        renseignée » : de quoi les compléter peu à peu. Toucher une ligne ouvre la fiche du livre.</p>
      <p class="hint-sm" style="margin:0.8rem 0 0;">
        <strong>Graphiques</strong> (version 3.6), sous « Où j'en suis » : la répartition de tes
        notes de 1 à 10, et le nombre de livres terminés chaque mois — les douze derniers mois, ou
        une année au choix dans le menu. Survoler ou toucher une barre affiche sa valeur. Seuls les
        livres dont la date de lecture est renseignée comptent dans le second.</p>
      <p class="hint-sm" style="margin:0.8rem 0 0;">
        <strong>Toutes les sagas</strong> (version 3.6) : l'icône des livres alignés, dans le bandeau,
        ouvre la liste de toutes les sagas — pour tout le monde. En mode propriétaire, chaque saga
        montre en plus où tu en es (« 3 lus sur 5 », un livre écouté compte comme lu) et ses tomes
        absents, et un menu « Lecture » ne garde que les sagas commencées, terminées ou à commencer.
        Toucher une saga ouvre la page de l'auteur, directement à cette saga.</p>`,
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

