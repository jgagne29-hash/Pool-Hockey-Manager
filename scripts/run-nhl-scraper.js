import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APIFY_TOKEN = process.env.APIFY_TOKEN || '';
const ACTOR_ID = 'tempting_finch~nhl-data-scraper';

const defaultInput = {
  seasons: ['20242025'],
  endpoints: ['standings', 'rosters', 'playerStats'],
  includeAdvancedStats: false,
  riskySources: false,
  maxResultsPerEndpoint: 5000,
  requestDelayMs: 1000
};

async function run() {
  console.log('🚀 Lancement de l\'Actor Apify : tempting_finch/nhl-data-scraper...');
  console.log('📋 Paramètres :', JSON.stringify(defaultInput, null, 2));

  // 1. Démarrer le run
  const runUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`;
  const startResponse = await fetch(runUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(defaultInput)
  });

  if (!startResponse.ok) {
    const errText = await startResponse.text();
    throw new Error(`Erreur lors du démarrage du run (${startResponse.status}): ${errText}`);
  }

  const startData = await startResponse.json();
  const runId = startData.data.id;
  const defaultDatasetId = startData.data.defaultDatasetId;
  console.log(`✅ Run démarré avec succès ! ID: ${runId}`);
  console.log(`📦 Dataset cible: ${defaultDatasetId}`);
  console.log('⏳ Attente de la fin de l\'exécution...');

  // 2. Attendre que le run soit terminé
  let status = 'RUNNING';
  while (status === 'RUNNING' || status === 'READY') {
    await new Promise((r) => setTimeout(r, 4000));
    const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
    const statusData = await statusRes.json();
    status = statusData.data.status;
    process.stdout.write(`\r[Statut: ${status}] Durée: ${statusData.data.stats?.durationMillis ? Math.round(statusData.data.stats.durationMillis / 1000) + 's' : '...'}`);
    if (status === 'SUCCEEDED' || status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
      console.log('');
      break;
    }
  }

  if (status !== 'SUCCEEDED') {
    console.error(`❌ Le run s'est terminé avec le statut: ${status}`);
    return;
  }

  console.log('🎉 Extraction terminée avec succès ! Récupération des données du dataset...');

  // 3. Récupérer les items du dataset
  const datasetUrl = `https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${APIFY_TOKEN}&format=json`;
  const dataRes = await fetch(datasetUrl);
  const items = await dataRes.json();

  console.log(`📊 Nombre total d'enregistrements récupérés: ${items.length}`);

  // 4. Sauvegarde locale des données brutes
  const dataDir = path.resolve(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outFile = path.join(dataDir, `nhl_data_${timestamp}.json`);
  fs.writeFileSync(outFile, JSON.stringify(items, null, 2), 'utf8');
  console.log(`💾 Données brutes sauvegardées dans: ${outFile}`);

  // 5. NOUVEAU: Extraction et formatage des joueurs pour le Pool
  console.log('⚙️ Génération de la base de données (players.js) avec Variantes et AHL...');
  
  // On simule ici la structure extraite de l'Apify Actor ou de l'API LNH/AHL
  // Dans la réalité, on itère sur items.filter(i => i.type === 'playerStats')
  const generatedPlayers = [];
  
  // Parcourir les vrais joueurs extraits par l'Actor
  const playerItems = items.filter(i => i.endpoint === 'playerStats' || i.type === 'player');
  
  playerItems.forEach((p, index) => {
    // Si l'acteur ne ramène rien, on bypass
    if (!p.id) return;
    
    generatedPlayers.push({
      nhl_id: p.id,
      name: p.fullName || `${p.firstName} ${p.lastName}`,
      team: p.teamId ? String(p.teamId) : 'FA',
      team_name: p.teamName || 'Free Agent',
      position: p.positionCode || 'F',
      number: p.sweaterNumber || 0,
      image: `https://assets.nhle.com/mugs/nhl/latest/${p.id}.png`,
      base_cap_hit: p.capHit || 1000000,
      is_ahl: p.league === 'AHL', // Flag AHL
      stats: {
        games: p.gamesPlayed || 0,
        goals: p.goals || 0,
        assists: p.assists || 0,
        points: (p.goals || 0) + (p.assists || 0),
        rating: Math.floor(Math.random() * 20) + 75 // Mock rating based on real stats later
      },
      cards: [
        { edition_id: `${p.id}_base`, edition_name: "Édition Base", rarity: "Base", multiplier: 1.0, bg_color: "#161922" },
        { edition_id: `${p.id}_retro`, edition_name: "Édition Retro 90s", rarity: "Édition Retro 90s", multiplier: 1.6, bg_color: "#ff0055" },
        // On génère une carte rare aléatoire 1 fois sur 10
        ...(Math.random() > 0.9 ? [{ edition_id: `${p.id}_patch`, edition_name: "The Patch (1-of-1)", rarity: "The Patch (1-of-1)", multiplier: 3.5, bg_color: "#faad14", is_one_of_one: true, serial: "1/1" }] : [])
      ]
    });
  });

  if (generatedPlayers.length > 0) {
    const srcDataDir = path.resolve(__dirname, '../src/data');
    const playersFile = path.join(srcDataDir, 'players_generated.js');
    fs.writeFileSync(playersFile, `export const PLAYERS = ${JSON.stringify(generatedPlayers, null, 2)};\n\nexport const SALARY_CAP_MAX = 88000000;`, 'utf8');
    console.log(`✅ ${generatedPlayers.length} joueurs ont été formatés et sauvegardés dans ${playersFile} (incluant les espoirs AHL).`);
  } else {
    console.log(`⚠️ Aucun joueur trouvé dans l'extraction. (Les vrais appels API LNH seront utilisés en fallback).`);
  }

  return { defaultDatasetId, total: items.length, outFile };
}

run().catch((err) => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});
