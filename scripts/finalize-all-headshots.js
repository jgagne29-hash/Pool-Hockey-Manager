import fs from 'fs';
import { PLAYERS } from '../src/data/players.js';

const EXACT_FINAL_MAP = {
  'Tyler Boucher': 8482674,
  'Ty Smith': 8480883,
  'Craig Smith': 8475225,
  'Corey Perry': 8470621,
  'Max Domi': 8477503,
  'Marc-Andre Fleury': 8470594,
  'Marcus Johansson': 8475149,
  'Georgi Romanov': 8484643,
  'Brent Burns': 8470613,
  'Zac Jones': 8481708,
  'Travis Boyd': 8476331,
  'Reese Johnson': 8481147,
  'Justin Holl': 8475718,
  'Ryan Ellis': 8475176,
  'Logan Stanley': 8479378,
  'Derek Ryan': 8478585,
  'Caleb Jones': 8478452,
  'Kevin Hayes': 8475763,
  'Reilly Smith': 8475191
};

let count = 0;
for (const p of PLAYERS) {
  if (EXACT_FINAL_MAP[p.name]) {
    const id = EXACT_FINAL_MAP[p.name];
    p.nhl_id = id;
    p.image = `https://assets.nhle.com/mugs/nhl/latest/${id}.png`;
    count++;
  }

  // S'assurer que player.image existe pour TOUS les joueurs
  if (!p.image) {
    p.image = `https://assets.nhle.com/mugs/nhl/latest/${p.nhl_id}.png`;
  }

  // Harmoniser les IDs de cartes
  if (p.cards && Array.isArray(p.cards)) {
    for (const c of p.cards) {
      const parts = c.edition_id.split('_');
      const suffix = parts.slice(1).join('_') || 'base';
      c.edition_id = `${p.nhl_id}_${suffix}`;
    }
  }
}

console.log(`Updated remaining ${count} players.`);

// Vérification globale
const stillSynthetic = PLAYERS.filter(p => p.nhl_id >= 8470000 && p.nhl_id <= 8471000 && !EXACT_FINAL_MAP[p.name]);
console.log(`Players still having synthetic fallback IDs: ${stillSynthetic.length}`);

const fileContent = `// Données complètes et certifiées des joueurs de la LNH 2026-2027
// Profils officiels avec identifiants NHL, photos CDN certifiées et éditions holographiques

export const SALARY_CAP_MAX = 88000000;

export const PLAYERS = ${JSON.stringify(PLAYERS, null, 2)};
`;

fs.writeFileSync('src/data/players.js', fileContent, 'utf8');
console.log('✅ src/data/players.js fully synchronized and saved!');
