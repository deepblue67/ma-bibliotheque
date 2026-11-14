# Ma Bibliothèque — point de reprise (14/11/2026)

À lire en début de conversation. Tout le détail du projet est dans le README du PC.
(Copie du document « claude/point-de-reprise.md » du projet « Gestion Epub » sur claude.ai.)

## Où sont les choses (PC de Christophe)
- Dossier du projet : `D:\Christophe\IA\IA - Claude\ma-bibliotheque-ebook-audio`
  - `Claude outputs\README.md` : historique complet, décisions, procédures (§4.x), étapes (§5), versions (§7). **À relire avant toute évolution.**
  - `Claude outputs\ma-bibliotheque-webapp\` : l'appli livrée (index.html, robots.txt, css/style.css, js/ en sept fichiers, Mode_emploi_proprietaire.pdf, supabase_import_tool.html).
  - `mode_emploi\mode_emploi.py` : générateur du mode d'emploi PDF.
  - `tests\` : 28 suites Playwright (`node run_all.js`) et banc visuel (`tests\visuel`).
  - `couvertures_epub\`, `genres\`, `doublons\`, `delta\` (`dernier_delta.txt`).
- Sources (lecture seule) : `D:\Christophe\Mes Ebooks`, `D:\Christophe\Mes livres audio`.
- Site : https://livres.cdesmottes.fr (depuis le 14/11/2026 ; l'ancienne adresse deepblue67.github.io/ma-bibliotheque y renvoie). Le dépôt GitHub contient un fichier `CNAME` à ne jamais supprimer. Base Supabase https://nyobnumwltjdzlkbhrrv.supabase.co
- Appli sœur (BD) : dossier `ma-bibliotheque-bd`, site https://bd.cdesmottes.fr — projet séparé.

## État au 14/11/2026
- Version livrée : 3.8 (adresse livres.cdesmottes.fr, site non référencé : « noindex » + robots.txt, Éventail sans cadre). 3.7 : cache du catalogue, app.js en 7 fichiers, CSS nettoyé. 3.6 : sagas, graphiques du carnet, ordre des auteurs.
- Reste côté Christophe : redéployer la 3.8 sur GitHub (avec robots.txt, sans toucher à CNAME) ; se reconnecter sur chaque appareil à la nouvelle adresse ; envoyer les 5 couvertures de `couvertures_epub\images_complement` (section 9) ; valider le lot 9 des genres (section 10) ; importer `6_corrections_titres_2026-11-11.json` (section 7).

## Règles permanentes
- Toujours répondre en français.
- Claude ne pousse jamais sur GitHub et n'écrit jamais dans Supabase : Christophe déploie et importe lui-même.
- Jamais de clé `service_role` ni de mot de passe dans un fichier ou une conversation ; ne jamais rouvrir les inscriptions Supabase.
- Ne jamais modifier, déplacer ni supprimer les epub/mp3/pdf de Christophe.
- Fichiers du PC : vérifier la date (`stat`) avant d'écrire, comparer les empreintes sha256 après dépôt.
- Nouveaux livres : compétence « delta-ebook » (« fais le delta ebook »).
