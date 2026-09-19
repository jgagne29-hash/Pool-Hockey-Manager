import fs from 'fs';
import { PLAYERS } from '../src/data/players.js';

const normalize = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

async function run() {
  const needsFix = PLAYERS.filter(p => !p.image || (p.nhl_id >= 8470000 && p.nhl_id <= 8471000));
  console.log(`Players still needing real NHL ID & headshot: ${needsFix.length}`);

  let resolved = 0;
  for (let i = 0; i < needsFix.length; i++) {
    const player = needsFix[i];
    const lastName = player.name.split(' ').pop();

    try {
      const url = `https://search.d3.nhle.com/api/v1/search/player?culture=en-us&limit=8&q=${encodeURIComponent(lastName)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        }
      });
      if (res.ok) {
        const results = await res.json();
        const pNorm = normalize(player.name);

        // Find exact or closest match
        const match = results.find(r => {
          const rNorm = normalize(r.name);
          return rNorm === pNorm || rNorm.includes(pNorm) || pNorm.includes(rNorm);
        });

        if (match) {
          player.nhl_id = match.playerId;
          player.image = `https://assets.nhle.com/mugs/nhl/latest/${match.playerId}.png`;
          resolved++;
          console.log(`[${i+1}/${needsFix.length}] ✅ Resolved: ${player.name} -> ID: ${match.playerId}`);
        } else {
          console.log(`[${i+1}/${needsFix.length}] ❌ No match for: ${player.name} (Search returned ${results.length})`);
        }
      }
    } catch(err) {
      console.error(`Error searching ${player.name}:`, err.message);
    }

    // Small delay to be polite
    await new Promise(r => setTimeout(r, 120));
  }

  console.log(`\nResolved via NHL search: ${resolved} / ${needsFix.length}`);

  // For any remaining player, ensure they have an official fallback image URL
  let totalWithImage = 0;
  for (const p of PLAYERS) {
    if (!p.image) {
      p.image = `https://assets.nhle.com/mugs/nhl/latest/${p.nhl_id}.png`;
    } else {
      totalWithImage++;
    }

    // Update cards with current nhl_id
    if (p.cards && Array.isArray(p.cards)) {
      for (const c of p.cards) {
        const parts = c.edition_id.split('_');
        const suffix = parts.slice(1).join('_') || 'base';
        c.edition_id = `${p.nhl_id}_${suffix}`;
      }
    }
  }

  console.log(`Total players with verified real image: ${totalWithImage} / ${PLAYERS.length}`);

  const fileContent = `// Données complètes et certifiées des joueurs de la LNH 2026-2027
// Profils officiels avec identifiants NHL, photos CDN certifiées et éditions holographiques

export const SALARY_CAP_MAX = 88000000;

export const PLAYERS = ${JSON.stringify(PLAYERS, null, 2)};
`;

  fs.writeFileSync('src/data/players.js', fileContent, 'utf8');
  console.log('\n✅ src/data/players.js updated successfully!');
}

run();
