import { PLAYERS } from '../src/data/players.js';

const keyPlayers = [
  'Macklin Celebrini', 'Matvei Michkov', 'Tim Stützle', 'Lucas Raymond',
  'Rasmus Dahlin', 'Moritz Seider', 'Miro Heiskanen', 'Adam Fox',
  'Luke Hughes', 'Thatcher Demko', 'Juuse Saros', 'Andrei Vasilevskiy',
  'Connor Hellebuyck', 'Sergei Bobrovsky', 'Jake Oettinger', 'Linus Ullmark',
  'Stuart Skinner', 'Jordan Binnington', 'Alexandar Georgiev', 'Pyotr Kochetkov',
  'Logan Thompson', 'Adin Hill', 'Tristan Jarry', 'Filip Gustavsson',
  'Cam Talbot', 'Joey Daccord', 'Charlie Lindgren', 'Ukko-Pekka Luukkonen',
  'John Gibson', 'Petr Mrazek', 'Mackenzie Blackwood', 'Karel Vejmelka'
];

console.log('--- CHECKING KEY NHL PLAYERS ---');
for (const name of keyPlayers) {
  const found = PLAYERS.find(p => p.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(p.name.toLowerCase()));
  if (!found) {
    console.log(`❌ NOT FOUND: ${name}`);
  } else {
    console.log(`✅ FOUND: ${found.name} (#${found.number}, ${found.team}, ${found.position})`);
  }
}
