# Ma Bibliothèque — Journal de bord du projet

Ce fichier a deux rôles :
1. Permettre à Christophe de se rappeler comment l'application fonctionne.
2. Permettre à une IA (Claude, Codex, etc.) de reprendre rapidement le projet plus tard pour le corriger ou le faire évoluer.

**Ce fichier doit être mis à jour à chaque changement fonctionnel, visuel ou technique important.**

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

## 3. Chiffres clés (dernière mise à jour : peuplement Supabase terminé)

- **436 auteurs** et **1944 livres uniques** effectivement présents dans Supabase (sur 1945 fiches préparées à l'origine — un vrai doublon entre deux lots d'import portait sur le même livre de Ken Follett, "Un Monde Sans Fin", et a fusionné en une seule ligne comme prévu par la contrainte d'unicité auteur+titre).
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

Fonctions disponibles :
- **Import d'auteurs** : colle/charge un JSON `[{"name": "...", "name_sort": "..."}]`, upsert idempotent (les doublons par `name` sont fusionnés, pas dupliqués).
- **Import de livres** : colle/charge un JSON de livres (voir format dans l'outil), résout automatiquement l'auteur par nom, ignore les doublons déjà présents (par auteur+titre), et téléverse automatiquement la couverture si un `cover_i` Open Library est fourni.
- **Téléversement de couvertures seules** : pour ajouter/remplacer des couvertures sur des livres déjà en base.
- **Requête personnalisée** : pour un correctif ponctuel (GET/POST/PATCH/DELETE brut vers l'API REST Supabase) — à utiliser avec précaution.

Christophe doit coller sa clé `service_role` directement dans la page (jamais sauvegardée, jamais envoyée ailleurs qu'à son propre projet Supabase). C'est l'outil à utiliser pour toute correction ou ajout de données futur (nouveaux livres, correctifs de genre, ajout de livres audio manquants, etc.) — Claude peut préparer le JSON à coller, mais l'exécution se fait chez Christophe.

## 5. Prochaines étapes (dans l'ordre)

1. ~~Christophe exécute `supabase_schema.sql` une fois dans Supabase Studio → SQL Editor → Run.~~ **Fait.**
2. ~~Christophe choisit un design parmi les 10 propositions envoyées.~~ **Fait — design 06 Nordique.**
3. ~~Claude téléverse les couvertures dans le bucket `covers` et peuple les tables `authors`/`books`.~~ **Fait — 436 auteurs, 1944 livres, 795 couvertures.**
4. ~~Claude construit l'application web selon le design choisi.~~ **Fait.**
5. ~~Claude propose 10 logos pour l'icône d'écran d'accueil.~~ **Fait — logo 05 "Livre courbe".**
6. **Christophe télécharge `ma-bibliotheque-webapp.zip`, en extrait le contenu, et le pousse sur son propre dépôt GitHub (Pages activé sur la branche/dossier choisi).** Claude ne pousse jamais directement sur GitHub.
7. Christophe ouvre l'app une fois en ligne et vérifie que tout s'affiche correctement (auteurs, recherche, filtres, couvertures, cases lu/écouté/favori) — remonter tout souci à Claude pour correction.

## 6. Notes pour une reprise future du projet

- Le dossier de travail de Claude contient tout le pipeline de données mais n'est **pas** un dépôt git — les fichiers finaux à livrer à Christophe seront un sous-ensemble propre (l'app web + les assets nécessaires), sans les scripts de pipeline ni le `.env`.
- Si des livres semblent mal classés (mauvais genre, mauvaise couverture, doublon manqué), la correction se fait dans `books.pkl`/`final_books.json` puis dans la base Supabase — **ne jamais modifier directement les fichiers epub/mp3 originaux**.
- Le dédoublonnage est une zone sensible signalée explicitement par Christophe ("il risque d'y avoir des doublons... faire attention à n'en noter qu'un"). Toute nouvelle source de données (nouveaux livres ajoutés plus tard) doit repasser par la même logique de normalisation (`normalize.py`) avant d'être insérée.
