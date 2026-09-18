# Workspace Pool Sportif (NHL)

Bienvenue dans le workspace dédié au **Pool Sportif de la LNH (NHL)**.

Ce workspace est configuré pour collecter, analyser et structurer toutes les statistiques officielles de hockey via l'Actor Apify `tempting_finch/nhl-data-scraper`.

---

## 🛠️ Architecture du Projet

- **`Pool_Sportif.code-workspace`** : Fichier pour ouvrir directement l'espace de travail dans Antigravity ou VS Code.
- **`.agents/`** : Directives IA spécialisées dans l'analyse de hockey et règles du pool.
- **`.vscode/mcp.json` & `.agents/mcp_config.json`** : Configuration native du serveur MCP Apify.
- **`scripts/`** :
  - `test-connection.js` : Vérifie l'état de l'authentification Apify.
  - `run-nhl-scraper.js` : Déclenche l'Actor Apify, attend les résultats et sauvegarde les données en local.
- **`data/`** : Contient les exports JSON et les jeux de données des classements, alignements et statistiques des joueurs.

---

## 🏒 Exécution du Scraper NHL

Pour lancer la collecte des statistiques (classements, alignements, stats des joueurs pour 2024-2025) :

```bash
node scripts/run-nhl-scraper.js
```

---

## 🔌 Intégration MCP (Model Context Protocol)

Le serveur MCP Apify est branché avec les outils suivants :
- `actors` : Gestion des acteurs Apify.
- `docs` : Documentation Apify.
- `tempting_finch/nhl-data-scraper` : Scraper officiel NHL avec schéma de données structuré.

Clé d'API configurée : `apify_api_********************`
Compte connecté : **Notorious_Hockey** (Jonathan Gagne)
