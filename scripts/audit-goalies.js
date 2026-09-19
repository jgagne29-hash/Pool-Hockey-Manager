import { PLAYERS } from '../src/data/players.js';

const goalies = PLAYERS.filter(p => p.position === 'G');
console.log(`Total goalies: ${goalies.length}`);

for (const g of goalies) {
  console.log(`${g.name} (#${g.number}, ${g.team}) - W:${g.stats?.wins} SV:${g.stats?.svPct} GAA:${g.stats?.gaa}`);
}
