import { PLAYERS } from '../src/data/players.js';

console.log(`Total players loaded: ${PLAYERS.length}`);

const validPositions = new Set(['C', 'LW', 'RW', 'D', 'G']);
const validTeams = new Set([
  'ANA', 'BOS', 'BUF', 'CAR', 'CBJ', 'CGY', 'CHI', 'COL', 'DAL', 'DET',
  'EDM', 'FLA', 'LAK', 'MIN', 'MTL', 'NJD', 'NSH', 'NYI', 'NYR', 'OTT',
  'PHI', 'PIT', 'SEA', 'SJS', 'STL', 'TBL', 'TOR', 'UTA', 'VAN', 'VGK',
  'WPG', 'WSH'
]);

let anomalies = {
  invalidPosition: [],
  invalidTeam: [],
  missingName: [],
  missingNumber: [],
  invalidCapHit: [],
  goalieWithSkaterStats: [],
  skaterWithGoalieStats: [],
  missingStats: [],
  duplicateIds: [],
  missingCards: [],
  invalidCards: [],
  corruptedFields: []
};

const idCount = new Map();

for (const p of PLAYERS) {
  // Check duplicates
  idCount.set(p.nhl_id, (idCount.get(p.nhl_id) || 0) + 1);

  if (!p.name || typeof p.name !== 'string' || p.name.trim() === '') {
    anomalies.missingName.push(p);
  }

  if (!validPositions.has(p.position)) {
    anomalies.invalidPosition.push({ id: p.nhl_id, name: p.name, pos: p.position });
  }

  if (!p.team || !validTeams.has(p.team)) {
    anomalies.invalidTeam.push({ id: p.nhl_id, name: p.name, team: p.team });
  }

  if (p.number === undefined || p.number === null || isNaN(Number(p.number))) {
    anomalies.missingNumber.push({ id: p.nhl_id, name: p.name, num: p.number });
  }

  if (!p.base_cap_hit || p.base_cap_hit < 700000 || p.base_cap_hit > 16000000) {
    anomalies.invalidCapHit.push({ id: p.nhl_id, name: p.name, cap: p.base_cap_hit });
  }

  if (!p.stats) {
    anomalies.missingStats.push({ id: p.nhl_id, name: p.name });
  } else {
    if (p.position === 'G') {
      if (p.stats.wins === undefined || p.stats.gaa === undefined || p.stats.svPct === undefined) {
        anomalies.goalieWithSkaterStats.push({ id: p.nhl_id, name: p.name, stats: p.stats });
      }
    } else {
      if (p.stats.g === undefined || p.stats.a === undefined) {
        anomalies.skaterWithGoalieStats.push({ id: p.nhl_id, name: p.name, stats: p.stats });
      }
    }
  }

  if (!p.cards || !Array.isArray(p.cards) || p.cards.length === 0) {
    anomalies.missingCards.push({ id: p.nhl_id, name: p.name });
  } else {
    for (const c of p.cards) {
      if (!c.edition_id || !c.rarity || !c.multiplier) {
        anomalies.invalidCards.push({ id: p.nhl_id, name: p.name, card: c });
      }
    }
  }
}

for (const [id, count] of idCount.entries()) {
  if (count > 1) {
    anomalies.duplicateIds.push({ id, count });
  }
}

console.log('--- AUDIT REPORT ---');
for (const [k, v] of Object.entries(anomalies)) {
  console.log(`${k}: ${v.length}`);
  if (v.length > 0 && v.length <= 10) {
    console.log(JSON.stringify(v, null, 2));
  } else if (v.length > 10) {
    console.log(`First 5 samples:`, JSON.stringify(v.slice(0, 5), null, 2));
  }
}
