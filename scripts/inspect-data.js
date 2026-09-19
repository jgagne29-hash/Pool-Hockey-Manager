import fs from 'fs';

const data = JSON.parse(fs.readFileSync('data/nhl_data_2026-09-18T15-03-19-297Z.json', 'utf8'));

const types = {};
let playerStats = [];
let rosters = [];

for (const item of data) {
  types[item.dataType] = (types[item.dataType] || 0) + 1;
  if (item.dataType === 'playerStat') {
    playerStats.push(item.data);
  } else if (item.dataType === 'roster') {
    rosters.push(item.data);
  }
}

console.log('Types de données:', types);
console.log('Nb playerStats:', playerStats.length);
console.log('Nb rosters:', rosters.length);

if (playerStats.length > 0) {
  console.log('Exemple de playerStat:', JSON.stringify(playerStats[0], null, 2));
}
if (rosters.length > 0) {
  console.log('Exemple de roster:', JSON.stringify(rosters[0], null, 2));
}
