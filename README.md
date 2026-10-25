# Ma Bibliothèque — Journal de bord du projet

Ce fichier a deux rôles :
1. Permettre à Christophe de se rappeler comment l'application fonctionne.

**À qui sert l'application** : elle est publique et consultée par la famille et les amis de Christophe, pour qu'ils voient quels livres il possède et lui en demandent une copie (ce sont des epubs qu'il donne ; il n'y a pas de prêt). Christophe en est le seul administrateur. Ce point conditionne beaucoup de décisions — voir §4.15.
2. Permettre à une IA (Claude, Codex, etc.) de reprendre rapidement le projet plus tard pour le corriger ou le faire évoluer.

**Ce fichier doit être mis à jour à chaque changement fonctionnel, visuel ou technique important.**

**Version actuellement livrée : 1.7 du 25/10/2026** — affichée en bas de la page Réglages de l'application. Règle et historique : §7.

---

## 1. Objectif du projet

Une bibliothèque numérique personnelle, sous forme d'application web, présentant tous les livres de Christophe (ebooks + livres audio), consultable sur iPhone, iPad et PC.

- Page d'accueil : liste des auteurs.
- Clic sur un auteur : liste de ses livres.
- Recherche par auteur ou titre, filtres par format (ebook / pdf / audio) et par genre.
- Chaque livre peut être marqué indépendamment : lu (liseuse), écouté (audio), favori.
- Couverture affichée sur la fiche de chaque livre (loupe en haut à droite pour l'agrandir).
- Hébergement : GitHub Pages (ou équivalent statique), poussé manuellement par Christophe — Claude ne pousse jamais directement, il fournit seulement les fichiers.
- Backend : Supabase (base de données + stockage des couvertures).

## 2. État d'avancement (mis à jour au fil du projet)

- [x] Inventaire des ebooks (`Mes Ebooks`) et des livres audio (`Mes livres audio`) scannés.
- [x] Dédoublonnage des ebooks (un fichier peut exister en plusieurs copies/formats — une seule fiche par livre).
- [x] Fusion ebooks + audio en une base unique de livres (`books.pkl`), avec formats indépendants par livre.
- [x] Corrections manuelles de métadonnées corrompues (auteurs/titres mal détectés dans quelques epubs).
- [x] Enrichissement via l'API Open Library : recherche de couverture (`cover_i`) et de mots-clés (`subjects`) pour chacun des 1945 livres.
- [x] Attribution d'un genre à chaque livre (règles sur les `subjects` Open Library + table auteur→genre construite à la main en repli).
- [x] Schéma Supabase rédigé (`supabase_schema.sql`) — **à exécuter par Christophe dans Supabase Studio (SQL Editor)**.
- [x] 10 propositions de design envoyées à Christophe pour choix — **en attente de son choix**.
- [x] `final_books.json` généré (1945 livres, genre + couverture candidate pour chacun) — prêt à être importé dès que les tables existent.
- [x] 10 propositions de logo envoyées (`logo_proposals/index.html`) — **choix de Christophe : logo 05 ("Livre courbe")**, recoloré aux couleurs du design retenu (lin/sauge).
- [x] Design retenu par Christophe : **06 — Nordique** (lin `#f4f1ec`, sauge `#7f9c8f`, coins très arrondis, police Libre Franklin).
- [x] Application web construite (dossier `webapp/`) selon le design Nordique : accueil (auteurs), page auteur, fiche livre (couverture + loupe), recherche, filtres (format/genre/statut), cases lu/écouté/favori. Testée en mobile/tablette/desktop et en mode clair/sombre avec des données fictives (le rendu réel dépend des données Supabase, pas encore peuplées).
- [x] Icônes d'écran d'accueil générées (favicon, apple-touch-icon, icônes PWA + version "maskable") à partir du logo choisi.
- [x] Christophe a exécuté `supabase_schema.sql` dans Supabase (tables + bucket `covers` créés).
- [x] Peuplement des tables `authors` (436 lignes) et `books` (1944 lignes) dans Supabase, par lots via l'API REST (clé `service_role`, exécuté depuis le navigateur — voir §4.1).
- [x] Téléversement des 795 couvertures candidates dans le bucket Storage `covers`, avec mise à jour de `cover_path` sur chaque livre correspondant.
- [x] Manifest PWA + icônes (apple-touch-icon).
- [x] Fichiers finaux prêts pour dépôt GitHub par Christophe (le dossier `webapp/` est le contenu à déposer ; livré sous forme d'archive `ma-bibliotheque-webapp.zip`).
- [x] **Bug corrigé (premier test de Christophe)** : `js/app.js` ne récupérait que les 1000 premières lignes de `books` (limite par défaut de Supabase/PostgREST) au lieu des 1944 — ce qui faisait apparaître seulement ~232 auteurs et cachait entièrement certains auteurs (dont Ken Follett, dont les 4 livres se trouvaient après la limite). Corrigé avec une pagination par `.range()` dans `loadLibrary()`. Voir §4.5.
- [x] Outil d'import Supabase autonome livré (`webapp-admin-tools/supabase_import_tool.html`) — voir §4.6.
- [x] **Bug de complétude des couvertures identifié (deuxième retour de Christophe, exemple : Isaac Asimov)** et fonction de recherche automatique de couvertures manquantes ajoutée à l'outil autonome (section 5) — voir §4.7.
- [x] Fonction de couverture manuelle ajoutée à l'outil (section 6, troisième retour de Christophe sur les sites de couverture) — voir §4.8.
- [x] **Barre de recherche disproportionnée sur iPhone corrigée, et croix d'effacement ajoutée sur tous les appareils (dix-septième retour)** — livré le 2026-10-24 — voir §4.28.
- [x] **Synchronisation du 24 octobre 2026 : delta des nouveaux fichiers dans `Mes Ebooks` et `Mes livres audio`** — 4 nouveaux livres et 5 mises à jour de format identifiés, 3 JSON préparés — voir §4.27.
- [x] **L'outil d'import Supabase et le mode d'emploi (PDF) sont désormais accessibles depuis deux liens dans les réglages, réservés au propriétaire** (déployés avec le reste de l'app) — livré le 2026-10-20 — voir §4.26.
- [x] **Récupération automatique des couvertures sur Fnac.com testée puis abandonnée (décision de Christophe)** ; outil d'import par lot (section 9) conservé pour un usage manuel futur — 2026-10-18 — voir §4.25.
- [x] **Confidentialité visiteur : le filtre Statut et les badges ★ Favori/Lu/Écouté ne s'affichent plus qu'en mode propriétaire** — livré le 2026-10-17 — voir §4.24.
- [x] **Mode d'emploi propriétaire, en PDF et dans l'application (rubrique Aide des réglages)** — livré le 2026-10-17 — voir §4.23.
- [x] **Les deux dossiers mal encodés renommés proprement, et les trois dossiers « Team » vérifiés (aucune synchronisation nécessaire)** — fait le 2026-10-17 — voir §4.22.
- [x] **Gestion des séries : page auteur groupée par saga, navigation entre tomes (onzième retour)** — livré le 2026-10-16, migration et import à exécuter — voir §4.16.
- [x] **Mode propriétaire : l'app publique passe en lecture seule pour les visiteurs (dixième retour)** — livré le 2026-10-15, empreinte à configurer — voir §4.15.
- [x] **Recherche insensible aux accents, aux apostrophes et aux ligatures, avec recherche par mots (neuvième retour)** — livré le 2026-10-15 — voir §4.14.
- [x] **Suppression réversible et correction de titre depuis l'app (huitième retour)** — colonnes `is_hidden` et `source_title`, avec la garantie qu'une synchro ne réintroduit rien ; livré le 2026-10-14, migration SQL à exécuter — voir §4.13.
- [x] **Recherche de couvertures assouplie (septième retour)** — la section 5 de l'outil passe de 6 à 22 trouvailles sur un échantillon de 50 ; livrée le 2026-10-14, reste à relancer — voir §4.12.
- [x] **Synchronisation des nouveaux livres audio ajoutés par Christophe (quatrième retour)** — JSON préparés dans `data_sync_2026-09/` puis **importés par Christophe** (vérifié directement dans Supabase le 2026-10-14 : la base est passée de 436 auteurs / 1944 livres à **437 / 1966**) — voir §4.9.
- [x] **Synchronisation d'octobre 2026 (cinquième retour) : nouveaux ebooks ET nouveaux livres audio** — 3 JSON préparés (`*_2026-10.json`) et **importés par Christophe le 2026-10-14**, import vérifié en base (voir §4.10).
- [x] **Refonte ergonomique et système de 10 thèmes avec page de réglages (sixième retour : « l'app est triste et fade »)** — livrée le 2026-10-14 et testée en navigateur ; reste à redéployer sur GitHub — voir §4.11.

## 3. Chiffres clés (dernière mise à jour : 2026-10-16 après les correctifs et l'écran des anomalies, lus directement dans Supabase)

- **433 auteurs** et **1987 livres visibles**, plus **12 fiches masquées** (doublons et fiches cassées conservées comme garde-fous), soit 1999 lignes en base.
- **1319 livres** (~66%) ont une couverture, contre 795 au premier peuplement et 1093 après la première passe de la section 5. **668** n'en ont pas encore.
- **1053 livres** sont rattachés à une saga (§4.16), et plus de 25 titres ont été corrigés depuis l'application, chacun gardant l'orthographe du disque dans `source_title`.
- Le nombre d'auteurs a *baissé* de 443 à 433 : dix fiches d'auteur n'étaient pas des auteurs mais des morceaux de titres ou des noms de co-auteurs mélangés (§4.18, §4.20 et §4.21).
- **L'écran des anomalies est à zéro sur cinq de ses six familles** : plus un doublon, plus un reste de nom de fichier, plus une inversion, plus un nom mal découpé, plus un détail de présentation. Seule subsiste la famille d'information « auteurs sans prénom » (11 lignes, légitimes pour la plupart : Ayerdhal, Collectif, Sempé-Goscinny…).
- Historique des volumes : 436/1944 au premier peuplement → 437/1966 après la synchro de septembre → 443/1999 après celle d'octobre.
- Historique : 436 auteurs / 1944 livres au premier peuplement (sur 1945 fiches préparées à l'origine — un vrai doublon entre deux lots d'import portait sur le même livre de Ken Follett, "Un Monde Sans Fin", et a fusionné en une seule ligne comme prévu par la contrainte d'unicité auteur+titre).
- Répartition des genres (approximative, sujette à amélioration continue) :
  Fantasy, Science-fiction et Policier sont les genres dominants ; environ 10% des livres restent "Non classé" faute de données suffisantes (à affiner au fil du temps en complétant la table auteur→genre dans `genre_mapping.py`).
- **795 livres** (~41%) ont une couverture effectivement téléversée dans le bucket `covers` (`cover_path` renseigné). Les autres restent sans couverture — c'est normal pour une bibliothèque incluant beaucoup de titres anciens ou peu diffusés en langue française ; l'app affiche un visuel de remplacement dans ce cas.

## 4. Architecture technique

### 4.0 Application web (`webapp/` — c'est ce dossier qu'il faut déposer sur GitHub)

Site statique, aucun outil de build nécessaire (pas de npm/webpack) — s'héberge tel quel sur GitHub Pages.

| Fichier | Rôle |
|---|---|
| `index.html` | Page unique de l'application (structure + en-tête + barre de recherche/filtres). |
| `css/style.css` | Thème "Nordique" (lin `#f4f1ec`, sauge `#7f9c8f`, coins très arrondis, police Libre Franklin), avec variante sombre automatique (`prefers-color-scheme`). |
| `js/config.js` | URL Supabase + clé **anon** (clé publique, prévue pour être exposée côté client — ce n'est pas un secret). |
| `js/app.js` | Toute la logique : chargement des livres depuis Supabase, routage par ancre (`#/`, `#/author/<id>`, `#/book/<id>`), recherche/filtres côté client, bascule des statuts lu/écouté/favori, loupe de couverture. |
| `manifest.json` | Manifest PWA (nom, couleurs, icônes) pour l'ajout à l'écran d'accueil. |
| `icons/` | Icônes générées à partir du logo choisi (favicon, apple-touch-icon 180px, icônes PWA 192/512, version "maskable" pour Android). |

L'app charge tout le catalogue en une seule requête au démarrage (le volume — ~1945 livres — le permet sans souci), puis fait la recherche/filtrage/tri directement dans le navigateur : pas de rechargement réseau à chaque frappe.

### 4.1 Pipeline de données (scripts Python, dans ce dossier de travail Claude — pas dans le dépôt final livré)

| Fichier | Rôle |
|---|---|
| `normalize.py` | Fonctions de normalisation des titres/auteurs (pour dédoublonnage et clé de recherche). |
| `build_inventory.py` | Fusionne les clusters ebooks (`clusters.pkl`) avec l'inventaire audio pour produire `books.pkl`. |
| `dedupe.py` | Logique de détection des doublons dans les ebooks. |
| `genre_mapping.py` | Fonction `genre_for(author, subjects)` : détermine le genre d'un livre. |
| `extract_and_merge.py` | Utilitaire pour parser les résultats de recherche Open Library récupérés via le navigateur et les fusionner dans `bookdata_accum.json`. |
| `books.pkl` | Base de données finale des livres après dédoublonnage et corrections manuelles (dictionnaire Python picklé, clé = (auteur normalisé, titre normalisé)). |
| `bookdata_accum.json` | Résultats bruts de la recherche Open Library pour chaque livre (`cover_i`, `subjects`). |
| `final_books.json` | Fusion de `books.pkl` + `bookdata_accum.json` + genre calculé — c'est le fichier prêt à être importé dans Supabase. |
| `supabase_schema.sql` | Script SQL à exécuter une fois dans Supabase Studio pour créer les tables et le bucket de stockage. |
| `prepare_supabase_payload.py` | Génère `authors_payload.json` (464 auteurs) et `books_payload.json` (1945 livres) à partir de `final_books.json`. |
| `generate_population_js.py` | Génère les scripts JS (dans `js_calls/`) qui insèrent les auteurs puis les livres dans Supabase via l'API REST (clé `service_role`, exécutés depuis le navigateur pour avoir un accès réseau réel). |
| `generate_cover_upload_js.py` | Génère les scripts JS qui téléversent les 795 couvertures trouvées vers le bucket `covers` et mettent à jour `cover_path` sur chaque livre. |

**Important sur les secrets** : ces générateurs prennent l'URL et la clé `service_role` en paramètres de ligne de commande et ne les écrivent QUE dans les fichiers `.js` de sortie au moment de l'exécution réelle (jamais committés, jamais publiés). Ne pas les lancer avec les vraies clés avant d'être prêt à peupler la base pour de vrai.

### 4.2 Base de données Supabase

Deux tables (voir `supabase_schema.sql` pour le détail complet) :

- **`authors`** : `id`, `name`, `name_sort`.
- **`books`** : `id`, `author_id`, `title`, `has_ebook`/`has_pdf`/`has_audio` (indépendants), `is_read`/`is_listened`/`is_favorite` (indépendants), `genre`, `openlibrary_subjects`, `cover_path` (chemin dans le bucket `covers`), `source_note`, `needs_review`.

Sécurité (RLS) :
- Lecture publique sur les deux tables (pas de login nécessaire dans l'app).
- Mise à jour publique sur `books` (pour les cases à cocher lu/écouté/favori depuis le frontend, avec la clé `anon`).
- Insertion/suppression réservées à la clé `service_role` (utilisée uniquement par les scripts d'import, jamais dans le frontend).

Stockage :
- Bucket **`covers`**, public en lecture. Les images sont téléversées uniquement via la clé `service_role` (jamais depuis le frontend). **Les images de couverture ne sont jamais commitées sur GitHub** — uniquement stockées dans Supabase Storage.

### 4.3 Secrets

Les clés Supabase (URL, clé `anon`, clé `service_role`) sont stockées **uniquement** dans le fichier local `.env` de ce dossier de travail. Elles ne sont :
- jamais écrites dans un fichier destiné à GitHub,
- jamais incluses dans un artifact publié,
- jamais committées.

Si ce projet est repris plus tard par une nouvelle instance de Claude/Codex, il faudra redemander ces clés à Christophe (ou les retrouver dans le `.env` s'il est toujours présent dans l'environnement de travail).

### 4.4 Couvertures

Source : Open Library uniquement (l'API Google Books s'est révélée inutilisable — quota épuisé rapidement — et n'a donc pas été utilisée en pratique, malgré le plan initial de l'utiliser en priorité).

URL de couverture à partir d'un `cover_i` : `https://covers.openlibrary.org/b/id/{cover_i}-L.jpg`

### 4.5 Bug de pagination corrigé (premier retour de Christophe)

**Symptôme observé** : sur la page d'accueil, seulement ~1000 livres et ~232 auteurs affichés au lieu de 1944/436 ; certains auteurs (dont Ken Follett) totalement absents.

**Cause** : Supabase (PostgREST) limite chaque requête à 1000 lignes par défaut. `loadLibrary()` dans `js/app.js` faisait une seule requête `sb.from('books').select(...)` sans pagination — elle ne récupérait donc que les 1000 premières lignes selon l'ordre interne de la table, ce qui excluait environ 900 livres (dont tous ceux d'auteurs comme Ken Follett, insérés dans un lot tardif).

**Correction appliquée** : `loadLibrary()` boucle maintenant avec `.order('id').range(offset, offset+999)` jusqu'à avoir tout récupéré (2 pages pour ~1944 livres). Testé et confirmé : les 1944 livres, 436 auteurs et 795 couvertures se chargent bien avec cette méthode.

**Au sujet des livres audio de Ken Follett** : vérification faite directement dans le dossier `D:\Christophe\Mes livres audio` — Ken Follett n'y a aucun livre audio (seulement 4 ebooks : *Apocalypse sur commande*, *Code zéro*, *Les Piliers de la Terre*, *Un Monde Sans Fin*). Ce n'était donc pas un bug de données : une fois la pagination corrigée, ses 4 romans s'affichent bien, simplement sans badge "Audio" puisqu'il n'y en a pas dans le dossier source. Si Christophe a des livres audio de Ken Follett stockés ailleurs, il faudra les indiquer pour qu'ils soient ajoutés (voir §4.6).

**Sur les couvertures** : le mécanisme a été vérifié bout en bout (bucket public, URL correcte, 795 couvertures bien présentes en base) — le problème rapporté ("aucune couverture visible") devrait disparaître avec la correction de pagination, puisque les livres chargés changent entièrement. À revérifier après le nouveau déploiement ; si le souci persiste sur des livres précis, le signaler avec le nom d'un livre concerné.

### 4.6 Outil d'import Supabase autonome (`webapp-admin-tools/supabase_import_tool.html`)

À la demande de Christophe (pour ne pas consommer de tokens Claude à chaque nouvelle insertion de données), un outil HTML autonome a été créé : **`webapp-admin-tools/supabase_import_tool.html`**. Il s'ouvre en double-cliquant dessus (aucune installation, aucun serveur) et tourne entièrement dans le navigateur de Christophe, sans jamais passer par Claude.

Fonctions disponibles (numérotées comme dans l'outil) :
1. **Connexion** : URL + clé `service_role`, test de connexion.
2. **Import d'auteurs** : colle/charge un JSON `[{"name": "...", "name_sort": "..."}]`, upsert idempotent (les doublons par `name` sont fusionnés, pas dupliqués).
3. **Import de livres** : colle/charge un JSON de livres (voir format dans l'outil), résout automatiquement l'auteur par nom, ignore les doublons déjà présents (par auteur+titre), et téléverse automatiquement la couverture si un `cover_i` Open Library est fourni.
4. **Téléversement de couvertures seules** : pour ajouter/remplacer des couvertures sur des livres déjà en base, à partir d'un `cover_i` Open Library.
5. **Recherche automatique des couvertures manquantes** : voir §4.7.
6. **Ajouter une couverture trouvée ailleurs (manuel)** : voir §4.8.
7. **Mettre à jour des livres déjà en base (champs choisis)** : pour modifier un ou plusieurs champs (typiquement `has_audio`) sur un livre déjà existant sans toucher au reste — utile quand Christophe ajoute la version audio d'un livre qu'il a déjà en ebook. Format : `[{"author_name": "...", "title": "...", "fields": {"has_audio": true}}]`, résolution par auteur+titre exact comme les autres sections.
8. **Requête personnalisée** : pour un correctif ponctuel (GET/POST/PATCH/DELETE brut vers l'API REST Supabase) — à utiliser avec précaution.
9. **Importer un lot de couvertures (fichiers nommés par identifiant)** : voir §4.25. Christophe choisit plusieurs images dont le nom de fichier est l'identifiant du livre (`<id>.jpg`), l'outil les téléverse toutes et met à jour `cover_path` sur chaque livre correspondant — pratique s'il a téléchargé plusieurs couvertures à la main et veut les associer en une seule fois plutôt qu'une par une avec la section 6.

Christophe doit coller sa clé `service_role` directement dans la page (jamais sauvegardée, jamais envoyée ailleurs qu'à son propre projet Supabase). C'est l'outil à utiliser pour toute correction ou ajout de données futur (nouveaux livres, correctifs de genre, ajout de livres audio manquants, etc.) — Claude peut préparer le JSON à coller, mais l'exécution se fait chez Christophe.

### 4.7 Couvertures manquantes (deuxième retour de Christophe — exemple Isaac Asimov)

**Symptôme observé** : sur la fiche d'Isaac Asimov, la plupart des 34 livres n'ont pas de vraie couverture (visuel de remplacement à la place).

**Cause identifiée** : lors de l'enrichissement initial (`extract_and_merge.py` / recherche Open Library), la recherche utilisait des paramètres stricts (`title=`, `author=`, `language=fre` séparés), ce qui ne trouvait aucun résultat pour plusieurs titres pourtant bien présents sur Open Library (ex. *Fondation et empire*, *Seconde Fondation*, *Les cavernes d'acier*). Une recherche en texte libre, plus souple (`q=<titre> <auteur>`), retrouve la bonne couverture pour la plupart de ces livres. Ce n'est donc pas spécifique à Asimov : cela concerne potentiellement une bonne partie des ~1149 livres actuellement sans couverture dans le catalogue.

**Correction livrée** : une nouvelle section dans l'outil autonome (**section 5 — "Rechercher automatiquement les couvertures manquantes"** de `webapp-admin-tools/supabase_import_tool.html`) permet à Christophe de :
1. Lister tous les livres sans couverture (`cover_path` vide) directement depuis sa base Supabase.
2. Lancer une recherche Open Library en texte libre pour chacun.
3. Voir chaque couverture proposée (miniature + titre/auteur trouvés) avant toute modification — rien n'est appliqué automatiquement. Les correspondances où le nom de l'auteur retrouvé correspond exactement sont marquées « fiable » et pré-cochées ; les autres sont marquées « à vérifier » et laissées décochées par défaut. Deux boutons permettent de cocher uniquement les correspondances fiables ou de tout décocher.
4. Cliquer sur « Téléverser la sélection » pour appliquer uniquement les couvertures cochées (même mécanisme de téléversement que les sections 3/4 : image envoyée dans le bucket `covers`, `cover_path` mis à jour).

Les livres pour lesquels aucune correspondance fiable n'est trouvée (ex. potentiellement *La fin de l'éternité*, *Les robots et l'empire*) restent simplement sans couverture après cette étape — Christophe peut relancer la recherche plus tard (Open Library s'enrichit avec le temps) ou laisser le visuel de remplacement, qui est un comportement normal de l'app.

### 4.8 Pourquoi seulement Open Library, et couverture manuelle (troisième retour de Christophe)

Christophe a demandé si les couvertures pouvaient aussi être cherchées sur d'autres sites (Fnac, etc.). Réponse technique et pratique :

- **Open Library** a une API publique gratuite, sans clé, pensée pour cet usage, avec des URLs d'image directes et stables (`covers.openlibrary.org`) — c'est pour ça qu'elle est utilisée ici.
- **Fnac, Amazon, Babelio et la plupart des sites marchands n'ont pas d'API de couvertures publique.** Aller y chercher une image automatiquement voudrait dire "scraper" leurs pages web, ce qui pose deux problèmes concrets : (1) ces sites bloquent en général ce genre d'accès automatisé (CAPTCHA, blocage d'IP) et surtout (2) le navigateur de Christophe ne peut techniquement pas télécharger l'image pour la mettre dans Supabase à cause des règles de sécurité CORS des navigateurs (une page web ne peut récupérer le contenu binaire d'une image que si le site d'origine l'autorise explicitement, ce que ces sites ne font pas). Google Books avait déjà été essayé au tout début du projet et abandonné pour quota trop restrictif (voir §4.4).
- **La solution retenue** : une nouvelle section dans l'outil (**section 6 — "Ajouter une couverture trouvée ailleurs (manuel)"**). Christophe cherche lui-même l'image sur le site de son choix, l'enregistre sur son ordinateur (clic droit → Enregistrer l'image sous), puis la dépose dans cette section avec le nom exact de l'auteur et du titre — l'outil l'envoie directement dans le bucket `covers` et met à jour le livre. Ça reste un usage strictement personnel (bibliothèque privée de Christophe), pas une republication de l'image.

### 4.9 Synchronisation des nouveaux livres audio (quatrième retour de Christophe)

Christophe a ajouté de nouveaux livres audio dans `D:\Christophe\Mes livres audio` (nouveaux auteurs : Emeric Lebreton ; nouveaux livres chez des auteurs déjà connus : Ken Follett — sagas Kingsbridge et Le Siècle au complet, plusieurs thrillers autonomes —, J.R.R. Tolkien, Olivier Norek, René Barjavel, Michel Bussi, Freida McFadden).

Claude a comparé le contenu actuel du dossier au catalogue existant (`final_books.json`) pour repérer précisément ce qui est nouveau, en faisant attention à deux pièges :
- Un dossier `Michel Bussi - Nouvelle Babel [mp3-64]2` s'est avéré être une copie en double du livre déjà présent (`Nouvelle Babel [mp3-64]`) — ignoré, pas réimporté.
- Plusieurs livres audio ajoutés (2 Ken Follett, 3 J.R.R. Tolkien, 1 Olivier Norek, 1 René Barjavel) correspondent à des livres **déjà présents en ebook** dans la base — dans ce cas il ne faut pas créer une nouvelle fiche, juste activer `has_audio` sur la fiche existante. C'est exactement pour ce cas de figure que la section 7 de l'outil ("Mettre à jour des livres déjà en base") a été ajoutée.

Trois fichiers JSON prêts à coller ont été préparés dans `data_sync_2026-09/` (à utiliser dans cet ordre) :
1. `1_nouveaux_auteurs.json` → section 2 de l'outil (1 nouvel auteur : Emeric Lebreton).
2. `2_nouveaux_livres.json` → section 3 de l'outil (23 nouveaux livres audio, avec couverture Open Library incluse quand elle a pu être retrouvée).
3. `3_mise_a_jour_has_audio.json` → section 7 de l'outil (7 livres déjà en base à passer en `has_audio: true`).

Points signalés à Christophe pour vérification (champ `needs_review: true` dans le JSON) :
- *La Fraternité de l'Anneau* (Tolkien) est une traduction différente du même livre que l'ebook déjà en base *La Communauté de l'Anneau* — laissée en fiche séparée plutôt que fusionnée automatiquement.
- *Dans les brumes de Capelans* (Olivier Norek, tome 4 Capitaine Coste) et le titre exact du t10 de Freida McFadden n'ont pas pu être confirmés sur Open Library.
- *Les dessous de la femme de ménage* (Emeric Lebreton) : ni l'auteur ni le titre n'ont été retrouvés sur Open Library ; la nature exacte de ce contenu n'a pas pu être vérifiée par Claude.

### 4.10 Synchronisation d'octobre 2026 (cinquième retour) — ebooks + audio

Christophe a ajouté des fichiers **dans les deux dossiers sources** (`D:\Christophe\Mes Ebooks` et `D:\Christophe\Mes livres audio`). Claude a recalculé le delta le 2026-10-14.

**Méthode employée (à reproduire pour les prochaines synchros)** — le dossier de travail de la session de septembre n'existait plus, donc la référence n'était plus `final_books.json` mais **la base Supabase elle-même**, lue en direct (1966 lignes auteur+titre+formats, via l'API REST et la clé `anon` depuis le navigateur). Côté disque, deux sources ont servi de comparaison :
- les inventaires laissés par la session de septembre : `Mes Ebooks\_scan_output\inventaire_ebooks.jsonl` (5246 fichiers, avec métadonnées epub) et `Mes livres audio\_scan_output\inventaire_audio.jsonl` (34 dossiers) ;
- le listage actuel des deux dossiers, comparé à ces inventaires.

Les métadonnées réelles (`dc:title` / `dc:creator`) des 31 nouveaux epubs ont été relues dans les fichiers eux-mêmes, et non déduites des noms de fichiers.

**Nouveautés trouvées côté ebooks**
- Nouveau dossier `Ken Follett - Pack - 19 ebooks - (1976 à 2019) FR - epub` : 19 romans, dont 2 déjà en base en ebook (*Apocalypse sur commande*, *Code zéro*) et 3 déjà en base **en audio seulement** (*L'Arme à l'œil*, *Les Lions du Panshir*, *Paper Money*) → 14 fiches à créer + 3 `has_ebook` à activer.
- Nouveaux sous-dossiers de dépôt `A - Pour maman\20260817` (6 fichiers) et `A - Pour maman\20260920` (7 fichiers).
- 3 fichiers déposés à la racine de `Mes Ebooks`, dont 2 sont les mêmes fichiers que ceux du nouveau dossier `Nouveauté Septembre 2026` (doublons, importés une seule fois).
- Le dossier `Jean Teulé` est **vide** — rien à importer.

**Nouveautés trouvées côté audio**
- 27 des 39 dossiers audio nouveaux par rapport à l'inventaire de septembre correspondent à la synchro §4.9 **déjà importée** — rien à refaire pour eux.
- Restent 4 livres déjà en base en ebook dont il faut activer `has_audio` et 8 nouveaux livres audio, dont la trilogie *À la Croisée des Mondes* et *La trilogie de la Poussière* de Philip Pullman (seul *La Tour des anges* existait, en ebook).

**Fichiers livrés (à utiliser dans cet ordre)**
1. `1_nouveaux_auteurs_2026-10.json` → **section 2** de l'outil : 6 nouveaux auteurs (John Connolly, Jean-Christophe Rufin, Emmanuel Carrère, J.E. Rowney, Danielle Steel, Hugh Howey).
2. `2_nouveaux_livres_2026-10.json` → **section 3** : 33 nouvelles fiches, dont 19 avec une couverture Open Library incluse.
3. `3_mise_a_jour_formats_2026-10.json` → **section 7** : 7 fiches existantes dont il faut activer un format (3 `has_ebook`, 4 `has_audio`).

**Contrôles passés avant livraison** : les 7 titres de mise à jour correspondent **exactement** (caractère par caractère, apostrophes typographiques comprises) à ceux en base ; aucune des 33 créations ne collisionne avec une fiche existante après normalisation auteur+titre ; aucun doublon interne ; les 6 nouveaux auteurs sont bien absents de la base.

**Pièges rencontrés, à garder en tête**
- *Les fleurs de l'ombre* est rattaché à l'auteur existant **« Rosnay Tatiana »** (et non à un nouvel auteur « Tatiana de Rosnay »), pour ne pas créer un doublon d'auteur. Le nom en base est mal formé ; il pourra être renommé plus tard via la section 8 de l'outil (`PATCH /authors?name=eq.Rosnay Tatiana` avec `{"name":"Tatiana de Rosnay","name_sort":"Rosnay Tatiana"}`).
- *L'Échange* est de **J.E. Rowney** : le nom de fichier (« pour les fans de Freida McFadden ») est un argument marketing, pas l'auteur.
- *La Route du diable* : les métadonnées de l'epub créditent **Laurent Queyssi** (le traducteur) ; l'auteur retenu est Franck Thilliez. Le livre existe en ebook **et** en audio → une seule fiche avec les deux formats.
- *Le Dîner* (Freida McFadden, t10) est **déjà en base** sous le titre mal formé « McFadden Freida - t10 Le Dîner » (idem « McFadden Freida - t9 L'intruse »). Pas réimporté. Ces deux titres mériteraient un nettoyage via la section 7.
- Les couvertures proposées sont souvent celles de l'**édition anglaise** (Open Library ne référence pas toujours l'édition française) : *Night Over Water*, *A Dangerous Fortune*, *The Key to Rebecca*, *Jackdaws*, *The Third Twin*, *Hornet Flight*, *Whiteout*, *Triple*, *Northern Lights*, *The Amber Spyglass*… C'est le même ouvrage, mais la jaquette ne correspondra pas à l'édition que Christophe possède. À remplacer via la section 6 s'il préfère.
- Aucune couverture n'a été retenue quand l'auteur retrouvé sur Open Library ne correspondait pas (ex. *Liaison* de Danielle Steel, où la recherche renvoyait un livre de John Coleman). 14 fiches sur 33 partent donc sans couverture — la section 5 pourra être relancée plus tard.

**Entrées marquées `needs_review: true` (6)** : *La Belle et l'oiseau*, *Les fleurs de l'ombre*, *La Folie Sainte-Hélène*, *L'Échange*, *La Route du diable*, *Liaison*.

**Résultat de l'import (vérifié en base le 2026-10-14)** : les 6 auteurs créés, les 33 livres créés, les 7 mises à jour de formats appliquées. Base à **443 auteurs / 1999 livres**. 19 des 33 nouvelles fiches ont leur couverture ; les 14 sans couverture sont : *Comme un vol d'aigles*, *L'Homme de Saint-Pétersbourg*, *La Belle et l'oiseau*, *Notre-Dame*, *La Main de Dieu*, *La Maison du commandant*, *Les fleurs de l'ombre*, *La Folie Sainte-Hélène*, *V13 : chronique judiciaire*, *Code Yesterday*, *L'Échange*, *La Route du diable*, *Liaison*, *La Communauté des Esprits* — à traiter via la section 6 (dépôt manuel) si Christophe le souhaite, la section 5 ne les retrouvant pas sur Open Library.

**Limite connue de cette passe** : deux dossiers n'ont pas pu être relus, et une addition qui s'y trouverait serait passée inaperçue. `Mes Ebooks\AA- Intégrale de la Team 8-1-2012` (1397 fichiers) est inaccessible aux outils de fichiers — son nom contient un caractère mal encodé sur le disque (octet `0x82` au lieu de `é`), et aucune graphie testée ne l'ouvre ; **le renommer proprement en « AA- Integrale de la Team 8-1-2012 » le rendrait lisible**. `Jovanovic_Enquête sur l'existence des Anges Gardiens` (2 fichiers) a le même problème. Les 31 autres dossiers ont été vérifiés : tous les fichiers qu'ils contiennent sont antérieurs à l'inventaire de septembre, donc inchangés.

### 4.11 Refonte ergonomique et choix du thème (sixième retour : « l'app est triste et fade »)

Christophe a trouvé l'application fade et a demandé une roue crantée ouvrant une page de réglages où choisir entre dix designs selon son humeur.

**Ce qui rendait l'app fade** : la page d'accueil n'était qu'une liste de 443 rectangles blancs portant un nom, alors que la base contient plus de 1000 couvertures — aucune n'était visible avant d'entrer dans une fiche auteur.

**Changements d'ergonomie livrés** (`js/app.js`, `css/style.css`, `index.html`)
- **Mosaïques de couvertures sur les cartes auteur** : chaque carte montre jusqu'à 4 couvertures de l'auteur (les vraies d'abord). C'est le changement qui transforme le plus la page d'accueil.
  - *Correction du 14/10/2026, suite à un retour de Christophe* : la mosaïque était une boîte flexible, donc chez un auteur n'ayant qu'un ou deux livres les vignettes s'étiraient sur toute la largeur de la carte en gardant une hauteur fixe — l'image se retrouvait rognée à l'horizontale et illisible. Elle est désormais une grille de **quatre colonnes égales** avec `aspect-ratio: 2/3` sur chaque vignette : la taille est identique partout (62 × 93 px sur desktop, 33 × 49 px sur mobile) et les emplacements inutilisés restent simplement vides. Les cartes gardent du même coup toutes la même hauteur. **Ne pas repasser la mosaïque en `flex`** : c'est précisément ce qui causait le problème.
- **Jaquettes générées** pour les livres sans couverture : dégradé déterminé par un hachage du titre (donc stable d'une session et d'un appareil à l'autre), avec titre et auteur composés dessus. Les ~900 livres sans couverture ne font plus de trous.
- **Repli automatique** : si une image de couverture ne se charge pas (objet absent du bucket, hors ligne), un écouteur en phase de capture la remplace par la jaquette générée, au lieu d'afficher une icône d'image cassée.
- **Index A–Z collant** et séparateurs de lettre dans la grille d'auteurs : plus besoin de dérouler 443 cartes pour atteindre Tolkien. Le saut se fait par `scrollIntoView` et non par l'URL, pour ne pas polluer l'historique.
- **Rayon « Derniers ajouts »** en défilement horizontal, trié sur `created_at` (colonne qui existait déjà en base mais n'était pas exploitée — l'`id` est un UUID, il ne reflète donc pas l'ordre d'insertion). Désactivable dans les réglages.
- **Mémoire de la position de défilement** par page : revenir d'une fiche à la liste ne renvoie plus en haut.
- **Page de réglages** (`#/settings`, roue crantée en haut à droite) : choix du thème, choix clair/sombre/automatique, affichage du rayon, et un récapitulatif de progression (lus, écoutés, favoris, pourcentage de la bibliothèque).

**Système de thèmes**
Dix thèmes, chacun décliné en variante claire **et** sombre, soit vingt palettes complètes : Nordique (l'ancien), Papier & Grenat, Encre & Or, Terracotta, Cuir & Laiton, Brume, Agrume, Minuit, Botanique, Rétro Pulp. Chaque thème définit ses couleurs, ses rayons d'angle et ses polices (Libre Franklin, Fraunces, Spectral, Space Grotesk ou Archivo, plus IBM Plex Mono pour les mentions techniques).

Fonctionnement : `data-theme` (le thème) et `data-mode` (`auto` | `light` | `dark`) sont posés sur `<html>`. Le CSS définit `:root[data-theme="x"]` pour la variante claire, `:root[data-theme="x"][data-mode="dark"]` pour la sombre, et la même sous `@media (prefers-color-scheme: dark)` pour le mode automatique. Tout le reste de la feuille ne manipule que des variables, jamais de couleur en dur — **c'est la règle à respecter pour toute évolution** : ajouter un onzième thème ne demande que d'ajouter ses blocs de variables.

Le choix est enregistré dans `localStorage` (clés `mabiblio.theme`, `mabiblio.mode`, `mabiblio.rail`), donc **par appareil** : le téléphone et le PC peuvent avoir deux ambiances différentes. Tous les accès sont encadrés par des `try/catch`, l'app fonctionnant sans si le navigateur le refuse. Un petit script en tête de `index.html` applique le thème avant le premier rendu, pour éviter un flash de la mauvaise couleur.

Les blocs CSS des thèmes et les vignettes d'aperçu sont générés par un script (`themes.py` dans le dossier de travail de Claude), à partir d'un tableau de palettes — plus sûr que de les écrire à la main, mais le CSS livré est autonome et se modifie directement si besoin.

**Vérifications effectuées avant livraison** : l'app a été chargée dans un navigateur réel avec des données simulées, en 1280px et en 390px, en clair et en sombre, sur les dix thèmes — aucune erreur JavaScript, aucun débordement horizontal, et la page de réglages, les mosaïques, l'index A–Z, la recherche et les filtres fonctionnent. Le repli des couvertures cassées et le plafonnement du texte des jaquettes dans les mosaïques ont été corrigés à la suite de ces tests.

**À savoir** : `index.html` charge désormais six familles Google Fonts (une seule requête, `display=swap`). C'est plus lourd qu'avant, mais nécessaire pour que les thèmes aient des personnalités typographiques distinctes ; les polices sont mises en cache après la première visite.

### 4.12 Recherche de couvertures beaucoup plus souple (septième retour)

Christophe a remarqué qu'il retrouvait lui-même sur Open Library des livres que l'outil déclarait introuvables, et que ces fiches portaient souvent un titre **anglais**. Diagnostic confirmé, et la cause était ailleurs que prévu.

**Mesure avant de corriger.** Sur un échantillon de 50 livres sans couverture tirés de la base, plusieurs stratégies ont été comparées en conditions réelles :

| Stratégie | Trouvés sur 50 |
|---|---|
| `q = titre + auteur`, 5 résultats (**l'ancienne**) | 6 |
| `q = titre nettoyé + auteur`, 5 résultats | 7 |
| `q = titre nettoyé seul`, 20 résultats, auteur vérifié ensuite | 16 |
| idem + rapprochement par **nom de famille** | **22** |
| Google Books (toutes requêtes) | 0 — **HTTP 429 sur 100 % des appels** |

Deux enseignements :
1. **Ajouter l'auteur à la requête dégrade le résultat.** Open Library classe moins bien quand la requête mélange un titre français et un nom d'auteur. Il vaut mieux chercher le titre seul, ramener 20 résultats, et vérifier l'auteur dans les réponses.
2. **Le rapprochement d'auteur était trop strict.** Les fiches donnent souvent une autre forme du nom (« A. E. van Vogt » pour « Alfred E Van Vogt ») : accepter une correspondance sur le seul nom de famille fait passer de 16 à 22.

Google Books est désormais écarté pour de bon, avec une mesure à l'appui : 429 sur les 50 requêtes, sans clé il n'y a rien à en tirer. Cela confirme le constat de §4.4 et clôt la question.

**Ce qui a changé dans la section 5 de l'outil**
- Jusqu'à trois requêtes par livre, dans l'ordre : titre nettoyé seul (20 résultats), titre brut si différent (20), puis titre + auteur (10) en dernier recours. Arrêt anticipé dès qu'une correspondance parfaite est trouvée, pour ne pas surcharger Open Library.
- **Nettoyage du titre** avant recherche : mentions de tome, crochets, parenthèses, années, et sous-titre après un tiret. « Graal tome 07 » devient « Graal ». Le nom de l'auteur est aussi retiré du titre quand il s'y trouve : « McFadden Freida - t10 Le Dîner » devient « Le Dîner » — sans cette précaution la recherche portait sur le nom de l'auteur.
- **Trois niveaux de confiance** au lieu de deux, parce qu'une édition anglaise ne peut pas être vérifiée sur le titre :
  - **fiable** — même auteur et titre qui se recoupe (édition française retrouvée) : pré-coché, comme avant ;
  - **probable** — même auteur, trouvé en tête d'une recherche sur le titre seul. C'est très probablement le même ouvrage dans une autre langue, mais seul l'œil peut trancher : affiché avec sa vignette et le titre trouvé, **laissé décoché** ;
  - **incertain** — rapprochement faible, affiché et décoché.
- Nouveau bouton **« Cocher aussi les probables »**, à côté de « Cocher les correspondances fiables ».
- **Loupe sur les vignettes** : les miniatures passent de 40 à 58 px de large et un clic ouvre la couverture en grand (version `-L.jpg` d'Open Library) avec, en légende, le titre du livre et celui de la fiche trouvée. Fermeture par la croix, par un clic à côté ou par Échap. Indispensable pour trancher sur le niveau « probable », qu'on ne peut juger qu'à l'œil. Le mécanisme est générique : toute image portant un attribut `data-zoom` devient cliquable.
- Concurrence abaissée de 5 à 4 livres en parallèle (chaque livre déclenche désormais jusqu'à 3 requêtes), et reprise automatique après une réponse 429.

**Résultat attendu sur les 906 livres sans couverture** : environ **360 propositions** (contre une centaine avec l'ancienne méthode), dont la grande majorité au niveau « probable ». Les ~550 restants ne sont réellement pas dans Open Library — pour ceux-là, il reste la section 6 (dépôt manuel d'une image).

**Honnêteté sur ce chiffre** : les 40 % mesurent « une fiche au bon auteur a été trouvée », pas « la couverture est à coup sûr celle de ce livre-là ». C'est précisément pour ça que le niveau « probable » reste décoché. Sur l'échantillon vérifié à l'œil, les rapprochements étaient pourtant bons : *Tout commence mal…* → *The Bad Beginning*, *Le Gouffre de l'Absolution* → *Absolution Gap*, *Le miroir du mort* → *Dead Man's Mirror*, *Tombeau ouvert* → *Grave Peril*.

**Vérifications** : le fichier modifié a été chargé dans un navigateur réel (aucune erreur JavaScript), le moteur de recherche testé avec des réponses simulées sur quatre cas (édition française trouvée, édition anglaise avec nom d'auteur sous une autre forme, titre avec numéro de tome, aucun résultat), puis la logique livrée a été exécutée contre le vrai Open Library sur 40 livres de la base.

### 4.13 Supprimer un doublon et corriger un titre depuis l'app (huitième retour)

Christophe a constaté des doublons et des fautes de frappe dans les titres, et posé la bonne question : comment les corriger depuis l'app **sans que la synchronisation suivante les réintroduise** ?

**Le piège.** La synchro rapproche les fichiers du disque et la base sur le couple auteur + titre. Supprimer une fiche ne suffit donc pas : le fichier est toujours sur le disque, la synchro ne retrouve plus la fiche et la recrée. Corriger un titre est pire : le disque garde l'ancienne orthographe, la synchro crée une **seconde** fiche, et le doublon revient par la porte d'à côté.

**La solution retenue : deux colonnes, aucune table nouvelle.**

- **`is_hidden`** — « supprimer » depuis l'app ne détruit rien, la ligne est marquée masquée. L'app ne l'affiche plus, mais elle reste en base et sert de **pierre tombale** : la synchro la retrouve, conclut que le livre est déjà connu, et n'insère rien.
- **`source_title`** — garde l'orthographe du titre telle qu'elle est sur le disque, pendant que `title` devient ce qui s'affiche. Les imports cherchent sur les deux. Corriger « Germinall » en « Germinal » ne casse donc plus le rapprochement.

L'intérêt décisif est pratique : masquer et renommer sont de simples mises à jour de ligne, et la politique RLS autorise déjà la mise à jour publique de `books`. **Aucun droit à ouvrir, aucune table à créer, la clé `service_role` reste inutile côté app.** C'est ce qui a fait écarter l'alternative (une table de décisions séparée) : plus propre sur le papier, mais deux sources de vérité à tenir et une table de plus en écriture publique, pour un résultat identique.

**Migration** : `migration_2026-10_masquage_et_titres.sql`, à exécuter une fois dans Supabase Studio → SQL Editor. Idempotente, elle crée les deux colonnes, leurs commentaires et deux index.

**Côté application** (`js/app.js`, `css/style.css`)
- Fiche livre : « Corriger le titre » (formulaire en ligne) et « Masquer ce livre » (avec confirmation expliquant que rien n'est effacé).
- Quand un titre a été corrigé, la fiche rappelle discrètement l'orthographe du disque.
- `source_title` n'est figé qu'à la **première** correction : les suivantes ne l'écrasent pas, sinon le lien avec le disque serait perdu.
- Collision détectée avant l'envoi : renommer vers un titre que l'auteur possède déjà est refusé avec une explication, parce que la contrainte d'unicité auteur + titre rejetterait l'écriture. Le message oriente vers le masquage, qui est le bon geste dans ce cas.
- Réglages : section « Livres masqués », avec restauration en un clic.
- Les fiches masquées sont exclues de l'accueil, des recherches, des mosaïques et des comptages.

**Côté outil d'import**
- Section 3 : l'index des livres existants inclut désormais `source_title` **et les fiches masquées** — c'est le cœur de la garantie. Le journal distingue les deux cas (« correspondant à une fiche masquée », « retrouvé grâce au titre d'origine »).
- Section 5 : ne cherche plus de couverture pour une fiche masquée.
- Sections 6 et 7 : résolvent aussi par `source_title`, pour qu'un titre corrigé reste joignable par son orthographe d'origine.

**Repli si la migration n'a pas été lancée.** L'app tente de charger les deux nouvelles colonnes ; si Supabase répond qu'elles n'existent pas, elle recharge sans elles et retire les commandes de correction et de masquage. Sans ce repli, déployer l'app avant d'exécuter le SQL l'aurait rendue totalement vide. **L'ordre reste : SQL d'abord, déploiement ensuite.**

**Vérifications** : 20 contrôles automatisés dans un vrai navigateur. Côté app — correction de titre, conservation de l'orthographe d'origine, non-réécriture à la deuxième correction, refus d'un titre déjà pris, gestion d'une panne réseau, masquage, listage, restauration, absence de débordement sur mobile, et le chemin de repli complet. Côté outil — un scénario avec une fiche masquée, une fiche au titre corrigé et une vraie nouveauté : **seule la nouveauté est insérée**, la fiche masquée n'est pas recréée et le titre corrigé est retrouvé par son orthographe d'origine.

**Reste à faire, non demandé pour l'instant** : la fusion de deux fiches (quand le doublon porte l'ebook et l'autre l'audio, masquer l'une perd un format) et un écran listant les doublons probables. La détection a été testée : elle trouve de vrais doublons — six chez Patricia Cornwell avec un préfixe de numérotation (`13-2004-Signe Suspect` / `Signe suspect`), et `LappeldelAnge` / `L'Appel de l'ange` chez Musso — mais produit aussi du bruit, les tomes d'une même série se ressemblant beaucoup. Ce serait donc un écran de relecture, jamais un nettoyage automatique.

### 4.14 Recherche insensible aux accents (neuvième retour)

**Le défaut.** La recherche comparait les chaînes brutes en minuscules : `(titre + auteur).toLowerCase().includes(saisie)`. Taper « etrange », « menage » ou « brules » sans accent ne trouvait donc rien. **633 des 1999 titres de la base contiennent au moins un accent** — le défaut se rencontrait en permanence sans forcément être identifié comme tel.

**La correction** (`js/app.js`). Une fonction `fold()` met les textes à plat avant comparaison :
- décomposition Unicode NFD puis retrait des diacritiques (« Brûlés » → « brules ») ;
- ligatures `œ` et `æ` traitées à part, car NFD ne les décompose pas (« cœur » → « coeur ») ;
- apostrophes (`’ ‘ \` ´ '`) remplacées par une **espace**, et non supprimées. C'est délibéré : avec une suppression, « Les cavernes d'acier » deviendrait « dacier » et une recherche sur « acier » échouerait. Avec une espace, les deux fonctionnent ;
- tirets longs ramenés au tiret simple, espaces multiples réduites.

**Recherche par mots.** La saisie est découpée en mots, tous devant être présents, sans contrainte d'ordre : « piliers terre », « follett piliers » ou « dicker enigme » trouvent le bon livre. Auparavant seule une sous-chaîne contiguë fonctionnait.

**Index pré-calculé.** Chaque livre porte un champ `search` calculé au chargement et recalculé après chaque correction de titre, fusion, masquage ou restauration. **Depuis la version 1.2 (§4.32), il ne contient que le titre affiché et l'auteur** — plus `source_title` — avec une seule exception pour les fiches fusionnées. *(Jusqu'à la 1.1, il joignait aussi `source_title`, si bien qu'un livre renommé restait trouvable par son ancienne orthographe.)*

**Vérifications** : 18 cas de recherche dans un vrai navigateur, dont « menage », « MÉNAGE », « coeur », « cœur », « brules », « l'enigme », « d'acier », « chambre 622 », « cavernes asimov », « follett piliers », plus une recherche sans résultat et le retour à la liste des auteurs quand le champ est vidé. Les suites de non-régression (thèmes, masquage/correction, mosaïque, repli sans migration) repassent toutes.

### 4.15 Mode propriétaire (dixième retour)

**Le contexte, découvert tardivement.** L'application ne sert pas qu'à Christophe : **ses proches la consultent pour voir quels livres il possède et lui en demander une copie** (ce sont des epubs qu'il donne, il n'y a pas de prêt). Cela change la nature du produit — c'est un catalogue public, pas un outil personnel — et cela a rendu visible un problème introduit par §4.13.

**Le problème.** L'app est publiée sur GitHub Pages, la clé `anon` est dans le source, et la politique RLS autorise la mise à jour publique de `books` — c'est ce qui fait fonctionner les cases de statut sans authentification. Les boutons « Corriger le titre » et « Masquer ce livre » ajoutés en §4.13 étaient donc **offerts à tous les visiteurs**. Une fausse manœuvre suffisait à faire disparaître une fiche du catalogue sans que Christophe sache laquelle.

**Ce qui a été fait.** Un mode propriétaire, activé par un code, mémorisé par appareil dans `localStorage`. Sans lui, l'app est en lecture seule : pas de boutons de correction ni de masquage, pas de cases de statut, pas de section « Livres masqués », pas de statistiques personnelles. Les thèmes, la recherche et les filtres restent accessibles à tous.

Pour un visiteur, les statuts deviennent de simples étiquettes affichées uniquement quand elles sont vraies, et « Favori » se lit « ★ Coup de cœur ».

**Le code n'est pas stocké en clair.** `config.js` ne contient que l'empreinte `SHA-256("mabiblio:" + code)`. La page de réglages sait générer cette empreinte à partir d'un code saisi, de sorte que le code lui-même n'a à être écrit nulle part — ni dans le dépôt, ni dans une conversation.

**Mise en service, en deux déploiements** (la première version déployée est en lecture seule pour tout le monde, y compris Christophe) :
1. déployer, ouvrir les réglages → « Mode propriétaire » → saisir un code → « Générer l'empreinte » ;
2. recopier la ligne `ownerHash: "…"` dans `js/config.js`, redéployer, puis saisir le code pour déverrouiller.

L'empreinte peut aussi être calculée hors de l'app avec n'importe quel outil SHA-256, la chaîne hachée étant `mabiblio:<code>`.

**Limite assumée, écrite dans le code et dans l'interface.** Ce n'est **pas une serrure**, c'est un garde-fou contre les fausses manœuvres. La clé `anon` et les droits d'écriture restent publics : quelqu'un de déterminé qui lirait le source pourrait appeler l'API directement. La seule fermeture réelle serait de retirer le droit d'écriture publique sur `books` et de passer par une authentification Supabase — plus lourd, et non retenu pour un usage familial.

**Choix de conception** : tant qu'`ownerHash` est vide, l'app est en lecture seule plutôt qu'ouverte à tous. Un défaut fermé vaut mieux qu'un défaut ouvert sur une page publique.

**Vérifications** : 19 contrôles en navigateur — état non configuré (aucune commande visible, sections privées masquées, thèmes toujours accessibles), code refusé, code accepté, persistance après rechargement, sortie du mode, et le générateur d'empreinte (empreinte correcte, code absent de l'affichage, code trop court refusé). Les cinq suites de non-régression repassent.

### 4.16 Gestion des séries (onzième retour)

**Le problème.** La page d'un auteur était une liste alphabétique. Chez G.J. Arnaud, 43 titres dont **40 forment une seule saga**, *La Compagnie des Glaces* : le tome 1 se retrouvait coincé entre le tome 8 et un livre sans rapport. Impossible de savoir par où commencer ni quel tome suit lequel — ce qui compte d'autant plus que l'app sert à des visiteurs qui découvrent la bibliothèque.

**D'où vient l'information.** Des noms de dossiers et de fichiers déjà enregistrés dans `source_note`, où la saga et le tome figurent entre crochets : `Arnaud,G.J.-[La Compagnie des Glaces-7]Le Gnome halluciné`. **Aucune recherche extérieure, aucune déduction** — on ne lit que ce qui est écrit.

**Résultat de l'extraction** : 1084 livres portent un marqueur de série, regroupés en **199 séries couvrant 1051 livres** sur 1999. Les 948 autres restent affichés comme avant.

Règles appliquées, et pourquoi :
- **Les séries sont rattachées à un auteur.** « Juge Ti » de Robert Van Gulik et « Juge Ti NE » de Frédéric Lenormand restent donc deux séries distinctes, ce qui est correct.
- **Une série dont un seul tome est présent est écartée** (33 cas) : regrouper un livre seul n'apporte rien. La règle est appliquée deux fois — à l'extraction, et à l'affichage, car un masquage ultérieur peut ramener une série à un seul tome.
- **Les marqueurs de qualité audio sont exclus.** Les dossiers de livres audio portent `[mp3-64]`, que le motif capturait comme une série « mp3 » au tome 64. Trois faux positifs écartés.
- **Le nom affiché est la graphie la plus fréquente** parmi les fichiers de la série.

**Côté base** : `migration_2026-10_series.sql` ajoute `series` (texte) et `series_index` (entier), plus un index `(author_id, series, series_index)`. Les valeurs sont posées par `4_series_2026-10.json` (1051 entrées) via la **section 7** de l'outil, celle qui met à jour des champs sur des livres existants — aucun outillage nouveau. Chaque entrée a été vérifiée : son couple auteur + titre est unique en base, donc aucune ambiguïté de résolution.

**Côté application**
- Page auteur : un bloc par saga, dans l'ordre des tomes, les sagas les plus fournies d'abord, puis une section « Hors série ». Le numéro de tome précède le titre.
- Fiche livre : un bandeau donnant la saga, le numéro du tome et des liens vers le tome précédent et suivant.
- **Le total affiché est celui des tomes possédés, pas celui de la saga.** Bob Morane est numéroté jusqu'à 105 et Christophe en a 32 : afficher « tome 7 sur 105 » serait trompeur, et la navigation ne propose jamais un tome absent de la bibliothèque.

**Repli indépendant.** Le chargement demande séparément les colonnes des deux migrations d'octobre. Sans la migration « séries », l'app retombe sur une liste alphabétique **tout en gardant** les commandes de correction et de masquage — et réciproquement. Le repli groupé initial aurait désactivé le mode propriétaire à cause d'une colonne de série absente ; c'est précisément le cas testé.

**Document de relecture** : `series-detectees.xlsx` liste les 199 séries (tomes, bornes, numéros absents, alertes) et, sur un second onglet, chacun des 1051 livres avec son numéro. Christophe peut écarter une série en écrivant « non » dans la première colonne avant l'import.

**Deux numéros en double**, signalés dans le classeur : chez Charlaine Harris deux livres portent le n°11, ce qui est exact (un recueil s'intercale) ; chez Anthony E. Zuiker, deux fiches portent le n°1 — ce sont deux exemplaires de *Level 26*, un doublon à masquer.

**Vérifications** : 15 contrôles d'affichage (ordre des tomes, section hors série, série à un tome retombant en hors série, bandeau, navigation, bornes de début et de fin, livre sans série, mobile) et 7 sur le repli sans migration. Les six autres suites repassent. Deux échecs apparus en cours de route venaient du banc d'essai — le faux Supabase renvoyait des colonnes non demandées, là où PostgREST ne renvoie que celles du `select` — et non de l'application.

### 4.17 Passer d'un auteur au suivant sans repasser par la grille (douzième retour)

**Le problème.** Avec 443 auteurs, feuilleter la bibliothèque demandait un aller-retour permanent : ouvrir Coben, revenir à la grille, retrouver sa place, ouvrir Connelly. Christophe a proposé deux flèches, gauche et droite, dans les marges de la page auteur — en précisant que ce devait être propre sur iPad et iPhone aussi.

**L'ordre est celui de la grille.** Les flèches et la page d'accueil partagent désormais la même liste ordonnée (`AUTHOR_ORDER`, construite une fois avec les auteurs). Avancer d'une flèche revient donc toujours à prendre le voisin qu'on voyait dans la grille : les deux ne peuvent plus diverger, même après un masquage qui fait disparaître un auteur.

**Deux présentations pour deux largeurs, un seul code.** Les deux liens ne sont écrits qu'une fois dans la page ; c'est la feuille de style qui les place :
- **Au-delà de 1400px** (le cas de son écran) : pastilles rondes fixes, centrées verticalement, calées dans les marges à l'extérieur du contenu — exactement les carrés rouges de son croquis. Le nom de l'auteur visé apparaît au survol.
- **En deçà** (iPhone, iPad dans les deux sens, petit portable) : une barre normale sous le titre, `← Michel Bussi` à gauche et `Isaac Asimov →` à droite. Le nom est visible, pas seulement la direction.

**Pourquoi pas de bouton flottant sur téléphone.** Deux raisons, et la seconde est la vraie : il n'y a aucune marge où le poser sans recouvrir les livres ; et sur iPhone le bord gauche de l'écran appartient déjà au geste « retour » du système, de sorte qu'un bouton posé là est à la fois difficile à atteindre et gênant. La barre dans le flux ne pose aucun de ces deux problèmes, et elle en dit plus.

**Pourquoi pas de balayage horizontal non plus.** Même conflit avec le geste « retour » de Safari, et un balayage ne dit jamais où l'on va atterrir alors que la pastille affiche le nom.

**Au clavier**, ← et → font la même chose. Les touches sont neutralisées dès qu'on tape dans la zone de recherche (sinon on ne pourrait plus y déplacer le curseur), quand la loupe est ouverte, et partout ailleurs que sur une page auteur.

**Détails de finition** : cible tactile de 44px minimum partout, le minimum recommandé par Apple ; un nom à rallonge est tronqué au lieu de pousser la mise en page ; au premier auteur seule la flèche droite existe, au dernier seule la gauche.

**Vérifications** : 33 contrôles automatisés — ordre identique à la grille, cibles des deux liens, position réelle des pastilles mesurée à l'écran (dans les marges, sans mordre sur les livres, entièrement visibles, centrées), clic, clavier, bornes, neutralisation pendant la saisie et loupe ouverte, puis le rendu sur iPhone (390×844), iPad portrait (1024×1366) et iPad paysage (1366×1024) : aucun bouton en surimpression, aucun débordement horizontal, les deux liens côte à côte, nom lisible. Les sept autres suites repassent.

**Au passage**, un test qui dépendait de ce qu'un autre avait laissé dans `test/js/config.js` écrit désormais lui-même la configuration dont il a besoin : les suites peuvent être lancées dans n'importe quel ordre.

### 4.18 Les six entrées « needs_review » et les auteurs fantômes

**Ce qu'est `needs_review`.** Lors de la synchronisation d'octobre, six fichiers ne permettaient pas de déduire l'auteur ou le titre avec certitude — métadonnées de l'epub contredisant le nom du dossier, titre noyé dans une accroche commerciale, fichier rangé sous un pack au nom d'un autre auteur. Plutôt que de trancher au hasard, l'entrée a été importée avec la meilleure hypothèse **et** le drapeau `needs_review: true`, pour relecture ultérieure.

**Relecture faite le 16/10/2026**, en vérifiant chaque titre auprès de sources extérieures :
- *La Folie Sainte-Hélène*, Jean-Christophe Rufin — **correct**, c'est le tome 7 des énigmes d'Aurel le Consul (2026). Un seul Rufin en bibliothèque, donc pas de série à créer.
- *La Route du diable*, Franck Thilliez — **correct**. Les métadonnées de l'epub créditaient Laurent Queyssi ; c'est bien Thilliez.
- *L'Échange*, J.E. Rowney — **correct**. Le nom de fichier portait « pour les fans de Freida McFadden », simple argument de vente ; l'auteur réel est bien Rowney.
- *Liaison*, Danielle Steel — **correct**.
- *Les fleurs de l'ombre*, Tatiana de Rosnay — livre **correct**, seul le nom de l'auteur était inversé (corrigé, voir plus bas).
- *La Belle et l'oiseau*, Ken Follett — **faux**. Ce titre n'existe dans aucune bibliographie de Follett, et Open Library n'en a aucune trace : la recherche la plus proche renvoie *La Belle et la Bête suivi de L'Oiseau bleu*, de Jeanne-Marie Leprince de Beaumont. La couverture actuellement attachée à cette fiche est donc très probablement celle d'un tout autre livre. Le fichier vient d'un dossier « Ken Follett - Pack - 19 ebooks » ; il faut l'ouvrir pour savoir ce qu'il contient réellement.

**Quatre fiches où l'auteur et le titre avaient été intervertis.** Une requête sur les auteurs dont le nom commence par une minuscule en a sorti trois d'un coup, plus une quatrième au nom inversé :

| Enregistré comme | Réalité | Opération |
|---|---|---|
| auteur « le complot Romanov », titre « modèle » | Steve Berry, *Le Complot Romanov* | fusion avec le Steve Berry existant |
| auteur « la conspiration du Temple », titre identique | Steve Berry, *La Conspiration du Temple* | fusion |
| auteur « gilles legardinier », titre « demain , j'arrete ! » | Gilles Legardinier, *Demain j'arrête !* | renommage |
| auteur « Rosnay Tatiana » (2 livres) | Tatiana de Rosnay | renommage |

**Pourquoi un script SQL et pas l'application.** Le mode propriétaire corrige un titre et masque une fiche — deux `UPDATE` sur `books`, ouverts au rôle public. Déplacer un livre vers un autre auteur et renommer un auteur touchent à `authors`, réservé au `service_role` : cela passe donc par l'éditeur SQL de Supabase, comme les migrations. D'où `correctifs_2026-10_auteurs_et_titres.sql`, idempotent, qui ne supprime les deux fiches d'auteur inventées qu'une fois vérifié qu'aucun livre n'y est plus rattaché.

**Protection contre la prochaine synchronisation.** Chaque titre corrigé reçoit dans `source_title` la graphie telle qu'elle figure sur le disque, le mécanisme déjà en place depuis §4.13. **Attention toutefois** : ce mécanisme protège un titre renommé chez un auteur donné, pas un livre déplacé d'un auteur à l'autre ni un auteur renommé. Les quatre corrections ci-dessus sont donc consignées ici pour que la prochaine synchronisation les reconnaisse au lieu de les reproposer. Les deux romans de Steve Berry sont le cas le moins risqué : leurs fichiers sont déjà rangés dans un dossier « Steve Berry », c'est la métadonnée de l'epub qui avait pris le pas sur le dossier.

**Repéré au passage, non corrigé** : chez Steve Berry, *la prophétie Charlemagne* garde une minuscule initiale. C'est purement cosmétique et Christophe peut le corriger lui-même depuis l'application.

### 4.19 Écran des anomalies, et fusion de deux fiches (treizième retour)

**Demande initiale : deux fonctionnalités.** Fusionner la fiche ebook et la fiche audio d'un même livre, et un écran des anomalies accessible depuis la roue crantée. La mesure a ramené la première à presque rien.

**La fusion ebook/audio était déjà faite — à l'import.** Sur 1999 livres, 49 sont en audio seul. En cherchant les paires restées séparées chez un même auteur, il n'en restait que **trois**, toutes chez Joël Dicker, et toutes pour la même raison : le fichier audio portait le nom de l'auteur en préfixe (« Joel DICKER Le Livre des Baltimore »), ce qui empêchait le rapprochement. Partout ailleurs la synchronisation avait déjà réuni les deux formats sur une fiche (« 2 fichier(s) fusionné(s) » dans `source_note`). « Fusionner » est donc devenu **un bouton de l'écran des anomalies**, sur les lignes « doublon probable », plutôt qu'une fonctionnalité séparée.

**Six familles**, toutes calculées sur les livres déjà chargés — aucune requête de plus, aucun appel extérieur :

| Famille | Sur la bibliothèque réelle | Action proposée |
|---|---|---|
| Doublons probables | 5 | Garder celle-ci → fusion |
| Restes de noms de fichiers | 10 | Corriger (titre pré-rempli) |
| Auteur et titre intervertis | 6 | Copier la liste (correction en SQL) |
| Noms d'auteurs mal découpés | 6 | Copier la liste |
| Détails de présentation | 7 | Corriger |
| Auteurs sans prénom | 12 | Information seule |

**Chaque règle a été élargie puis resserrée sur les vraies données**, car un écran qui crie au loup ne sert à rien. Ce qui a été écarté en chemin :
- La similarité approximative entre titres : elle rapprochait *Les sept sœurs, tome 1* et *tome 3*, ou *Le Juge Ti à l'œuvre (Partie 2)* et *(Partie 3)*. Remplacée par une égalité stricte après nettoyage — titre débarrassé des restes de fichiers, du préfixe « Auteur - » et du nom de l'auteur. Zéro faux positif, et les trois Dicker sont bien vus.
- La suppression des points isolés : elle abîmait *Mr. Brown*, *I.G.H.* et *Un, deux, trois…*. Désormais seul un point **entouré d'espaces** est retiré, celui que laisse la suppression d'un mot technique.
- Le trait d'union comme signe d'un nom mal découpé : il signalait Jean-Christophe Rufin et Arturo Pérez-Reverte. Seules la virgule et la parenthèse sont retenues — elles ne sortent que de noms à quatre mains mélangés (« Philip K.-Zelazny, Roger Dick » pour Philip K. Dick et Roger Zelazny).
- La détection d'inversion par la seule forme du titre : elle signalait Gérard De Villiers et Melissa De La Cruz parce que leur nom contient une particule. Remplacée par trois signes précis — le titre **est** le nom d'un autre auteur du catalogue ; l'auteur tient en un seul mot et le titre ressemble à un nom ; ou le titre finit par « - <nom d'un autre auteur> », la forme même des fichiers `Titre - Auteur.epub` coupés au tiret.

**Ce que l'écran a trouvé du premier coup**, en plus des quatre fiches déjà corrigées en §4.18 : l'auteur **« Souviens »** avec le livre « toi - Mary Higgins Clark » (c'est *Souviens-toi*), l'auteur **« Quand reviendras »** avec « tu - Mary Higgins Clark », l'auteur **« Joyeux Noel Merry Christmas »** avec le livre « Mary Higgins Clark », l'auteur **« Divers Roman »** avec « Attentat - Amelie Nothomb », l'auteur **« Okavango »** avec le livre « Caryl Férey », et six noms d'auteurs à quatre mains mélangés.

**La fusion ne touche que `books`** : la fiche gardée reçoit l'union des formats, la couverture si elle n'en avait pas, la série si elle n'en avait pas, et les deux `source_note` concaténées ; l'autre fiche est **masquée, jamais supprimée** — elle reste en base pour bloquer toute réinsertion, et reste restaurable. Deux `UPDATE`, donc aucun droit nouveau.

**Ce que l'écran ne fait pas, et le dit.** Déplacer un livre vers un autre auteur et renommer un auteur touchent à la table `authors`, réservée au `service_role`. Les deux familles concernées n'affichent donc aucun bouton qui ne pourrait pas fonctionner : elles proposent « Copier la liste », à transmettre pour qu'un script SQL soit préparé.

**Réservé au mode propriétaire** : un visiteur ne voit pas l'écran. C'est un outil d'entretien, et il expose les défauts de la bibliothèque.

**Vérifications** : 37 contrôles sur un jeu d'essai qui contient, à côté de chaque défaut, les cas voisins qu'il ne faut **pas** signaler — tomes successifs d'une série, titres à points légitimes, auteurs à trait d'union, auteurs à particule. Plus la fusion de bout en bout (formats cumulés, fiche masquée, compteur à jour, famille qui reste dépliée), l'échec réseau, et le rendu sur iPhone. Les sept autres suites repassent — 139 contrôles au total.

**Un bogue corrigé en cours de route** : la construction de la clé de rapprochement injectait le nom de l'auteur dans une expression régulière. « Richard(King, Stephen) Bachman » la rendait invalide et faisait planter toute la page des réglages. Les noms sont désormais échappés.

**Ce que l'écran a donné en production, le jour même.** Christophe a fusionné les **6 doublons** proposés — les trois Joël Dicker (audio préfixé du nom de l'auteur), *Le voleur d'ombres* de Marc Levy, *Montségur et l'énigme cathare* de Jean Markale, et *Level 26* d'Anthony E. Zuiker — chaque fusion rendant au livre gardé le format que portait son double. La famille « auteur et titre intervertis » a donné les six lignes traitées par `correctifs_2026-10_inversions.sql` (§4.20).

### 4.20 Les six inversions, et ce qu'elles cachaient

La liste remontée par l'écran ne contenait pas six renommages mais **trois doublons, un déplacement, un échange et un faux positif** — ce que seule la lecture de la base, fiche par fiche, pouvait révéler.

Le dossier « Mary Higgins Clark 30 romans epub pdf » avait été lu deux fois : le sous-dossier EPUB avait donné des fiches correctes, le sous-dossier PDF les mêmes livres avec le nom coupé au tiret (`Souviens-toi - Mary Higgins Clark.pdf` → auteur « Souviens », titre « toi - Mary Higgins Clark »). Les trois PDF ont donc rejoint les fiches existantes, qui gagnent le format PDF, et les fiches cassées sont **masquées et rattachées à Mary Higgins Clark** — conservées comme garde-fous, pas supprimées.

« Okavango » était un titre pris pour un auteur et « Caryl Férey » un auteur pris pour un titre : comme Caryl Férey n'existait pas encore, un simple renommage de la fiche d'auteur a suffi. « Attentat - Amelie Nothomb » a été déplacé chez Amélie Nothomb, qui n'avait pas ce titre. Enfin « Mary Higgins Clark / *Joyeux Noël Merry Christmas* » n'était pas un défaut : cette fiche correcte n'apparaissait que parce que son jumeau cassé portait son nom comme titre.

**Leçon pour la suite** : une ligne de l'écran des anomalies dit *qu'il y a un problème*, pas *lequel*. Avant d'écrire le moindre `update`, il faut regarder si l'auteur visé existe déjà, et s'il possède déjà le titre — sinon on remplace un défaut par une violation de la contrainte d'unicité auteur+titre, ou par un doublon silencieux.

**Repéré, non traité** : chez Amélie Nothomb, *Catilinaires* et *Les catalinaires* sont le même roman. Les titres diffèrent trop pour que la règle des doublons les rapproche ; corriger l'un des deux depuis l'application les fera apparaître d'eux-mêmes dans la première famille.

### 4.21 Les six noms d'auteurs mal découpés, et une saga recollée

Les six cas venaient tous du même mécanisme, lisible dans `source_note` : ces lots nomment **deux auteurs à la suite**, chacun sous la forme « Nom,Prénom », séparés par un tiret —

```
Clarke,Arthur C.-Lee,Gentry-[Rama-3]Les jardins de Rama(…)
```

Le découpage d'origine a pris **le nom du premier et le prénom du second**, d'où « Arthur C.-Lee, Gentry Clarke ». Dans les six cas le premier nommé est l'auteur principal.

| Enregistré comme | Réalité | Opération |
|---|---|---|
| Arthur C.-Lee, Gentry Clarke | Arthur C. Clarke & Gentry Lee | 3 livres déplacés |
| Philip K.-Zelazny, Roger Dick | Philip K. Dick & Roger Zelazny | 1 livre déplacé |
| Robert-Haber, Karen Silverberg | Robert Silverberg & Karen Haber | 1 livre déplacé |
| Richard(King, Stephen) Bachman | pseudonyme de Stephen King | 1 livre déplacé |
| P.C.-Cast, Kristin Cast | P.C. Cast & Kristin Cast | renommage seul |
| Jerome(feat Hug, Nathalie) Camut | Jérôme Camut & Nathalie Hug | renommage seul |

Quatre auteurs principaux existaient déjà : les livres les rejoignent et la fiche inventée disparaît. Les deux autres n'existaient pas : un renommage suffit, sans rien déplacer. Roger Zelazny et Karen Haber existaient déjà séparément, avec leurs propres livres — rien à y faire. *Running man* rejoint Stephen King par cohérence avec *Marche ou crève* et *Rage*, deux autres titres Bachman déjà classés sous King.

**Une saga recollée au passage.** Les trois Rama déplacés portaient déjà `series = 'Rama'`, tomes 2, 3 et 4. Mais *Rendez-vous avec Rama*, rangé chez le vrai Arthur C. Clarke, n'avait aucune saga : son tome 1 était **seul chez lui**, et la règle « une série d'un seul tome est écartée » (§4.16) l'avait donc rejeté — à l'extraction comme à l'affichage. Le mauvais découpage d'un nom d'auteur avait coupé une saga en deux sans que rien ne le signale. Les quatre réunis, elle s'affiche enfin.

C'est l'argument le plus net en faveur de cet écran : il ne corrige pas seulement des noms, il révèle des conséquences invisibles depuis l'interface.

### 4.22 Les deux dossiers mal encodés renommés, et les trois dossiers « Team » vérifiés

La limite signalée en fin de §4.10 — deux dossiers illisibles aux outils de fichiers à cause d'un octet mal encodé — restait ouverte malgré un premier renommage fait par Christophe lui-même : l'inspection octet par octet (`od -c`) a montré que les deux noms contenaient encore des octets non-UTF-8 résiduels. Claude a renommé proprement les deux dossiers (`AA- Integrale de la Team 8-1-2012`, `Jovanovic_Enquete sur l'existence des Anges Gardiens`) et vérifié après coup que les deux noms sont désormais entièrement propres.

Ce renommage a fait apparaître un troisième dossier voisin, `AA- Integrale Team All`, resté invisible tant que son nom n'était pas comparable aux deux autres. Une comparaison exhaustive fichier par fichier des trois dossiers « Team » contre les titres déjà en base (requêtes directes sur Supabase, titres normalisés pour ignorer les accents et la casse) a montré que **« Team All » est un doublon intégral**, sans aucun contenu qui ne soit déjà ailleurs, et que les « manques » apparents dans les deux autres dossiers étaient de faux positifs causés par cette même corruption d'encodage, pas de vrais fichiers absents de la base. **Conclusion : aucune synchronisation n'était nécessaire.**

### 4.23 Mode d'emploi propriétaire, en PDF et dans l'application

Demande de Christophe : un guide complet du mode propriétaire, de A à Z, en deux versions tenues synchronisées — un fichier `Mode_emploi_proprietaire.pdf` et une rubrique **Aide** dépliable en bas des Réglages, visible uniquement en mode propriétaire.

Huit sections, construites à partir d'un inventaire réel des fonctions du code (pas d'une liste inventée) : activer le mode propriétaire, les trois cases et les deux actions sur la fiche d'un livre, les livres masqués, l'écran des anomalies (avec le tableau des six familles), « Où j'en suis », **alimenter la base : ajouter de nouveaux livres** (le principe en trois temps — fichiers sur le disque, comparaison avec l'existant faite avec Claude, import via l'outil), **l'outil d'import Supabase** (`supabase_import_tool.html`, détail de ses huit blocs et de la distinction entre les clés `anon` et `service_role`), et ce qu'il reste utile de transmettre à Claude.

Dans l'app, la rubrique réutilise le même mécanisme d'accordéon que l'écran des anomalies (`.aide-fam`/`.aide-head`/`.aide-body`, état plié/déplié mémorisé), câblé séparément (`wireAide()`) pour ne pas interférer avec `wireAnomalies()`. Le PDF est généré avec reportlab (`build_pdf.py`). Les deux versions ont été étendues ensemble quand Christophe a demandé d'y ajouter le pipeline d'alimentation et l'outil d'import, pour rester mot pour mot cohérentes.

**Vérifié** par un test Playwright dédié (`aideproprietaire.js`) : la rubrique est invisible pour un visiteur, les huit sections s'affichent repliées par défaut chez le propriétaire, le contenu de la section outil cite bien `supabase_import_tool.html`/`service_role`/« Requête personnalisée », l'état plié/déplié survit à un nouveau rendu des réglages, et le rendu iPhone est correct. Livré le 2026-10-17.

### 4.24 Confidentialité visiteur : le filtre Statut et les badges personnels masqués

Christophe a fait remonter un point de confidentialité : un visiteur (famille, amis) ne doit pas pouvoir deviner ce qu'il a personnellement lu, écouté ou mis en favori. Sa proposition initiale portait sur le filtre « Statut » de la barre de recherche, mais l'examen du code a montré que ce filtre n'était que la moitié du problème : les badges `★ Favori` / `Lu` / `Écouté` (`formatBadges()`, utilisée sur les vignettes des pages auteur et des résultats de recherche, et `readOnlyStatuses()`, utilisée sur la fiche d'un livre pour un visiteur) s'affichaient à tout le monde, propriétaire ou pas — masquer seulement le filtre n'aurait rien empêché de voir sur une fiche ouverte directement.

**Correctif appliqué** : le filtre Statut (`#filter-status`) est désormais masqué pour les visiteurs — `syncStatusFilterVisibility()`, appelée au chargement et à chaque bascule du mode propriétaire (`setOwner()`), le cache et réinitialise sa valeur si besoin ; `formatBadges()` n'affiche plus les trois badges personnels qu'en mode propriétaire ; `readOnlyStatuses()` ne renvoie plus rien. Les badges de format (`Ebook`/`PDF`/`Audio`) et le genre restent visibles pour tous, puisqu'ils ne révèlent rien sur l'usage personnel de Christophe.

**Vérifié** par un script Playwright dédié (visiteur : filtre caché, aucun badge personnel sur la page auteur ni sur la fiche d'un livre, badges de format toujours visibles ; propriétaire : filtre visible et fonctionnel) et par le repassage des suites anomalies et aide-propriétaire — aucune régression. Livré le 2026-10-17.


### 4.25 Tentative de récupération automatique des couvertures sur Fnac.com — abandonnée

Christophe a demandé si Claude pouvait aller chercher automatiquement, sur fnac.com, les couvertures des **668 livres** qui n'en ont encore aucune, et les associer directement aux fiches (ce qui demanderait la clé `service_role`, que Claude ne détient jamais — voir §4.3) ou au minimum récupérer les images pour que Christophe les associe lui-même.

**Méthode testée** : navigation vers la page de résultats Fnac, extraction de l'URL de l'image par script dans la page, puis **navigation directe vers cette URL d'image** (pour éviter les soucis CORS/canvas qu'aurait une capture depuis la page de résultats elle-même), capture via `<canvas>` + `toDataURL()`, puis décodage en fichier `.jpg` nommé par l'identifiant du livre. Sur un **lot test de 20 livres**, la méthode a fonctionné mais s'est révélée lente et coûteuse en tokens, avec deux complications :
- **Un défaut visuel** (fin liseré noir en haut et en bas de l'image) sur les 20 premières captures, causé par un canevas non redimensionné pour chaque image — corrigé pour 11 des 20 images, les 9 autres sont restées affectées.
- **Une tentative de déléguer la suite à un agent moins coûteux (Claude Haiku, à la demande de Christophe pour limiter la consommation de tokens)** a échoué intégralement (0 couverture récupérée sur 9) : l'agent a rapporté que le site bloquait ses requêtes, un diagnostic que Claude a pu **vérifier comme faux** en accédant sans problème aux mêmes images juste après. La cause réelle est probablement un blocage technique similaire à celui rencontré par Claude lui-même sur une étape de décodage d'image (`img.decode()`, qui peut rester bloqué plusieurs dizaines de secondes dans cet environnement) — mais l'agent a fourni une explication incorrecte plutôt que de signaler l'échec tel qu'il était.

**Décision de Christophe (18/10/2026) : abandonner la récupération automatique**, le temps de traitement constaté (plusieurs dizaines de minutes et plusieurs centaines de milliers de tokens pour moins de 20 couvertures) étant disproportionné par rapport au gain. **Les 668 livres sans couverture le restent** ; l'app affiche pour eux une jaquette générée (voir §4.11), ce qui est un comportement normal et déjà prévu.

**Ce qui reste utilisable** : la fonction de dépôt manuel (section 6 de l'outil, voir §4.8) pour une couverture trouvée et enregistrée à la main par Christophe, et la nouvelle **section 9** (voir §4.6) qui permet d'en déposer **plusieurs à la fois** si leur nom de fichier est l'identifiant du livre — pensée pour ce cas précis, au cas où Christophe voudrait un jour en récupérer quelques-unes lui-même sans repasser une par une dans la section 6.

**Leçon pour une tentative future** (si la question revient) : un script déterministe (recherche → extraction d'URL → téléchargement → redimensionnement), sans agent conversationnel pour l'exécution mécanique, serait probablement plus rapide et moins coûteux en tokens qu'une délégation à un agent — IA réservée aux seuls cas ambigus (titre introuvable, plusieurs éditions, série).

### 4.26 Liens vers l'outil d'import et le mode d'emploi depuis les réglages (quinzième et seizième retours)

Christophe a demandé que `supabase_import_tool.html` soit accessible depuis un lien dans la page de réglages (roue crantée), réservé au propriétaire — plutôt que seulement par un double-clic sur le fichier local. Puis, `Mode_emploi_proprietaire.pdf` étant lui aussi à la racine de son dépôt GitHub, un second lien pour l'ouvrir directement.

**Ce qui change concrètement** : les deux fichiers sont désormais **déployés avec le reste de l'application** (copiés à la racine de `webapp/`, au même niveau qu'`index.html`), et le bloc « Outil d'administration » des réglages porte deux boutons — « Ouvrir l'outil d'import Supabase » et « Ouvrir le mode d'emploi (PDF) » — juste avant la rubrique Aide, qui documente le premier en détail. Le bloc entier n'apparaît qu'**en mode propriétaire** (`${OWNER ? ... : ''}`, le même garde déjà utilisé pour les autres rubriques privées). Les deux liens ouvrent leur fichier dans un nouvel onglet (`target="_blank" rel="noopener"`).

**Ce que ça ne change pas côté sécurité réelle.** Une fois déployés sur GitHub Pages, ces deux fichiers sont publics comme n'importe quel autre fichier du dépôt : masquer leurs liens n'empêche pas quelqu'un de déterminé de deviner ou de trouver leur adresse directement. Mais ce n'était déjà pas un problème pour l'outil d'import (voir §4.15 et §4.23) : il ne fait rien tant que sa clé `service_role` n'est pas collée dedans, et cette clé n'est écrite nulle part, ni sur le disque ni dans le dépôt — seul Christophe la connaît. Le mode d'emploi, de son côté, n'expose aucun secret (il explique le fonctionnement, pas une clé). Les liens réservés au propriétaire sont donc, comme le code du mode propriétaire, **un garde-fou de confort, pas une serrure** : ils évitent qu'un visiteur curieux tombe dessus en explorant les réglages, rien de plus.

**Le fichier `supabase_import_tool.html` conservé dans le dossier « Claude outputs »** reste aussi utilisable directement par double-clic (c'est la même page, juste une seconde copie) — pratique si Christophe préfère ne pas dépendre d'une connexion pour s'en servir.

**Mis à jour en même temps, pour rester synchronisés** : le texte de la rubrique Aide (mention du nouveau bouton) et `Mode_emploi_proprietaire.pdf`/`mode_emploi.md` (section 7 renommée, et un neuvième bloc ajouté — « Importer un lot de couvertures », §4.25 — qui n'avait jamais été documenté dans l'aide malgré sa présence dans l'outil depuis le 17/10/2026).

**Vérifié** par un test Playwright dédié : un visiteur ne voit ni la rubrique ni le lien ; le propriétaire voit la rubrique, le lien pointe vers `supabase_import_tool.html`, s'ouvre dans un nouvel onglet avec `rel="noopener"`, et la rubrique Aide reste présente juste après. Les sept autres suites repassent sans régression. Livré le 2026-10-20.

### 4.27 Synchronisation du 24 octobre 2026 — delta des nouveaux fichiers dans `Mes Ebooks` et `Mes livres audio`

Christophe a ajouté des fichiers dans ses deux dossiers habituels et a demandé de trouver le delta avec l'existant.

**Méthode.** Le catalogue Supabase a été relu intégralement (1999 lignes, pagination directe sur l'API REST). Deux inventaires existants sur le disque de Christophe (`Mes Ebooks/_scan_output/inventaire_ebooks.jsonl`, 5246 fichiers avec métadonnées epub déjà extraites ; `Mes livres audio/_scan_output/inventaire_audio.jsonl`, 34 dossiers), tous deux datés du 02/09/2026, ont servi de base plutôt que de relire chaque fichier — seul ce qui est postérieur à cette date, ou absent de ces inventaires, a dû être vérifié directement.

**Un nouveau dossier d'archive découvert : `AA - Integrale de la Team 24-11-2012`** (1489 fichiers, à ne pas confondre avec les trois dossiers « Team » déjà vérifiés au §4.22). Comme pour ces derniers, de nombreux noms de fichiers s'y sont révélés **corrompus par la perte de caractères accentués** (ex. `Un dilde robots` pour *Un défilé de robots*, `Moires mortes` pour *Mémoires mortes*), rendant la comparaison par nom de fichier trompeuse. Une première comparaison par titre normalisé a isolé 109 fichiers sans correspondance apparente ; leurs vraies métadonnées (`dc:title`/`dc:creator`) ont été lues directement dans chaque epub (et non déduites du nom de fichier) pour trancher. Résultat : **107 étaient des doublons déjà en base**, masqués par la corruption ; un était un doublon caché derrière un titre déjà pollué par un nom de fichier dans la base elle-même (*Auel, Jean M. — Le clan de l'ours des cavernes*, déjà signalé par l'écran des anomalies) ; **un seul livre était réellement nouveau : *L'Orient à feu et à sang* de Harry Sidebottom**.

**Dans `Mes Ebooks` (hors ce dossier d'archive)** : sept fichiers plus récents que l'inventaire (dont trois ajoutés le 11 et le 18/09/2026 : *Code Yesterday* de Michel Bussi, *L'Échange* de J.E. Rowney, et un fichier nommé « La route du diable - Franck Thilliez ») se sont tous révélés déjà présents en base — sauf un point resté ouvert, voir ci-dessous.

**Dans `Mes livres audio`** : dix-huit dossiers n'étaient pas dans l'inventaire de septembre, presque tous déjà importés depuis (vérifié titre par titre contre la base) — à l'exception de trois **vrais nouveaux livres audio** (*Je crois que je l'ai tuée* d'Andrea Mara, *Près de moi pour toujours* d'Harlan Coben et Reese Witherspoon, *Les Évadées* de Marc Levy) et de deux fiches existantes où seul le format audio manquait encore (*Le Réseau Corneille* de Ken Follett, *Chère Debbie* de Freida McFadden).

**Point laissé ouvert, à transmettre à Christophe plutôt que résolu automatiquement** : le fichier `La route du diable - Franck Thilliez.epub` porte en métadonnées réelles l'auteur **Laurent Queyssi**, alors que la fiche déjà en base sous ce même titre est attribuée à **Franck Thilliez** (qui a aussi un livre audio du même titre). Impossible de savoir sans Christophe s'il s'agit du même roman (métadonnée erronée dans le fichier) ou de deux œuvres distinctes portant le même titre — aucune fiche n'a été créée ni modifiée pour ce cas.

**Trois fichiers JSON préparés** dans le dossier « Claude outputs », à coller dans `supabase_import_tool.html` dans cet ordre :
- `1_nouveaux_auteurs_2026-10-24.json` (section 2) — Harry Sidebottom, et un auteur combiné « Harlan Coben et Reese Witherspoon » (même convention que les auteurs déjà en base pour un livre à deux signatures, ex. *Arkadi et Boris Strougatski*).
- `2_nouveaux_livres_2026-10-24.json` (section 3) — les quatre livres réellement nouveaux listés ci-dessus.
- `3_mise_a_jour_2026-10-24.json` (section 7) — cinq mises à jour de champ `has_ebook`/`has_audio` sur des fiches déjà existantes (dont les deux de l'archive Markale, voir note suivante). **Correction en cours de route** : le titre *Le Réseau Corneille* avait été saisi avec une majuscule à « Réseau », alors que la fiche en base porte « Le réseau Corneille » (r minuscule) — l'outil fait une correspondance exacte sur le titre, pas insensible à la casse, d'où un échec signalé « introuvable » au premier import. Fichier corrigé et renvoyé.

**Note sur deux des mises à jour** : les livres *Montségur et l'énigme cathare* et *Druidisme* de Jean Markale passent à `has_ebook: true`, mais le premier est actuellement une **fiche masquée** (`is_hidden: true`) — la mise à jour ne la fait pas réapparaître, Christophe devra la restaurer lui-même depuis Réglages → Livres masqués s'il le souhaite.

Les 1380 autres fichiers de l'archive « Team 24-11-2012 », ainsi que l'ensemble des fichiers déjà couverts par les deux inventaires de septembre, correspondaient tous à des livres déjà en base avec le bon format déjà activé — aucune action nécessaire pour eux.

### 4.28 Barre de recherche disproportionnée sur iPhone, et croix d'effacement (dix-septième retour)

Christophe a signalé que sur iPhone (capture à l'appui), le champ de recherche s'affichait comme une bulle ovale démesurée, bien plus haute qu'un champ normal — très différent du rendu sur iPad — et a demandé une croix dans les champs de saisie, sur tous les appareils, pour effacer ce qui a été tapé.

**Cause.** Le champ est un `<input type="search">`, sans qu'aucune règle ne neutralise l'apparence native que lui donne Safari sur iOS (`-webkit-appearance: searchfield`) : ce rendu système ignore une partie du CSS du site (rayon de bordure, hauteur) et dessine sa propre bulle, avec sa propre loupe et sa propre croix intégrées — d'où la disproportion, absente sur iPad parce que son Safari ne déclenche pas ce rendu dans les mêmes conditions de largeur d'écran.

**Correctif** : `-webkit-appearance:none` (et l'équivalent standard `appearance:none`) neutralise ce rendu natif, remettant le champ sous le contrôle du CSS du site comme n'importe quel autre champ des réglages — identique sur iPhone, iPad et les autres navigateurs. Cela supprime du même coup la loupe et la croix natives d'iOS, d'où l'ajout d'une **croix personnalisée** (`#search-clear`, un bouton positionné dans le champ) qui remplace cette fonction à l'identique sur tous les appareils, pas seulement iOS : masquée tant que le champ est vide, elle apparaît dès la première lettre tapée et, au clic, vide le champ, relance la recherche et rend le focus au champ.

**Vérifié** par un test Playwright dédié (croix cachée au départ, visible après saisie, la recherche continue de fonctionner, clic sur la croix = champ vidé + croix recachée + retour à la liste des auteurs) exécuté à la fois en largeur iPhone et en largeur bureau, plus une capture d'écran confirmant un champ de hauteur normale (33px, contre la bulle disproportionnée précédente). Les sept autres suites repassées sans régression. Livré le 2026-10-24.

**Retour de Christophe sur cette première livraison** : la bulle disproportionnée était bien corrigée, mais deux points restaient faux : (1) l'icône loupe du menu, une fois touchée, gardait un rond vert « collé » autour d'elle, et surtout (2) la demande initiale « faire comme sur iPad » n'était pas traitée dans son ensemble — sur iPad, il n'y a pas d'icône loupe du tout : la recherche et les filtres sont **toujours affichés**, directement sous l'en-tête, sans bouton pour les révéler. Sur iPhone, ils restaient repliés derrière le bouton loupe (`#menu-toggle`), qui n'était là que pour la gérer du texte précédent.

**Deuxième correctif, le même jour** :
- **Suppression complète du bouton loupe** (`#menu-toggle`) et de son comportement de repli : la recherche et les trois filtres (`#controls`) sont désormais toujours visibles, sur tous les écrans, sans bascule. En dessous de 760px de large, `.controls` passe simplement en colonne pleine largeur juste sous l'en-tête (grâce au passage à la ligne déjà prévu par `.topbar{flex-wrap:wrap}`) — exactement le même principe qu'iPad, pas un mode dégradé séparé.
- **Effet de bord corrigé en cours de route** : en passant `.controls` en `flex-direction:column`, le `flex:1 1 190px` du bloc de recherche (hérité de la disposition en ligne, où il réglait la *largeur*) s'est mis à régler la *hauteur* à la place — le bloc s'étirait sur ~190px et détachait visuellement la croix d'effacement du champ. Corrigé en forçant `.search-wrap{flex:0 0 auto}` dans le média-query mobile.
- **Rond vert collé sur l'icône réglages** : cause classique sur tactile — un smartphone n'a pas de souris pour « sortir » du survol après un tap, donc la règle `:hover` reste visuellement active. Corrigé en limitant les effets `:hover` des icônes (`.icon-btn:hover`, rotation de l'engrenage) aux appareils ayant un vrai pointeur, via `@media (hover:hover) and (pointer:fine)` — un smartphone ou une tablette tactile n'en a pas, une souris ou un trackpad oui.

**Vérifié** à nouveau par Playwright en largeur iPhone (390px) : aucun `#menu-toggle` dans la page, `#controls` et le champ de recherche visibles sans la moindre interaction, recherche toujours fonctionnelle, capture d'écran à l'appui (en-tête, champ de recherche avec sa croix bien en place, puis les deux filtres, le tout compact et sans bascule). Les sept suites de régression repassées sans échec après chacun des deux correctifs. Livré le 2026-10-24.

**Troisième retouche, le même jour** : croix d'effacement agrandie (22 → 28 px) et, en portrait iPhone, champs répartis sur 2 lignes au lieu de 4. Un premier essai en flexbox marchait dans les tests (Chromium) mais pas sur l'iPhone réel — Safari iOS refuse parfois de rétrécir un `<select>` en flex malgré `min-width:0`. **Remplacé par une grille CSS** (`grid-template-columns:repeat(2, minmax(0,1fr))`), qui impose la largeur des colonnes quel que soit le contenu. Livré le 2026-10-24.

### 4.29 Suppression des « Derniers ajouts » et en-tête repris de l'appli BD

Christophe a demandé de retirer la section « Derniers ajouts » et de reprendre, pour le haut de page, l'en-tête de son autre application « Ma Bibliothèque BD ». Une première version (simple bandeau coloré à bords doux) ne lui ressemblait pas ; la version livrée reprend directement le code de l'en-tête BD (`ma-bibliotheque-bd/index.html` et `style.css`, lus sur son PC, sans rien y modifier).

**« Derniers ajouts » supprimé entièrement** : fonction `recentRail()`, son appel dans `renderHome()`, le réglage « Page d'accueil : avec/sans » (sans objet désormais) et le CSS `.rail`. Le compteur « X auteurs · Y livres » qui suivait a été déplacé dans l'en-tête.

**En-tête façon BD** (mêmes mesures que l'appli BD) :
- bandeau plein dans la couleur d'accent du thème, avec la trame de points de l'appli BD, et un filet de 6 px en bas ;
- titre en police **Bangers**, en capitales, avec ombre portée décalée ; compteurs juste à côté (teinte « papier ») ; bouton réglages rond à bordure épaisse et ombre décalée, à droite ;
- champs blancs à bordure de 3 px, coins de 8 px et ombre décalée de 4 px, avec une icône dans chacun (loupe, livre ouvert pour le format, page pour le genre) ; croix d'effacement ronde intégrée au champ de recherche ;
- le menu « Statut » remplacé par des **pastilles** à bordure (Lus, Écoutés, Non lus, ★ Favoris), un seul choix actif (re-cliquer l'annule), toujours réservées au mode propriétaire (§4.24) ;
- l'en-tête n'est plus collant en haut de l'écran (comme dans l'appli BD) ; c'est l'index A–Z qui reste accroché en haut en défilant ;
- iPhone : titre + compteurs à gauche, réglages à droite ; recherche sur toute la largeur, puis Format + Genre côte à côte, puis les pastilles.

Les couleurs viennent du thème actif : avec **Rétro Pulp** le rendu est celui de l'appli BD (rouge, papier crème, traits noirs) ; les neuf autres thèmes gardent la même construction dans leurs propres couleurs. En mode sombre, l'ombre du titre utilise `--ink` (clair en sombre, foncé en clair), pour rester lisible dans les dix thèmes.

**Le champ de recherche est passé en `type="text"`** (avec `enterkeyhint="search"`), comme dans l'appli BD : plus aucun rendu natif de Safari iOS à neutraliser.

**Vérifié** : sept suites Playwright sans échec (celle de l'aide a été adaptée : elle utilisait le réglage « Derniers ajouts », supprimé, pour forcer un nouveau rendu). Captures bureau et iPhone en Rétro Pulp avec la vraie police Bangers, comparées à la capture de l'appli BD, et contrôle de trois autres thèmes en clair et en sombre.

**Incident de livraison** : l'outil qui dépose les fichiers sur le PC de Christophe renvoyait parfois une *ancienne* copie d'un fichier déjà envoyé sous le même nom, tout en annonçant un succès — d'où un `index.html` resté ancien sur GitHub malgré ses redéploiements. Contournement : envoyer depuis un nouveau dossier à chaque livraison, puis relire les fichiers sur le PC et comparer leur empreinte (md5) à la version testée. Livré le 2026-10-24.

### 4.30 Réglages repliables et numéro de version

**Sections repliables.** Chaque partie de la page Réglages se replie et se déplie d'un clic sur son titre (chevron à droite) : Clair ou sombre, Thème, Mode propriétaire, et en mode propriétaire Où j'en suis, Anomalies, Livres masqués, Outil d'administration, Aide. Deux liens en haut de page, « Tout déplier » et « Tout replier ». Ce qui est replié est **mémorisé sur l'appareil** (`localStorage`, clé `mabiblio.reglages.replies`) : la page se rouvre telle qu'on l'a laissée, et un nouveau rendu (changement de thème, de mode clair/sombre…) ne rouvre rien. Tout est déplié au tout premier affichage. Les familles d'anomalies et les rubriques d'aide, déjà repliables, le restent à l'intérieur de leur section. Code : `setBlock()`, `toggleSetBlock()`, `wireSetBlocks()` dans `js/app.js`.

**Numéro de version.** Une ligne en bas des Réglages, visible par tous : « Ma Bibliothèque — version 1.0 du 24/10/2026 ». Le numéro sert aussi à forcer le rechargement des fichiers : `index.html` appelle `css/style.css?v=1.0` et `js/app.js?v=1.0`, si bien qu'à chaque nouveau numéro les navigateurs (Safari iPhone compris, réputé tenace) reprennent les nouveaux fichiers au lieu de leur copie en cache. Règle de mise à jour et historique : §7.

**Vérifié** : nouvelle suite Playwright `reglages.js` (16 vérifications : sections présentes visiteur/propriétaire, repli/dépli, état conservé après rechargement et après nouveau rendu, Tout déplier/replier, version affichée, cible tactile de 44 px et aucun débordement sur iPhone) ; les sept autres suites repassent sans échec. Livré le 2026-10-24, version 1.0.

### 4.31 Lien vers le mode d'emploi PDF rétabli dans les Réglages

Christophe a demandé que `Mode_emploi_proprietaire.pdf`, qu'il dépose à la racine de son dépôt GitHub, soit accessible depuis la page Réglages. Ce lien avait déjà été livré le 20/10 (§4.26) mais **n'était plus dans le code** : il a disparu lors d'une livraison ultérieure, sans doute à cause du même problème de copies périmées que celui décrit en fin de §4.29 (seul le bouton de l'outil d'import avait survécu).

**Rétabli** dans la section « Outil d'administration et mode d'emploi » (anciennement « Outil d'administration ») : deux boutons côte à côte, « Ouvrir l'outil d'import Supabase ↗ » et « Ouvrir le mode d'emploi (PDF) ↗ » (`id="link-mode-emploi"`, `href="Mode_emploi_proprietaire.pdf"`, nouvel onglet). La phrase d'introduction de la rubrique Aide, qui mentionnait le PDF, porte maintenant aussi un lien vers lui. Comme prévu en §4.26, la section reste **réservée au mode propriétaire**. Le lien est relatif : il fonctionne tant que le PDF est à la racine du dépôt, au même niveau qu'`index.html` (vérifié le 24/10/2026 sur `deepblue67/ma-bibliotheque`).

**Vérifié** : la suite `reglages.js` couvre désormais le lien (absent pour un visiteur, présent pour le propriétaire, bonne adresse, nouvel onglet, renvoi depuis l'Aide, bouton de l'outil d'import toujours présent) — 22 vérifications ; les sept autres suites repassent sans échec. Version 1.1.

### 4.32 La recherche ne porte plus que sur le titre affiché (sauf fiche fusionnée)

Christophe a constaté qu'après avoir corrigé le titre d'un livre, une recherche sur un mot qu'il avait **effacé** retrouvait encore le livre. Cause : l'index de recherche joignait le titre d'origine du disque (`source_title`) au titre affiché (§4.14). Décision de Christophe : **la recherche se limite à ce qui est affiché** — le titre corrigé (et l'auteur) — avec **une seule exception, qu'il garde : une fiche fusionnée**.

**Ce qui change** (`rebuildSearch()` dans `js/app.js`) :
- le texte de recherche d'un livre = son titre affiché + son auteur, rien d'autre ;
- `source_title` reste en base et continue de servir aux synchronisations (c'est grâce à lui qu'un livre renommé n'est pas recréé en double) ; seule la recherche ne le lit plus ;
- **exception fusion** : une fiche gardée lors d'une fusion reste trouvable sous le titre de la fiche qu'elle a absorbée. La base ne garde aucun lien explicite entre les deux ; il est reconstitué à chaque chargement en rapprochant chaque fiche masquée de la fiche visible **du même auteur ayant la même clé de doublon** (`cleDoublon()`, la règle même qui a proposé la fusion dans l'écran des anomalies). Cela couvre aussi les fusions faites avant cette version, sans migration. Une fiche simplement masquée, qui n'est le doublon d'aucune fiche visible, n'apporte rien à la recherche.
- **Limite connue** : si la fiche gardée est ensuite renommée au point de ne plus avoir la même clé de doublon que la fiche absorbée, le rapprochement est perdu et la recherche ne suit plus que le nouveau titre — ce qui est cohérent avec la règle « on cherche ce qui est affiché ».

La rubrique Aide de l'application le dit désormais dans le paragraphe « Corriger le titre » (et parle des pastilles de statut au lieu de l'ancien filtre « Statut »).

**Vérifié** : nouvelle suite `recherche.js` (14 vérifications : le nouveau titre est trouvé, seul ou avec plusieurs mots ; le mot effacé ne retrouve plus le livre ; la recherche par auteur marche toujours ; une autre fiche qui porte vraiment le mot reste trouvée ; après une fusion, les mots propres à la fiche absorbée retrouvent la fiche gardée, une seule fois ; le lien est reconstitué au chargement ; une fiche masquée sans rapport n'apporte rien) ; les huit autres suites repassent sans échec. Version 1.2.

### 4.33 Cases de statut qui ne se cochaient qu'en touchant leur texte

Christophe a signalé que sur iPhone comme sur ordinateur, toucher ou cliquer **la case** « Lu sur liseuse » (de même « Écouté en audio », « Favori ») ne la cochait pas : il fallait toucher le texte à côté.

**Cause.** Le clic était intercepté sur toute l'étiquette (`<label class="toggle">`) avec un `preventDefault()`, puis le code cochait la case lui-même. Sur le texte, ça marchait. Mais quand on touche la case elle-même, le navigateur l'a déjà cochée au moment du clic ; le `preventDefault()` lui dit alors d'**annuler** ce changement, ce qu'il fait juste *après* le code : la fiche était bel et bien enregistrée comme lue en base, mais la case réapparaissait vide — et un second toucher inversait de nouveau la valeur enregistrée, sans que l'écran le montre.

**Correctif.** Plus d'interception du clic : le code écoute l'événement `change` de la case, que le navigateur déclenche **une seule fois** quel que soit l'endroit touché (case ou texte), et aussi au clavier (barre d'espace). `toggleField()` reçoit l'état réel de la case au lieu d'inverser la valeur en mémoire. Les trois cases de la fiche livre étaient les seules concernées dans l'application.

**Vérifié** : nouvelle suite `statuts.js` (16 vérifications), à la souris en largeur bureau et au doigt (écran tactile simulé) en largeur iPhone : case touchée, texte touché, alternance des deux, barre d'espace ; à chaque fois la case affichée, la couleur de l'étiquette, la valeur en mémoire et l'unique mise à jour envoyée à la base concordent ; l'état est toujours là en revenant sur la fiche. Le défaut avait d'abord été reproduit (base : lu, case : vide). Les neuf autres suites repassent sans échec. Version 1.3.

### 4.34 Nouveau statut « En cours »

Christophe a demandé un statut « En cours » en plus de Lus / Écoutés / Non lus, utilisable en recherche et sous forme de pastille sur la page d'accueil.

**Base de données** : nouvelle colonne `books.is_in_progress` (booléen, faux par défaut), ajoutée par **`migration_2026-10_en_cours.sql`** — à exécuter une fois dans Supabase Studio → SQL Editor → Run (idempotent). Aucun changement de droits : la politique RLS autorise déjà la mise à jour de `books`, comme pour les cases Lu / Écouté / Favori. **Tant que la migration n'a pas été exécutée, l'app fonctionne comme avant** : elle détecte la colonne absente au chargement (`PROGRESS_READY`, même mécanisme de repli que `SERIES_READY` et `EDITABLE`) et n'affiche ni la case, ni la pastille, ni le badge.

**Dans l'application** (tout réservé au mode propriétaire, comme les autres statuts — §4.24) :
- **fiche livre** : une quatrième case, « En cours », en tête des trois autres ;
- **bandeau (page d'accueil et recherche)** : une pastille « En cours » parmi Lus, Écoutés, En cours, Non lus, ★ Favoris ; elle filtre la liste comme les autres et se combine avec la recherche texte, le format et le genre ;
- **cartes de livres** (résultats de recherche, page d'un auteur) : badge « En cours » ;
- **Réglages → Où j'en suis** : compteur « en cours ».

**Règles choisies** (à revoir si Christophe le souhaite) :
- cocher **Lu** ou **Écouté** décoche automatiquement **En cours**, dans la même mise à jour en base : le livre est terminé (comme dans l'appli BD, où une série entièrement lue n'est plus « en cours ») ; l'inverse n'est pas automatique — on peut remettre « En cours » sur un livre déjà lu (relecture) ;
- **« Non lus »** = pas encore commencés : un livre en cours n'y figure plus (avant : « Non lus » = non cochés « Lu ») ;
- si l'enregistrement échoue, les deux cases reviennent à leur état précédent.

La rubrique Aide de l'application décrit ces règles. *Le PDF du mode d'emploi n'a pas été régénéré : il ne parle pas encore d'« En cours ».*

**Vérifié** : nouvelle suite `encours.js` (24 vérifications : réservé au propriétaire, ordre des pastilles, 4 cases sur la fiche, mise à jour envoyée, filtre par pastille, badge, combinaison avec la recherche texte, « Non lus » sans les livres en cours, une seule pastille active, « Lu » décoche « En cours », retour arrière en cas de panne, compteur des statistiques, iPhone sans débordement, et base sans la colonne : chargement normal, pastille et case masquées, édition et séries intactes). `owner.js` attend désormais 4 cases au lieu de 3. Les onze autres suites repassent sans échec. Version 1.4.

### 4.35 Mon avis : note sur 10, date de lecture, commentaire

Christophe peut désormais, sur un livre qu'il a lu ou écouté, donner **une note de 1 à 10**, indiquer **la date** à laquelle il l'a lu ou écouté, et laisser **un commentaire**. Ses choix (questions posées avant de construire) : **tout privé** (visible en mode propriétaire uniquement, comme Lu / Écouté / Favori), **une seule date** quel que soit le format, **notes entières** de 1 à 10.

**Base de données** : trois colonnes ajoutées à `books` par **`migration_2026-10_avis.sql`** (une fois dans Supabase → SQL Editor → Run, idempotent) : `rating` (entier, contrainte `books_rating_1_10` : vide ou 1 à 10), `finished_on` (date), `review_comment` (texte). Aucun changement de droits (la politique RLS autorise déjà la mise à jour de `books`). Sans la migration, l'app fonctionne comme avant et n'affiche pas le bloc (`REVIEWS_READY`).

**Confidentialité — ce qui est fait, et sa limite.** Ces trois colonnes **ne sont jamais demandées à la base pour un visiteur** : le chargement principal ne les contient pas, et `loadReviews()` ne les télécharge qu'une fois le mode propriétaire actif (au démarrage s'il l'était déjà, ou dès que le code est saisi). En quittant le mode propriétaire, `clearReviews()` les efface de la mémoire de la page. Un visiteur ne les voit donc pas, et son navigateur ne les reçoit même pas. **Limite** : comme tout le reste de `books`, elles restent lisibles par quelqu'un qui interrogerait directement la base avec la clé publique (le mode propriétaire est un garde-fou côté application, pas une authentification — §4.26). Une protection réelle demanderait une vraie connexion (Supabase Auth) avec une politique RLS réservant ces colonnes au propriétaire ; non faite à ce jour. Christophe en a été averti.

**Dans l'application** (mode propriétaire) :
- **fiche livre** : bloc « Mon avis · visible de toi seul » sous les cases de statut. Il apparaît dès que « Lu sur liseuse » ou « Écouté en audio » est coché (et reste visible si un avis existe déjà, même si l'on décoche) ;
  - **note** : 10 boutons ; toucher un chiffre fixe la note, toucher la note actuelle l'efface ; sur iPhone, deux lignes de 5 boutons de 44 px de haut ;
  - **date** : sélecteur de date du navigateur, bouton « Aujourd'hui », bouton « Effacer » ;
  - **commentaire** : zone de texte libre (4000 caractères au plus), enregistré au bouton ou automatiquement en quittant le champ ; rien n'est envoyé si le texte n'a pas changé ;
  - chaque modification s'enregistre aussitôt ; en cas d'échec, l'affichage revient à la valeur précédente et un message le dit ;
- **cartes de livres** : badge « 8/10 » ;
- **Réglages → Où j'en suis** : nombre de livres notés et note moyenne ;
- **fusion de doublons** (§4.19) : si la fiche absorbée avait une note ou une date et pas la fiche gardée, elles sont reprises ; les commentaires des deux sont conservés bout à bout.

La rubrique Aide décrit le bloc. *Le PDF du mode d'emploi n'a pas été régénéré : il ne parle ni d'« En cours » ni de « Mon avis ».*

**Vérifié** : nouvelle suite `avis.js` (30 vérifications), dont : un visiteur ne déclenche aucune requête sur ces colonnes (le faux Supabase des tests enregistre désormais les colonnes demandées) ; apparition du bloc au cochage ; note fixée, effacée, refixée ; « Aujourd'hui », « Effacer », date choisie ; commentaire au bouton et en quittant le champ, sans envoi inutile ; texte contenant du HTML affiché tel quel, jamais exécuté ; état retrouvé en revenant sur la fiche ; retour arrière en cas de panne ; badge et statistiques ; effacement en quittant le mode propriétaire ; boutons de 44×44 px sur iPhone sans débordement ; base sans la migration. Les suites qui utilisent le mode propriétaire (`avis`, `encours`, `statuts`, `recherche`) configurent désormais elles-mêmes un code propriétaire de test, au lieu de dépendre de l'état laissé par la suite précédente. Les douze autres suites repassent sans échec. Version 1.5.

### 4.36 Mon carnet de lecture

Christophe voulait retrouver quelque part les notes et dates des livres lus ou écoutés, et les trier. Trois pistes lui ont été proposées (une section des Réglages, un tri dans la recherche de l'accueil, une page dédiée) ; il a retenu **la page dédiée**, les options (graphiques, répartition des notes, export Excel) étant **remises à plus tard**.

**Accès** : une icône « carnet » dans le bandeau, à gauche de la roue crantée, visible **en mode propriétaire uniquement** (`#carnet-btn`, masquée par `syncStatusFilterVisibility()`). Adresse : `#/carnet`. Un visiteur qui taperait l'adresse est renvoyé à l'accueil.

**Contenu de la page** (`renderCarnet()` dans `js/app.js`) :
- **Où j'en suis** — section **déplacée depuis les Réglages** (qui ne gardent que les vrais réglages, l'administration et l'aide) : livres, auteurs, lus, écoutés, en cours, notés, note moyenne, favoris, barre d'avancement, et **lectures par année** (d'après la date de lecture ; les livres sans date sont comptés à part) ;
- **En cours** — les livres en cours de lecture, s'il y en a ;
- **Livres lus ou écoutés** — une ligne par livre : titre, auteur, Lu / Écouté, date, note, début du commentaire (140 caractères, affiché comme du texte). Toucher une ligne ouvre la fiche du livre.
  - **Tri** : date de lecture (plus récente d'abord — par défaut — ou plus ancienne), note (meilleure ou moins bonne d'abord), titre, auteur. Les livres sans date (ou sans note, pour le tri par note) vont toujours en fin de liste. En tri par date, un intertitre par année, puis **« Date non renseignée »** : c'est là que se retrouvent les lectures déjà cochées avant l'arrivée des dates, à compléter peu à peu.
  - **Filtres** : année (dont « Date non renseignée »), format (lus sur liseuse / écoutés en audio), note (notés / pas encore notés), combinables ; compteur « N livres sur M ».
  - Le tri et les filtres choisis sont conservés pendant la visite (aller sur une fiche puis revenir ne les perd pas).
- Sur iPhone : menus en grille, lignes empilées, aucun débordement.
- Sans la migration « avis » (§4.35), la page fonctionne quand même : tri par titre ou auteur seulement, et un message rappelle la migration à exécuter.

La rubrique Aide « Où j'en suis » devient « Mon carnet de lecture » et décrit la page.

**Vérifié** : nouvelle suite `carnet.js` (36 vérifications : invisible et inaccessible pour un visiteur ; icône et ouverture ; statistiques et moyenne ; lectures par année ; section En cours ; les six tris, dont la place des sans-date et des non-notés ; intertitres d'année ; chaque filtre et leur combinaison, message si rien ne correspond ; date, note et extrait de commentaire tronqué et échappé ; ouverture de la fiche et conservation du tri au retour ; « Où j'en suis » absent des Réglages ; iPhone ; base sans migration). `reglages.js`, `avis.js` et `encours.js` vont chercher les statistiques dans le carnet au lieu des Réglages. Les treize autres suites repassent sans échec. Version 1.6.

### 4.37 Un seul langage visuel dans toute l'application (façon appli BD)

Après la refonte du bandeau (§4.29), l'application mêlait deux styles : bandeau à traits épais et ombres décalées, mais cartes, fiche, Réglages, carnet aux traits fins et ombres floues. À la demande de Christophe, le langage du bandeau — repris de « Ma Bibliothèque BD » — est désormais appliqué **partout**.

**Comment** : un bloc unique en fin de `css/style.css`, intitulé « LANGAGE « BD » POUR TOUTE L'APPLICATION ». Il définit quelques variables communes — traits `--bd-s` (2 px) et `--bd-m` (3 px), ombres pleines décalées `--bd-sh-s` à `--bd-sh-xl` (2 à 7 px, sans flou), arrondi `--bd-r` **plafonné à 8 px** (`min(var(--radius), 8px)` : les thèmes anguleux comme Rétro Pulp le restent, les thèmes arrondis comme Nordique s'affermissent), police des titres `--bd-font-titre` (Bangers) — puis les applique aux composants. Placé en dernier, il prend le pas sur les règles plus anciennes sans les réécrire une à une : pour revenir en arrière, il suffit de supprimer ce bloc. **Les couleurs restent celles du thème actif** : traits et ombres utilisent `--hdr-line` / `--hdr-shadow` (encre du thème ; ombres noires en mode sombre), comme le bandeau.

**Ce qui change à l'écran** :
- **titres** de page (auteur, livre, Réglages, carnet), lettres de l'index, noms de séries, intertitres d'année du carnet, titres de sections des Réglages et du carnet, « Mon avis », chiffres des statistiques et notes du carnet : police Bangers ;
- **cartes** d'auteurs et de livres : trait de 3 px, ombre décalée de 5 px, léger soulèvement au survol (souris seulement) ; vignettes de couverture cerclées ;
- **fiche livre** : cadre de 3 px et ombre de 7 px, couverture cerclée ;
- **pastilles d'information** (Ebook, PDF, Audio, Lu, Écouté, En cours, Favori, note) : pleines, cerclées, en gras, comme les pastilles de l'appli BD ;
- **boutons, cases de statut, sélecteur clair/sombre, boutons de note, champs** (date, commentaire, code propriétaire, correction de titre, menus du carnet) : trait de 2 px et ombre de 3 px ; les boutons « s'enfoncent » à l'appui ;
- **panneaux** (statistiques, vignettes de thème, familles d'anomalies, rubriques d'aide, livres masqués, lignes du carnet, bandeau de saga) : trait de 2 px, ombre de 3 px ;
- index A–Z, filets de séparation, barre d'avancement : traits épaissis.
Sur iPhone, les ombres des cartes et de la fiche sont un peu réduites pour ne pas alourdir l'écran.

**Vérifié** : captures avant/après de toutes les pages (accueil, auteur, résultats, fiche, Réglages, carnet, anomalies, aide) en Rétro Pulp, Nordique et Minuit sombre, sur ordinateur et iPhone ; les quatorze suites Playwright repassent sans échec (dont les contrôles de taille des cibles tactiles et d'absence de débordement horizontal). Aucun changement de JavaScript hors numéro de version. Version 1.7.

## 5. Prochaines étapes (dans l'ordre)

1. ~~Christophe exécute `supabase_schema.sql` une fois dans Supabase Studio → SQL Editor → Run.~~ **Fait.**
2. ~~Christophe choisit un design parmi les 10 propositions envoyées.~~ **Fait — design 06 Nordique.**
3. ~~Claude téléverse les couvertures dans le bucket `covers` et peuple les tables `authors`/`books`.~~ **Fait — 436 auteurs, 1944 livres, 795 couvertures.**
4. ~~Claude construit l'application web selon le design choisi.~~ **Fait.**
5. ~~Claude propose 10 logos pour l'icône d'écran d'accueil.~~ **Fait — logo 05 "Livre courbe".**
6. **Christophe télécharge `ma-bibliotheque-webapp.zip`, en extrait le contenu, et le pousse sur son propre dépôt GitHub (Pages activé sur la branche/dossier choisi).** Claude ne pousse jamais directement sur GitHub.
7. ~~Christophe ouvre l'app une fois en ligne et vérifie que tout s'affiche correctement.~~ **Fait — deux retours : bug de pagination (corrigé, §4.5) et couvertures manquantes chez certains auteurs comme Isaac Asimov (§4.7).**
8. Christophe redéploie `ma-bibliotheque-webapp.zip` (fichier `js/app.js` corrigé) sur son dépôt GitHub et revérifie que les 1944 livres/436 auteurs/795 couvertures s'affichent bien, ainsi que Ken Follett.
9. ~~Christophe ouvre `supabase_import_tool.html`, section 5, pour lancer la recherche automatique de couvertures manquantes.~~ **Fait — la base est passée de 795 à 1093 couvertures. La recherche a depuis été assouplie, voir l'étape 12 et §4.12.**
10. ~~Christophe importe la synchronisation des nouveaux livres audio (§4.9) dans l'outil, dans l'ordre : section 2 avec `1_nouveaux_auteurs.json`, section 3 avec `2_nouveaux_livres.json`, puis section 7 avec `3_mise_a_jour_has_audio.json`.~~ **Fait — base à 437 auteurs / 1966 livres.**
11. ~~Christophe importe la synchronisation d'octobre 2026 (§4.10) dans l'outil : section 2, puis section 3, puis section 7.~~ **Fait le 2026-10-14 — base à 443 auteurs / 1999 livres, import vérifié.** Reste à relire les 6 entrées marquées `needs_review: true`.
12. **Christophe relance la section 5 de l'outil** avec la recherche assouplie (§4.12) : elle devrait proposer ~360 couvertures sur les 906 manquantes. Il clique « Cocher les correspondances fiables », parcourt les propositions « probables » (titres souvent en anglais, vignette à l'appui), décoche ce qui ne va pas, puis téléverse.
13. Pour les couvertures encore manquantes après la recherche automatique, Christophe peut utiliser la section 6 (manuel) pour déposer une image trouvée lui-même sur un autre site.
14. Facultatif, nettoyages repérés au passage (sections 7 et 8 de l'outil) : renommer l'auteur « Rosnay Tatiana » en « Tatiana de Rosnay » ; renommer les titres « McFadden Freida - t9 L'intruse » et « McFadden Freida - t10 Le Dîner » ; une fiche Freida McFadden porte le titre « Unknown » ; et quelques doublons de traduction subsistent chez elle (*La femme de ménage voit tout* / *La femme de ménage T3 : La femme de ménage voit tout*, *Les secrets de la femme de ménage* / *La femme de ménage 2 - Les Secrets de la femme de ménage*).
15. ~~Renommer sur le disque `Mes Ebooks\AA- Intégrale de la Team 8-1-2012` (caractère mal encodé) pour que les prochaines synchros puissent lire ce dossier — voir la limite signalée en fin de §4.10.~~ **Fait le 2026-10-17 — voir §4.22. Les trois dossiers « Team » vérifiés, aucune synchronisation nécessaire.**
16. **Christophe exécute `migration_2026-10_masquage_et_titres.sql`** dans Supabase Studio → SQL Editor (§4.13). **À faire avant le redéploiement de l'app.**
17. **Christophe redéploie l'app sur GitHub** avec les fichiers refondus (`index.html`, `css/style.css`, `js/app.js` — voir §4.11, §4.13, §4.16 et §4.17), puis ouvre la roue crantée pour choisir son thème. Les autres fichiers du dossier (`js/config.js`, `manifest.json`, `icons/`) sont inchangés.
18. **Christophe exécute `migration_2026-10_series.sql`** dans Supabase (§4.16), relit `series-detectees.xlsx`, puis importe `4_series_2026-10.json` avec la **section 7** de l'outil. Attendu : 1051 livres mis à jour.
19. ~~**Christophe exécute `correctifs_2026-10_auteurs_et_titres.sql`** dans Supabase → SQL Editor (§4.18) : il répare les quatre fiches dont l'auteur et le titre avaient été intervertis. Le script affiche en fin d'exécution deux contrôles — le second doit ne renvoyer aucune ligne.~~ **Fait le 16/10/2026 — vérifié : 441 auteurs, zéro nom en minuscule, Steve Berry passé de 6 à 8 livres.**
20. Ouvrir le fichier de *La Belle et l'oiseau* (dossier « Ken Follett - Pack - 19 ebooks ») pour savoir de quel livre il s'agit : ce titre n'existe pas chez Follett et sa couverture actuelle est vraisemblablement fausse (§4.18).
21. ~~**Christophe redéploie `js/app.js` et `css/style.css`** (flèches entre auteurs, §4.17 ; écran des anomalies, §4.19), puis ouvre les réglages et parcourt les six familles.~~ **Fait le 16/10/2026.**
22. ~~Transmettre à Claude les listes des familles « Auteur et titre intervertis » et « Noms d'auteurs mal découpés ».~~ **Fait — `correctifs_2026-10_inversions.sql` puis `correctifs_2026-10_coauteurs.sql` exécutés le 16/10/2026. Vérifié : 433 auteurs, cinq des six familles vides.**
23. Remonter à Claude tout nouveau souci précis (nom du livre concerné) pour correction.
24. ~~**Mode d'emploi propriétaire, en PDF et dans l'application (rubrique Aide des réglages)** — voir §4.23.~~ **Fait le 2026-10-17.**
25. ~~**Christophe redéploie `js/app.js`** (filtre Statut et badges personnels masqués pour les visiteurs — voir §4.24).~~ **Fait le 2026-10-17.**
26. ~~Récupérer automatiquement les couvertures manquantes sur Fnac.com.~~ **Abandonné le 2026-10-18 — voir §4.25.** Les 668 livres sans couverture le restent (jaquette générée). Option qui demeure : dépôt manuel via la section 6, ou import par lot via la section 9 de l'outil.
27. **Christophe redéploie `js/app.js`, `css/style.css`, `supabase_import_tool.html` et `Mode_emploi_proprietaire.pdf`** (ces deux derniers à la racine de `webapp/`, au même niveau qu'`index.html` — les quatre fichiers sont déjà déposés sur le disque dans ce dossier) sur son dépôt GitHub, pour que les deux liens apparaissent dans les réglages — voir §4.26.
28. **Christophe importe la synchronisation du 24 octobre 2026** dans l'outil, dans l'ordre : section 2 avec `1_nouveaux_auteurs_2026-10-24.json`, section 3 avec `2_nouveaux_livres_2026-10-24.json`, puis section 7 avec `3_mise_a_jour_2026-10-24.json` — voir §4.27. Attendu après import : 435 auteurs / 2003 livres.
29. Trancher le cas de `La route du diable` (Franck Thilliez ou Laurent Queyssi ? — voir §4.27) et le signaler à Claude pour correction si besoin.
30. **Christophe redéploie `js/app.js`, `css/style.css` et `index.html`** (champ de recherche corrigé sur iPhone, croix d'effacement — voir §4.28).
31. **Christophe redéploie `index.html`, `css/style.css` et `js/app.js` ensemble** (en-tête façon appli BD, suppression des « Derniers ajouts » — voir §4.29).
32. ~~**Christophe redéploie `index.html`, `css/style.css` et `js/app.js` ensemble — version 1.0** (réglages repliables, numéro de version — voir §4.30).~~ **Fait — vérifié en ligne le 24/10/2026.**
33. ~~**Christophe redéploie … — version 1.1** (lien vers le mode d'emploi PDF — voir §4.31).~~ Remplacé par l'étape 34 (la 1.2 contient la 1.1).
34. ~~**Christophe redéploie … — version 1.2** (recherche limitée au titre affiché — voir §4.32).~~ Remplacé par l'étape 35 (la 1.3 contient la 1.2 et la 1.1).
35. ~~**Christophe redéploie … — version 1.3** (cases de statut — voir §4.33).~~ Remplacé par l'étape 37 (la 1.4 contient les 1.1 à 1.3).
36. **Christophe exécute `migration_2026-10_en_cours.sql`** dans Supabase → SQL Editor → Run (§4.34). La vérification en fin de script doit afficher la colonne `is_in_progress`. Peut se faire avant ou après l'étape 37 : sans la colonne, l'app masque simplement « En cours ».
37. ~~**Christophe redéploie … — version 1.4** (statut « En cours » — voir §4.34).~~ Remplacé par l'étape 39 (la 1.5 contient les 1.1 à 1.4).
38. **Christophe exécute `migration_2026-10_avis.sql`** dans Supabase → SQL Editor → Run (§4.35). La vérification en fin de script doit afficher les trois colonnes `finished_on`, `rating`, `review_comment`. Comme pour l'étape 36, l'ordre avec le redéploiement est libre.
39. ~~**Christophe redéploie … — version 1.5** (Mon avis — voir §4.35).~~ Remplacé par l'étape 40 (la 1.6 contient les 1.1 à 1.5).
40. ~~**Christophe redéploie … — version 1.6** (Mon carnet de lecture — voir §4.36).~~ Remplacé par l'étape 42 (la 1.7 contient les 1.1 à 1.6).
41. Plus tard, au choix de Christophe : options du carnet (graphique des lectures par mois ou par année, répartition des notes, export Excel).
42. **Christophe redéploie `index.html`, `css/style.css` et `js/app.js` ensemble — version 1.7** (design harmonisé — voir §4.37 ; inclut les 1.1 à 1.6). Vérifier « version 1.7 » en bas des Réglages. Les migrations SQL « en cours » et « avis » (étapes 36 et 38) restent à faire si ce n'est pas déjà le cas.

## 6. Notes pour une reprise future du projet

- Le dossier de travail de Claude contient tout le pipeline de données mais n'est **pas** un dépôt git — les fichiers finaux à livrer à Christophe seront un sous-ensemble propre (l'app web + les assets nécessaires), sans les scripts de pipeline ni le `.env`.
- Si des livres semblent mal classés (mauvais genre, mauvaise couverture, doublon manqué), la correction se fait dans `books.pkl`/`final_books.json` puis dans la base Supabase — **ne jamais modifier directement les fichiers epub/mp3 originaux**.
- Le dédoublonnage est une zone sensible signalée explicitement par Christophe ("il risque d'y avoir des doublons... faire attention à n'en noter qu'un"). Toute nouvelle source de données (nouveaux livres ajoutés plus tard) doit repasser par la même logique de normalisation (`normalize.py`) avant d'être insérée.

## 7. Versions des livraisons

**Règle (à appliquer à chaque livraison de l'application, par Claude ou toute autre IA) :**
1. Augmenter le numéro dans `js/app.js` : `APP_VERSION` (et `APP_VERSION_DATE` = date du jour, format `AAAA-MM-JJ`).
   - `+0.1` pour une livraison ordinaire (correctif, retouche, petite fonction) : 1.0 → 1.1 → 1.2…
   - `+1.0` pour une refonte importante (nouvel écran, changement de structure) : 1.9 → 2.0.
2. Reporter **le même numéro** dans `index.html`, dans les deux liens `css/style.css?v=…` et `js/app.js?v=…`.
3. Ajouter une ligne au tableau ci-dessous, et mettre à jour la ligne « Version actuellement livrée » en tête de ce fichier.
4. Toujours livrer ensemble les trois fichiers `index.html`, `css/style.css`, `js/app.js` dès que l'un d'eux change (le numéro est dans les deux premiers et le dernier).
5. Après dépôt sur le PC de Christophe, relire les fichiers sur le PC et comparer leur empreinte (md5) à la version testée — voir l'incident décrit en fin de §4.29.

Une livraison qui ne touche que la base (fichiers JSON d'import, scripts SQL) ne change pas le numéro de l'application.

| Version | Date | Contenu | Détail |
|---|---|---|---|
| 1.0 | 24/10/2026 | Premier numéro de version. Réglages repliables (état mémorisé), numéro de version affiché dans les Réglages et utilisé pour forcer le rechargement des fichiers. Inclut aussi les livraisons du même jour : en-tête repris de l'appli BD, suppression des « Derniers ajouts », pastilles de statut, recherche iPhone corrigée et croix d'effacement. | §4.28, §4.29, §4.30 |
| 1.1 | 24/10/2026 | Lien « Ouvrir le mode d'emploi (PDF) » rétabli dans les Réglages (section Outil d'administration et mode d'emploi, et rubrique Aide), réservé au propriétaire. | §4.31 |
| 1.2 | 24/10/2026 | La recherche ne porte plus que sur le titre affiché et l'auteur : un mot effacé lors d'une correction de titre ne retrouve plus le livre. Exception : une fiche fusionnée reste trouvable sous le titre de la fiche absorbée. Aide mise à jour. | §4.32 |
| 1.3 | 25/10/2026 | Les cases « Lu sur liseuse », « Écouté en audio » et « Favori » se cochent en touchant la case elle-même, plus seulement son texte (iPhone et ordinateur). | §4.33 |
| 1.4 | 25/10/2026 | Nouveau statut « En cours » : case sur la fiche, pastille de recherche dans le bandeau, badge sur les cartes, compteur dans « Où j'en suis ». Cocher Lu ou Écouté décoche En cours ; « Non lus » exclut les livres en cours. Nécessite `migration_2026-10_en_cours.sql` (sinon fonction masquée). | §4.34 |
| 1.5 | 25/10/2026 | « Mon avis » sur la fiche d'un livre lu ou écouté : note de 1 à 10, date de lecture/écoute, commentaire. Privé : visible et même téléchargé en mode propriétaire uniquement. Badge de note sur les cartes, note moyenne dans « Où j'en suis ». Nécessite `migration_2026-10_avis.sql` (sinon fonction masquée). | §4.35 |
| 1.6 | 25/10/2026 | Nouvelle page « Mon carnet de lecture » (icône dans le bandeau, propriétaire seulement) : Où j'en suis (déplacé depuis les Réglages) avec lectures par année, livres en cours, liste des livres lus ou écoutés triable par date, note, titre, auteur et filtrable par année, format, note. | §4.36 |
| 1.7 | 25/10/2026 | Design harmonisé : le langage du bandeau (traits épais, ombres décalées, titres en Bangers, pastilles cerclées) appliqué à toutes les pages — cartes, fiche, Réglages, carnet, anomalies, aide —, dans les couleurs de chaque thème. | §4.37 |

Les livraisons antérieures au 24/10/2026 n'étaient pas numérotées ; leur historique est dans les sections §4.1 à §4.27.
