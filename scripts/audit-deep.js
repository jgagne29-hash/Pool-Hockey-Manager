import { PLAYERS } from '../src/data/players.js';

console.log('--- DEEP DIVE AUDIT ---');

// 1. Check headshots
let missingHeadshots = 0;
let invalidHeadshots = 0;
for (const p of PLAYERS) {
  if (!p.image) {
    missingHeadshots++;
  } else if (!p.image.startsWith('http')) {
    invalidHeadshots++;
  }
}
console.log(`Missing headshots: ${missingHeadshots}, Invalid headshots: ${invalidHeadshots}`);

// 2. Check teams & team_name consistency
const teamNameMap = new Map();
for (const p of PLAYERS) {
  if (!teamNameMap.has(p.team)) {
    teamNameMap.set(p.team, new Set());
  }
  teamNameMap.get(p.team).add(p.team_name);
}
console.log('\n--- Teams and Team Names ---');
for (const [code, names] of teamNameMap.entries()) {
  console.log(`${code}: ${Array.from(names).join(', ')}`);
}

// 3. Check stats outliers
let zeroStats = [];
let crazyPoints = [];
for (const p of PLAYERS) {
  if (p.position === 'G') {
    if (p.stats.wins === 0 && p.stats.losses === 0 && p.stats.ot === 0) {
      zeroStats.push({ name: p.name, team: p.team, pos: p.position });
    }
  } else {
    if (p.stats.g === 0 && p.stats.a === 0 && (!p.stats.plusMinus || p.stats.plusMinus === '0')) {
      zeroStats.push({ name: p.name, team: p.team, pos: p.position });
    }
    const pts = p.stats.pts || ((p.stats.g || 0) + (p.stats.a || 0));
    if (pts > 160) {
      crazyPoints.push({ name: p.name, pts });
    }
  }
}
console.log(`\nZero stats count: ${zeroStats.length}`);
if (zeroStats.length > 0) {
  console.log('Sample zero stats:', zeroStats.slice(0, 5));
}
console.log(`Crazy points (>160): ${crazyPoints.length}`);

// 4. Check superstar players verification
const superstars = [
  'Connor McDavid', 'Nathan MacKinnon', 'Nikita Kucherov', 'Auston Matthews',
  'Cale Makar', 'Leon Draisaitl', 'Artemi Panarin', 'David Pastrnak',
  'Cole Caufield', 'Nick Suzuki', 'Juraj Slafkovsky', 'Lane Hutson',
  'Samuel Montembeault', 'Connor Bedard', 'Sidney Crosby', 'Alex Ovechkin',
  'Quinn Hughes', 'Jack Hughes', 'Igor Shesterkin', 'Jeremy Swayman'
];

const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
for (const name of superstars) {
  const found = PLAYERS.find(p => norm(p.name) === norm(name));
  if (!found) {
    console.log(`❌ MISSING SUPERSTAR: ${name}`);
  } else {
    console.log(`✅ ${found.name} (#${found.number}, ${found.team}, Pos: ${found.position}, Cap: ${(found.base_cap_hit/1e6).toFixed(2)}M$, Stats: ${JSON.stringify(found.stats)})`);
  }
}
