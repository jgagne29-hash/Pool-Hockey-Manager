import fs from 'fs';
import { PLAYERS } from '../src/data/players.js';

console.log(`Initial total players: ${PLAYERS.length}`);

// Normalisation des positions
// L -> LW, R -> RW
let countPosFixed = 0;
for (const p of PLAYERS) {
  if (p.position === 'L') {
    p.position = 'LW';
    countPosFixed++;
  } else if (p.position === 'R') {
    p.position = 'RW';
    countPosFixed++;
  }
}
console.log(`Wingers position normalized (L->LW, R->RW): ${countPosFixed}`);

// Mappage des corrections individuelles spécifiques
const SPECIFIC_CORRECTIONS = {
  // Canadiens de Montréal
  "juraj slafkovsky": {
    name: "Juraj Slafkovský",
    nhl_id: 8483515,
    team: "MTL",
    team_name: "Canadiens de Montréal",
    position: "LW",
    number: "20",
    base_cap_hit: 7600000,
    stats: { gp: 82, g: 20, a: 30, pts: 50, plusMinus: "-19" },
    cardName: "Colosse Slovaque No 1"
  },
  "ivan demidov": {
    nhl_id: 8484984,
    team: "MTL",
    team_name: "Canadiens de Montréal",
    position: "RW",
    number: "93",
    base_cap_hit: 950000,
    cardName: "Pépite Russe Première Ronde"
  },
  "lane hutson": {
    nhl_id: 8483460,
    team: "MTL",
    team_name: "Canadiens de Montréal",
    position: "D",
    number: "48",
    base_cap_hit: 950000
  },
  "cole caufield": {
    nhl_id: 8481540,
    team: "MTL",
    team_name: "Canadiens de Montréal",
    position: "RW",
    number: "13",
    base_cap_hit: 7850000
  },
  "nick suzuki": {
    nhl_id: 8480018,
    team: "MTL",
    team_name: "Canadiens de Montréal",
    position: "C",
    number: "14",
    base_cap_hit: 7875000
  },
  "patrik laine": {
    nhl_id: 8479337,
    team: "MTL",
    team_name: "Canadiens de Montréal",
    position: "RW",
    number: "92",
    base_cap_hit: 8700000
  },
  "samuel montembeault": {
    nhl_id: 8478499,
    team: "MTL",
    team_name: "Canadiens de Montréal",
    position: "G",
    number: "35",
    base_cap_hit: 3150000
  },

  // Nouvelles Recrues & Phénomènes LNH
  "macklin celebrini": {
    nhl_id: 8484801,
    team: "SJS",
    team_name: "Sharks de San José",
    position: "C",
    number: "71",
    base_cap_hit: 950000,
    cardName: "Choix 1er Au Total 2024"
  },
  "matvei michkov": {
    nhl_id: 8484387,
    team: "PHI",
    team_name: "Flyers de Philadelphie",
    position: "RW",
    number: "39",
    base_cap_hit: 950000,
    cardName: "Mage Russe des Flyers"
  },
  "connor bedard": {
    nhl_id: 8484144,
    team: "CHI",
    team_name: "Blackhawks de Chicago",
    position: "C",
    number: "98",
    base_cap_hit: 950000
  },
  "tim stutzle": {
    nhl_id: 8482116,
    team: "OTT",
    team_name: "Sénateurs d'Ottawa",
    position: "C",
    number: "18",
    base_cap_hit: 8350000
  },

  // Superstars avec équipes / IDs corrigés
  "mikko rantanen": {
    nhl_id: 8478420,
    team: "COL",
    team_name: "Avalanche du Colorado",
    position: "RW",
    number: "96",
    base_cap_hit: 9250000
  },
  "kirill kaprizov": {
    nhl_id: 8478864,
    team: "MIN",
    team_name: "Wild du Minnesota",
    position: "LW",
    number: "97",
    base_cap_hit: 9000000
  },
  "william nylander": {
    nhl_id: 8477939,
    team: "TOR",
    team_name: "Maple Leafs de Toronto",
    position: "RW",
    number: "88",
    base_cap_hit: 11500000
  },
  "mitch marner": {
    nhl_id: 8478483,
    team: "TOR",
    team_name: "Maple Leafs de Toronto",
    position: "RW",
    number: "16",
    base_cap_hit: 10900000
  },
  "alexis lafreniere": {
    nhl_id: 8482093,
    team: "NYR",
    team_name: "Rangers de New York",
    position: "LW",
    number: "13",
    base_cap_hit: 7450000
  },
  "matthew tkachuk": {
    nhl_id: 8479314,
    team: "FLA",
    team_name: "Panthers de la Floride",
    position: "LW",
    number: "19",
    base_cap_hit: 9500000
  },
  "brady tkachuk": {
    nhl_id: 8480801,
    team: "OTT",
    team_name: "Sénateurs d'Ottawa",
    position: "LW",
    number: "7",
    base_cap_hit: 8200000
  },
  "jack hughes": {
    nhl_id: 8481559,
    team: "NJD",
    team_name: "Devils du New Jersey",
    position: "C",
    number: "86",
    base_cap_hit: 8000000
  },
  "roman josi": {
    nhl_id: 8474600,
    team: "NSH",
    team_name: "Predators de Nashville",
    position: "D",
    number: "59",
    base_cap_hit: 9059000
  },
  "victor hedman": {
    nhl_id: 8475171,
    team: "TBL",
    team_name: "Lightning de Tampa Bay",
    position: "D",
    number: "77",
    base_cap_hit: 7875000
  },
  "elias pettersson": {
    nhl_id: 8480012,
    team: "VAN",
    team_name: "Canucks de Vancouver",
    position: "C",
    number: "40",
    base_cap_hit: 11600000
  },
  "sebastian aho": {
    nhl_id: 8478427,
    team: "CAR",
    team_name: "Hurricanes de la Caroline",
    position: "C",
    number: "20",
    base_cap_hit: 9750000
  },
  "roope hintz": {
    nhl_id: 8478449,
    team: "DAL",
    team_name: "Stars de Dallas",
    position: "C",
    number: "24",
    base_cap_hit: 8450000
  },
  "miro heiskanen": {
    nhl_id: 8480036,
    team: "DAL",
    team_name: "Stars de Dallas",
    position: "D",
    number: "4",
    base_cap_hit: 8450000
  },
  "jason robertson": {
    nhl_id: 8480027,
    team: "DAL",
    team_name: "Stars de Dallas",
    position: "LW",
    number: "21",
    base_cap_hit: 7750000
  },
  "steven stamkos": {
    nhl_id: 8474564,
    team: "NSH",
    team_name: "Predators de Nashville",
    position: "LW",
    number: "91",
    base_cap_hit: 8000000
  },
  "brayden point": {
    nhl_id: 8478010,
    team: "TBL",
    team_name: "Lightning de Tampa Bay",
    position: "C",
    number: "21",
    base_cap_hit: 9500000
  },
  "sam reinhart": {
    nhl_id: 8477933,
    team: "FLA",
    team_name: "Panthers de la Floride",
    position: "RW",
    number: "13",
    base_cap_hit: 8625000
  },
  "aleksander barkov": {
    nhl_id: 8477493,
    team: "FLA",
    team_name: "Panthers de la Floride",
    position: "C",
    number: "16",
    base_cap_hit: 10000000
  },
  "kyle connor": {
    nhl_id: 8478398,
    team: "WPG",
    team_name: "Jets de Winnipeg",
    position: "LW",
    number: "81",
    base_cap_hit: 7142857
  },
  "mark scheifele": {
    nhl_id: 8476460,
    team: "WPG",
    team_name: "Jets de Winnipeg",
    position: "C",
    number: "55",
    base_cap_hit: 8500000
  },
  "filip forsberg": {
    nhl_id: 8476887,
    team: "NSH",
    team_name: "Predators de Nashville",
    position: "LW",
    number: "9",
    base_cap_hit: 8500000
  },
  "adrian kempe": {
    nhl_id: 8477960,
    team: "LAK",
    team_name: "Kings de Los Angeles",
    position: "RW",
    number: "9",
    base_cap_hit: 5500000
  },
  "tage thompson": {
    nhl_id: 8479420,
    team: "BUF",
    team_name: "Sabres de Buffalo",
    position: "C",
    number: "72",
    base_cap_hit: 7142857
  },
  "rasmus dahlin": {
    nhl_id: 8480839,
    team: "BUF",
    team_name: "Sabres de Buffalo",
    position: "D",
    number: "26",
    base_cap_hit: 11000000
  },
  "clayton keller": {
    nhl_id: 8479343,
    team: "UTA",
    team_name: "Utah Hockey Club",
    position: "RW",
    number: "9",
    base_cap_hit: 7150000
  },
  "robert thomas": {
    nhl_id: 8480023,
    team: "STL",
    team_name: "Blues de Saint-Louis",
    position: "C",
    number: "18",
    base_cap_hit: 8125000
  },
  "jordan kyrou": {
    nhl_id: 8479385,
    team: "STL",
    team_name: "Blues de Saint-Louis",
    position: "RW",
    number: "25",
    base_cap_hit: 8125000
  },
  "dylan larkin": {
    nhl_id: 8477946,
    team: "DET",
    team_name: "Red Wings de Détroit",
    position: "C",
    number: "71",
    base_cap_hit: 8700000
  },
  "lucas raymond": {
    nhl_id: 8482078,
    team: "DET",
    team_name: "Red Wings de Détroit",
    position: "LW",
    number: "23",
    base_cap_hit: 8075000
  },
  "moritz seider": {
    nhl_id: 8481542,
    team: "DET",
    team_name: "Red Wings de Détroit",
    position: "D",
    number: "53",
    base_cap_hit: 8550000
  },
  "travis konecny": {
    nhl_id: 8478439,
    team: "PHI",
    team_name: "Flyers de Philadelphie",
    position: "RW",
    number: "11",
    base_cap_hit: 8750000
  },

  // Gardiens avec équipes réelles
  "john gibson": {
    nhl_id: 8476434,
    team: "ANA",
    team_name: "Ducks d'Anaheim",
    number: "36",
    position: "G",
    base_cap_hit: 6400000
  },
  "petr mrazek": {
    nhl_id: 8475852,
    team: "CHI",
    team_name: "Blackhawks de Chicago",
    number: "34",
    position: "G",
    base_cap_hit: 4250000
  },
  "alexandar georgiev": {
    nhl_id: 8480382,
    team: "COL",
    team_name: "Avalanche du Colorado",
    number: "40",
    position: "G",
    base_cap_hit: 3400000
  },
  "mackenzie blackwood": {
    nhl_id: 8478406,
    team: "SJS",
    team_name: "Sharks de San José",
    number: "29",
    position: "G",
    base_cap_hit: 2350000
  },
  "spencer knight": {
    nhl_id: 8481519,
    team: "FLA",
    team_name: "Panthers de la Floride",
    number: "30",
    position: "G",
    base_cap_hit: 4500000
  },
  "daniil tarasov": {
    nhl_id: 8480397,
    team: "CBJ",
    team_name: "Blue Jackets de Columbus",
    number: "40",
    position: "G",
    base_cap_hit: 1050000
  },
  "vitek vanecek": {
    nhl_id: 8478038,
    team: "SJS",
    team_name: "Sharks de San José",
    number: "41",
    position: "G",
    base_cap_hit: 3400000
  },
  "justus annunen": {
    nhl_id: 8480838,
    team: "COL",
    team_name: "Avalanche du Colorado",
    number: "60",
    position: "G",
    base_cap_hit: 837500
  }
};

const normalizeName = (name) => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

let appliedCount = 0;
for (const p of PLAYERS) {
  const norm = normalizeName(p.name);
  if (SPECIFIC_CORRECTIONS[norm]) {
    const corr = SPECIFIC_CORRECTIONS[norm];
    if (corr.name) p.name = corr.name;
    if (corr.nhl_id) p.nhl_id = corr.nhl_id;
    if (corr.team) p.team = corr.team;
    if (corr.team_name) p.team_name = corr.team_name;
    if (corr.position) p.position = corr.position;
    if (corr.number) p.number = corr.number;
    if (corr.base_cap_hit) p.base_cap_hit = corr.base_cap_hit;
    if (corr.stats) p.stats = corr.stats;

    // Mise à jour des cartes associées avec le bon ID et multiplicateur
    const baseCap = p.base_cap_hit;
    const pId = p.nhl_id;
    p.cards = [
      {
        edition_id: `${pId}_base`,
        edition_name: "Série Régulière",
        rarity: "Common",
        cap_hit: baseCap,
        multiplier: 1,
        bg_color: "#161922"
      },
      {
        edition_id: `${pId}_allstar`,
        edition_name: "Étoile du Match",
        rarity: "Rare",
        cap_hit: Math.round(baseCap * 1.15),
        multiplier: 1.25,
        bg_color: "linear-gradient(135deg, #b9935a 0%, #e7c996 100%)"
      },
      {
        edition_id: `${pId}_prime`,
        edition_name: corr.cardName || `${p.name} Signature Prime`,
        rarity: "Epic",
        cap_hit: Math.round(baseCap * 1.35),
        multiplier: 1.5,
        bg_color: "linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)"
      },
      {
        edition_id: `${pId}_ultra`,
        edition_name: "Diamant Cosmique (1%)",
        rarity: "Ultra-Rare",
        cap_hit: Math.round(baseCap * 1.5),
        multiplier: 2,
        bg_color: "linear-gradient(135deg, #ff0844 0%, #ffb199 50%, #ff0055 100%)"
      }
    ];

    appliedCount++;
  } else {
    // Si pas dans la liste spécifique, s'assurer que ses cartes ont des IDs cohérents avec son nhl_id
    for (const c of p.cards) {
      if (!c.edition_id.startsWith(String(p.nhl_id))) {
        c.edition_id = `${p.nhl_id}_${c.rarity.toLowerCase()}`;
      }
    }
  }
}

console.log(`Applied specific player corrections: ${appliedCount}`);

// Vérification de Juraj Slafkovsky
const slaf = PLAYERS.find(p => p.nhl_id === 8483515);
if (slaf) {
  console.log(`✅ Slafkovsky verified: ${slaf.name}, Pos: ${slaf.position}, Team: ${slaf.team}, ID: ${slaf.nhl_id}, Cap: ${slaf.base_cap_hit}`);
} else {
  console.log('⚠️ Slafkovsky not found by ID! Checking by name...');
  const slafByName = PLAYERS.find(p => normalizeName(p.name).includes('slafkov'));
  console.log('Found by name:', slafByName);
}

// Ré-écriture du fichier src/data/players.js
const fileContent = `// Données complètes et certifiées des joueurs de la LNH 2026-2027
// Profils officiels avec identifiants NHL, statistiques réelles et éditions holographiques

export const SALARY_CAP_MAX = 88000000;

export const PLAYERS = ${JSON.stringify(PLAYERS, null, 2)};
`;

fs.writeFileSync('src/data/players.js', fileContent, 'utf8');
console.log('✅ src/data/players.js updated successfully!');
