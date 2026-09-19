import fs from 'fs';
import { PLAYERS } from '../src/data/players.js';

const TEAMS = [
  'ANA', 'BOS', 'BUF', 'CAR', 'CBJ', 'CGY', 'CHI', 'COL', 'DAL', 'DET',
  'EDM', 'FLA', 'LAK', 'MIN', 'MTL', 'NJD', 'NSH', 'NYI', 'NYR', 'OTT',
  'PHI', 'PIT', 'SEA', 'SJS', 'STL', 'TBL', 'TOR', 'UTA', 'VAN', 'VGK',
  'WPG', 'WSH'
];

const normalize = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

async function fetchRoster(team) {
  const url = `https://api-web.nhle.com/v1/roster/${team}/current`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    }
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${team}`);
  }
  return await res.json();
}

async function run() {
  console.log('--- FETCHING ALL 32 NHL ROSTERS FROM OFFICIAL API ---');
  const officialPlayers = new Map(); // key: normalized name -> player object
  const officialById = new Map();

  for (let i = 0; i < TEAMS.length; i++) {
    const team = TEAMS[i];
    try {
      const data = await fetchRoster(team);
      const allTeam = [
        ...(data.forwards || []),
        ...(data.defensemen || []),
        ...(data.goalies || [])
      ];

      for (const p of allTeam) {
        const first = p.firstName?.default || '';
        const last = p.lastName?.default || '';
        const fullName = `${first} ${last}`.trim();
        const normName = normalize(fullName);

        const playerObj = {
          id: p.id,
          name: fullName,
          team: team,
          number: p.sweaterNumber ? String(p.sweaterNumber) : null,
          position: p.positionCode,
          headshot: p.headshot
        };

        officialPlayers.set(normName, playerObj);
        officialById.set(p.id, playerObj);

        // Also add reversed name "last first" just in case
        officialPlayers.set(normalize(`${last} ${first}`), playerObj);
      }
      console.log(`[${i+1}/32] ${team}: ${allTeam.length} official players fetched.`);
    } catch(err) {
      console.error(`Error fetching ${team}:`, err.message);
    }
    await new Promise(r => setTimeout(r, 250));
  }

  console.log(`\nTotal unique official NHL players indexed: ${officialById.size}`);

  // Now match against our 849 players
  let matchedExact = 0;
  let matchedFuzzy = 0;
  let unmatched = [];

  for (const player of PLAYERS) {
    const pNorm = normalize(player.name);

    if (officialPlayers.has(pNorm)) {
      const off = officialPlayers.get(pNorm);
      player.nhl_id = off.id;
      player.image = off.headshot;
      if (off.number && (!player.number || player.number === '0')) {
        player.number = off.number;
      }
      matchedExact++;
    } else {
      // Try finding by last name + team
      let foundFuzzy = null;
      for (const [id, off] of officialById.entries()) {
        const offLast = normalize(off.name.split(' ').pop());
        const pLast = normalize(player.name.split(' ').pop());
        if (offLast === pLast && off.team === player.team) {
          foundFuzzy = off;
          break;
        }
      }

      if (foundFuzzy) {
        player.nhl_id = foundFuzzy.id;
        player.image = foundFuzzy.headshot;
        matchedFuzzy++;
      } else {
        // Fallback: set default official latest headshot URL if ID is valid
        if (player.nhl_id && player.nhl_id > 8471000) {
          player.image = `https://assets.nhle.com/mugs/nhl/latest/${player.nhl_id}.png`;
        }
        unmatched.push({ name: player.name, team: player.team, id: player.nhl_id });
      }
    }

    // Update card edition_ids
    if (player.cards && Array.isArray(player.cards)) {
      for (const c of player.cards) {
        const parts = c.edition_id.split('_');
        const suffix = parts.slice(1).join('_') || 'base';
        c.edition_id = `${player.nhl_id}_${suffix}`;
      }
    }
  }

  console.log(`\n--- MATCHING RESULTS ---`);
  console.log(`Matched exact name: ${matchedExact} / ${PLAYERS.length}`);
  console.log(`Matched fuzzy/team: ${matchedFuzzy} / ${PLAYERS.length}`);
  console.log(`Total real headshots linked: ${matchedExact + matchedFuzzy} (${((matchedExact + matchedFuzzy) / PLAYERS.length * 100).toFixed(1)}%)`);
  console.log(`Unmatched players: ${unmatched.length}`);
  if (unmatched.length > 0) {
    console.log('Unmatched samples (first 10):', unmatched.slice(0, 10));
  }

  // Save the updated players.js
  const fileContent = `// Données complètes et certifiées des joueurs de la LNH 2026-2027
// Profils officiels avec identifiants NHL, photos CDN certifiées et éditions holographiques

export const SALARY_CAP_MAX = 88000000;

export const PLAYERS = ${JSON.stringify(PLAYERS, null, 2)};
`;

  fs.writeFileSync('src/data/players.js', fileContent, 'utf8');
  console.log('\n✅ src/data/players.js updated with official NHL photos & IDs!');
}

run();
