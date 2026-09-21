import fs from 'fs';
import { PLAYERS, SALARY_CAP_MAX } from '../src/data/players.js';

console.log(`Initial total players: ${PLAYERS.length}`);

// Définition des 6 variantes officielles
// Base : 70% / x1.0 / Cap standard
// Régulière : 20% / x1.2 / +10% Cap Hit
// Super : 6% / x1.5 / +25% Cap Hit
// Ultra : 2% / x1.9 / +50% Cap Hit
// Mystique : 1.5% / x2.5 / Double Cap Hit (+100%)
// The Patch (1-of-1) : 0.5% / x3.5 / Max Cap Hit (+150%) - Unique #1/1

const VARIANT_CONFIGS = [
  {
    type: 'base',
    edition_id_suffix: 'base',
    edition_name: 'Édition Base',
    rarity: 'Base',
    drop_rate: 0.70,
    multiplier: 1.0,
    cap_modifier: 1.0,
    bg_color: '#161922',
    serial: null
  },
  {
    type: 'regular',
    edition_id_suffix: 'regular',
    edition_name: 'Édition Régulière Prismatique',
    rarity: 'Régulière',
    drop_rate: 0.20,
    multiplier: 1.2,
    cap_modifier: 1.10,
    bg_color: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)',
    serial: null
  },
  {
    type: 'super',
    edition_id_suffix: 'super',
    edition_name: 'Édition Super Or Brossé',
    rarity: 'Super',
    drop_rate: 0.06,
    multiplier: 1.5,
    cap_modifier: 1.25,
    bg_color: 'linear-gradient(135deg, #b9935a 0%, #e7c996 50%, #9a7432 100%)',
    serial: null
  },
  {
    type: 'ultra',
    edition_id_suffix: 'ultra',
    edition_name: 'Édition Ultra Rubis Cosmique',
    rarity: 'Ultra',
    drop_rate: 0.02,
    multiplier: 1.9,
    cap_modifier: 1.50,
    bg_color: 'linear-gradient(135deg, #ff0844 0%, #ffb199 50%, #ff0055 100%)',
    serial: null
  },
  {
    type: 'mystique',
    edition_id_suffix: 'mystique',
    edition_name: 'Édition Mystique Améthyste',
    rarity: 'Mystique',
    drop_rate: 0.015,
    multiplier: 2.5,
    cap_modifier: 2.0,
    bg_color: 'linear-gradient(135deg, #471069 0%, #8a2387 50%, #e94057 100%)',
    serial: null
  },
  {
    type: 'patch',
    edition_id_suffix: 'patch',
    edition_name: 'The Patch Authentique (1-of-1)',
    rarity: 'The Patch (1-of-1)',
    drop_rate: 0.005,
    multiplier: 3.5,
    cap_modifier: 2.5,
    bg_color: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    serial: '1/1',
    is_one_of_one: true
  }
];

let totalCardsGenerated = 0;

for (const player of PLAYERS) {
  const baseCap = player.base_cap_hit || 1500000;
  const pId = player.nhl_id;

  player.cards = VARIANT_CONFIGS.map(cfg => {
    totalCardsGenerated++;
    return {
      edition_id: `${pId}_${cfg.edition_id_suffix}`,
      edition_name: cfg.edition_name,
      rarity: cfg.rarity,
      drop_rate: cfg.drop_rate,
      multiplier: cfg.multiplier,
      cap_hit: Math.round(baseCap * cfg.cap_modifier),
      bg_color: cfg.bg_color,
      serial: cfg.serial || null,
      is_one_of_one: !!cfg.is_one_of_one,
      default_durability_days: 35
    };
  });
}

console.log(`Generated ${totalCardsGenerated} variant cards across ${PLAYERS.length} players.`);
console.log(`Sample card variants for ${PLAYERS[0].name}:`);
console.log(JSON.stringify(PLAYERS[0].cards, null, 2));

const fileContent = `// Données complètes et certifiées des joueurs de la LNH 2026-2027
// Profils officiels avec identifiants NHL, photos CDN certifiées et les 6 variantes TCG

export const SALARY_CAP_MAX = ${SALARY_CAP_MAX || 104000000};

export const PLAYERS = ${JSON.stringify(PLAYERS, null, 2)};
`;

fs.writeFileSync('src/data/players.js', fileContent, 'utf8');
console.log('✅ src/data/players.js successfully updated with the 6 official TCG variants!');
