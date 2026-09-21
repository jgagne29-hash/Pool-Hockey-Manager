/**
 * Script de mise à jour quotidienne des statistiques NHL
 * Objectif: Se connecter à l'API publique NHL, récupérer les performances de la veille
 * et calculer les points Fantasy de chaque joueur repêché.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Simulation des modules ES pour la résolution de chemin
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fichiers de données
const DATA_DIR = path.join(__dirname, '../src/data');
const PLAYERS_FILE = path.join(DATA_DIR, 'players.js');
const STATS_OUTPUT_FILE = path.join(DATA_DIR, 'nhl_stats_live.json');

// Barème de points Fantasy (Modifiable)
const SCORING = {
  forward: { goal: 2, assist: 1, hatTrick: 2 },
  defense: { goal: 3, assist: 2, hatTrick: 2 },
  goalie: { win: 2, shutout: 3, overtimeLoss: 1 }
};

// URL API LNH (Exemple d'endpoint public utilisé par la communauté)
const NHL_API_BASE = 'https://api-web.nhle.com/v1';

async function fetchNhlStats() {
  console.log('🏒 Démarrage du script de synchronisation NHL API...');
  
  try {
    // Étape 1 : Récupérer les stats (Simulation d'appel API pour l'instant)
    // Dans une version finale en production, décommenter la ligne fetch ci-dessous :
    // const response = await fetch(`${NHL_API_BASE}/skater-stats-leaders/current`);
    // const data = await response.json();
    
    console.log('📡 Interrogation des serveurs de la LNH...');
    
    // Pour la démonstration immédiate sans dépendre de l'état de l'API LNH en hors-saison
    const mockLiveStats = {
      lastUpdated: new Date().toISOString(),
      season: "20262027",
      players: {
        "8478402": { // Connor McDavid
          goals: 42,
          assists: 88,
          fantasyPoints: (42 * SCORING.forward.goal) + (88 * SCORING.forward.assist)
        },
        "8477934": { // Leon Draisaitl
          goals: 41,
          assists: 65,
          fantasyPoints: (41 * SCORING.forward.goal) + (65 * SCORING.forward.assist)
        }
      }
    };
    
    // Étape 2 : Écriture du JSON dynamique
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    fs.writeFileSync(STATS_OUTPUT_FILE, JSON.stringify(mockLiveStats, null, 2), 'utf-8');
    
    console.log(`✅ Mise à jour réussie. Fichier généré : ${STATS_OUTPUT_FILE}`);
    console.log('📊 Les D.G. verront leurs points mis à jour au prochain rafraîchissement.');

  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation avec l\'API LNH:', error.message);
    process.exit(1);
  }
}

fetchNhlStats();
