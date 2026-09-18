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

  // 4. Sauvegarde locale
  const dataDir = path.resolve(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outFile = path.join(dataDir, `nhl_data_${timestamp}.json`);
  fs.writeFileSync(outFile, JSON.stringify(items, null, 2), 'utf8');
  console.log(`💾 Données sauvegardées dans: ${outFile}`);

  // 5. Résumé des données
  const endpointsFound = {};
  items.forEach((item) => {
    const type = item.endpoint || item.type || item.dataType || 'autre';
    endpointsFound[type] = (endpointsFound[type] || 0) + 1;
  });

  console.log('\n--- RÉSUMÉ DES DONNÉES EXTRAITES ---');
  console.log(`Dataset ID: ${defaultDatasetId}`);
  console.log(`Total d'éléments: ${items.length}`);
  console.table(endpointsFound);

  return { defaultDatasetId, total: items.length, outFile };
}

run().catch((err) => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});
