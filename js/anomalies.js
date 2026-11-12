// Ma Bibliothèque — anomalies.js (5/7) : écran des anomalies.
// Les sept fichiers js/ forment un seul programme, chargé par index.html dans l'ordre indiqué.
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

  let { error } = await ecritLivre(garde, payload);
  if (error) return false;
  ({ error } = await majBooks(absorbe.id, { is_hidden: true }));
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
  const { error } = await majBooks(book.id, payload);
  if (error) return 'erreur';
  if (!book.source_title) book.source_title = book.title;
  book.title = next;
  rebuildSearch();
  return 'ok';
}

