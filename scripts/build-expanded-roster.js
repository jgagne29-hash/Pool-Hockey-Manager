import fs from 'fs';

const RAW_PLAYERS = [
  // --- EDMONTON OILERS ---
  {
    nhl_id: 8478402,
    name: "Connor McDavid",
    team: "EDM",
    team_name: "Oilers d'Edmonton",
    position: "C",
    number: "97",
    base_cap_hit: 12500000,
    stats: { gp: 76, g: 32, a: 100, pts: 132, plusMinus: "+35" },
    epicTitle: "Recrue Légendaire"
  },
  {
    nhl_id: 8477934,
    name: "Leon Draisaitl",
    team: "EDM",
    team_name: "Oilers d'Edmonton",
    position: "C",
    number: "29",
    base_cap_hit: 14000000,
    stats: { gp: 81, g: 41, a: 65, pts: 106, plusMinus: "+26" },
    epicTitle: "Bête Allemande des Séries"
  },
  {
    nhl_id: 8480803,
    name: "Evan Bouchard",
    team: "EDM",
    team_name: "Oilers d'Edmonton",
    position: "D",
    number: "2",
    base_cap_hit: 3900000,
    stats: { gp: 81, g: 18, a: 64, pts: 82, plusMinus: "+34" },
    epicTitle: "Bouch-Bomb Spécialiste"
  },
  {
    nhl_id: 8475786,
    name: "Zach Hyman",
    team: "EDM",
    team_name: "Oilers d'Edmonton",
    position: "LW",
    number: "18",
    base_cap_hit: 5500000,
    stats: { gp: 80, g: 54, a: 23, pts: 77, plusMinus: "+36" },
    epicTitle: "Tireur 50 Buts de l'Enclave"
  },

  // --- COLORADO AVALANCHE ---
  {
    nhl_id: 8477492,
    name: "Nathan MacKinnon",
    team: "COL",
    team_name: "Avalanche du Colorado",
    position: "C",
    number: "29",
    base_cap_hit: 12600000,
    stats: { gp: 82, g: 51, a: 89, pts: 140, plusMinus: "+35" },
    epicTitle: "Champion Stanley Cup MVP"
  },
  {
    nhl_id: 8480069,
    name: "Cale Makar",
    team: "COL",
    team_name: "Avalanche du Colorado",
    position: "D",
    number: "8",
    base_cap_hit: 9000000,
    stats: { gp: 77, g: 21, a: 69, pts: 90, plusMinus: "+23" },
    epicTitle: "Génie Norris Trophy"
  },
  {
    nhl_id: 8478420,
    name: "Mikko Rantanen",
    team: "COL",
    team_name: "Avalanche du Colorado",
    position: "RW",
    number: "96",
    base_cap_hit: 9250000,
    stats: { gp: 80, g: 42, a: 62, pts: 104, plusMinus: "+19" },
    epicTitle: "Moose Finlandais Élite"
  },

  // --- MONTRÉAL CANADIENS ---
  {
    nhl_id: 8480018,
    name: "Nick Suzuki",
    team: "MTL",
    team_name: "Canadiens de Montréal",
    position: "C",
    number: "14",
    base_cap_hit: 7875000,
    stats: { gp: 82, g: 33, a: 44, pts: 77, plusMinus: "-14" },
    epicTitle: "Capitaine Nickel"
  },
  {
    nhl_id: 8481540,
    name: "Cole Caufield",
    team: "MTL",
    team_name: "Canadiens de Montréal",
    position: "RW",
    number: "13",
    base_cap_hit: 7850000,
    stats: { gp: 82, g: 28, a: 37, pts: 65, plusMinus: "-4" },
    epicTitle: "Tir Sur Réception Foudroyant"
  },
  {
    nhl_id: 8483421,
    name: "Juraj Slafkovsky",
    team: "MTL",
    team_name: "Canadiens de Montréal",
    position: "LW",
    number: "20",
    base_cap_hit: 7600000,
    stats: { gp: 82, g: 20, a: 30, pts: 50, plusMinus: "-19" },
    epicTitle: "Colosse Slovaque No 1"
  },
  {
    nhl_id: 8483460,
    name: "Lane Hutson",
    team: "MTL",
    team_name: "Canadiens de Montréal",
    position: "D",
    number: "48",
    base_cap_hit: 950000,
    stats: { gp: 82, g: 10, a: 52, pts: 62, plusMinus: "-8" },
    epicTitle: "Phénomène Calder Trophy"
  },
  {
    nhl_id: 8479337,
    name: "Patrik Laine",
    team: "MTL",
    team_name: "Canadiens de Montréal",
    position: "RW",
    number: "92",
    base_cap_hit: 8700000,
    stats: { gp: 65, g: 34, a: 28, pts: 62, plusMinus: "+5" },
    epicTitle: "Laser Finlandais Powerplay"
  },
  {
    nhl_id: 8478499,
    name: "Samuel Montembeault",
    team: "MTL",
    team_name: "Canadiens de Montréal",
    position: "G",
    number: "35",
    base_cap_hit: 3150000,
    stats: { gp: 41, wins: 22, so: 3, gaa: 2.78, svPct: .912 },
    epicTitle: "Mur Québécois de Bell Centre"
  },
  {
    nhl_id: 8476875,
    name: "Mike Matheson",
    team: "MTL",
    team_name: "Canadiens de Montréal",
    position: "D",
    number: "8",
    base_cap_hit: 4875000,
    stats: { gp: 82, g: 11, a: 51, pts: 62, plusMinus: "-24" },
    epicTitle: "Patin Fluide & 26 Minutes"
  },

  // --- TORONTO MAPLE LEAFS ---
  {
    nhl_id: 8479318,
    name: "Auston Matthews",
    team: "TOR",
    team_name: "Maple Leafs de Toronto",
    position: "C",
    number: "34",
    base_cap_hit: 13250000,
    stats: { gp: 81, g: 69, a: 38, pts: 107, plusMinus: "+31" },
    epicTitle: "Tireur d'Élite 69 Buts"
  },
  {
    nhl_id: 8477939,
    name: "William Nylander",
    team: "TOR",
    team_name: "Maple Leafs de Toronto",
    position: "RW",
    number: "88",
    base_cap_hit: 11500000,
    stats: { gp: 82, g: 40, a: 58, pts: 98, plusMinus: "+1" },
    epicTitle: "Willy Styles Dribble Pur"
  },
  {
    nhl_id: 8478483,
    name: "Mitch Marner",
    team: "TOR",
    team_name: "Maple Leafs de Toronto",
    position: "RW",
    number: "16",
    base_cap_hit: 10900000,
    stats: { gp: 69, g: 26, a: 59, pts: 85, plusMinus: "+21" },
    epicTitle: "Artiste Visionnaire Passe"
  },

  // --- TAMPA BAY LIGHTNING ---
  {
    nhl_id: 8476453,
    name: "Nikita Kucherov",
    team: "TBL",
    team_name: "Lightning de Tampa Bay",
    position: "RW",
    number: "86",
    base_cap_hit: 9500000,
    stats: { gp: 81, g: 44, a: 100, pts: 144, plusMinus: "+8" },
    epicTitle: "Art Ross Playmaker 100 Passes"
  },
  {
    nhl_id: 8478010,
    name: "Brayden Point",
    team: "TBL",
    team_name: "Lightning de Tampa Bay",
    position: "C",
    number: "21",
    base_cap_hit: 9500000,
    stats: { gp: 81, g: 46, a: 44, pts: 90, plusMinus: "-16" },
    epicTitle: "Embrayage Ultime en Séries"
  },
  {
    nhl_id: 8475167,
    name: "Victor Hedman",
    team: "TBL",
    team_name: "Lightning de Tampa Bay",
    position: "D",
    number: "77",
    base_cap_hit: 7875000,
    stats: { gp: 78, g: 13, a: 63, pts: 76, plusMinus: "+18" },
    epicTitle: "Tour Suédoise Conne Smythe"
  },
  {
    nhl_id: 8476883,
    name: "Andrei Vasilevskiy",
    team: "TBL",
    team_name: "Lightning de Tampa Bay",
    position: "G",
    number: "88",
    base_cap_hit: 9500000,
    stats: { gp: 52, wins: 30, so: 2, gaa: 2.90, svPct: .900 },
    epicTitle: "Big Cat Conne Smythe"
  },

  // --- NY RANGERS ---
  {
    nhl_id: 8478550,
    name: "Artemi Panarin",
    team: "NYR",
    team_name: "Rangers de New York",
    position: "LW",
    number: "10",
    base_cap_hit: 11642857,
    stats: { gp: 82, g: 49, a: 71, pts: 120, plusMinus: "+18" },
    epicTitle: "Breadman Broadway Magic"
  },
  {
    nhl_id: 8482093,
    name: "Alexis Lafrenière",
    team: "NYR",
    team_name: "Rangers de New York",
    position: "RW",
    number: "13",
    base_cap_hit: 7450000,
    stats: { gp: 82, g: 28, a: 29, pts: 57, plusMinus: "+11" },
    epicTitle: "Explosion Offensive Québécoise"
  },
  {
    nhl_id: 8479323,
    name: "Adam Fox",
    team: "NYR",
    team_name: "Rangers de New York",
    position: "D",
    number: "23",
    base_cap_hit: 9500000,
    stats: { gp: 72, g: 17, a: 56, pts: 73, plusMinus: "+21" },
    epicTitle: "Génie Norris New-Yorkais"
  },
  {
    nhl_id: 8478048,
    name: "Igor Shesterkin",
    team: "NYR",
    team_name: "Rangers de New York",
    position: "G",
    number: "31",
    base_cap_hit: 11500000,
    stats: { gp: 55, wins: 36, so: 4, gaa: 2.58, svPct: .913 },
    epicTitle: "Czar du Madison Square Garden"
  },

  // --- BOSTON BRUINS ---
  {
    nhl_id: 8477956,
    name: "David Pastrnak",
    team: "BOS",
    team_name: "Bruins de Boston",
    position: "RW",
    number: "88",
    base_cap_hit: 11250000,
    stats: { gp: 82, g: 47, a: 63, pts: 110, plusMinus: "+21" },
    epicTitle: "Pasta Magic Goalscorer"
  },
  {
    nhl_id: 8473419,
    name: "Brad Marchand",
    team: "BOS",
    team_name: "Bruins de Boston",
    position: "LW",
    number: "63",
    base_cap_hit: 6125000,
    stats: { gp: 82, g: 29, a: 38, pts: 67, plusMinus: "+2" },
    epicTitle: "Capitaine Provocateur"
  },
  {
    nhl_id: 8480382,
    name: "Jeremy Swayman",
    team: "BOS",
    team_name: "Bruins de Boston",
    position: "G",
    number: "1",
    base_cap_hit: 8250000,
    stats: { gp: 44, wins: 25, so: 3, gaa: 2.53, svPct: .916 },
    epicTitle: "Rempart Solide de Boston"
  },

  // --- FLORIDA PANTHERS ---
  {
    nhl_id: 8477493,
    name: "Aleksander Barkov",
    team: "FLA",
    team_name: "Panthers de la Floride",
    position: "C",
    number: "16",
    base_cap_hit: 10000000,
    stats: { gp: 73, g: 23, a: 57, pts: 80, plusMinus: "+33" },
    epicTitle: "Génie Selke Trophy & Stanley Cup"
  },
  {
    nhl_id: 8479314,
    name: "Matthew Tkachuk",
    team: "FLA",
    team_name: "Panthers de la Floride",
    position: "LW",
    number: "19",
    base_cap_hit: 9500000,
    stats: { gp: 80, g: 26, a: 62, pts: 88, plusMinus: "+15" },
    epicTitle: "Guerrier Sans Pitié des Séries"
  },
  {
    nhl_id: 8477933,
    name: "Sam Reinhart",
    team: "FLA",
    team_name: "Panthers de la Floride",
    position: "RW",
    number: "13",
    base_cap_hit: 8625000,
    stats: { gp: 82, g: 57, a: 37, pts: 94, plusMinus: "+32" },
    epicTitle: "Maître de la Déviasion 57 Buts"
  },
  {
    nhl_id: 8475683,
    name: "Sergei Bobrovsky",
    team: "FLA",
    team_name: "Panthers de la Floride",
    position: "G",
    number: "72",
    base_cap_hit: 10000000,
    stats: { gp: 58, wins: 36, so: 6, gaa: 2.37, svPct: .915 },
    epicTitle: "Officier Bobrovsky Champion"
  },

  // --- VANCOUVER CANUCKS ---
  {
    nhl_id: 8480800,
    name: "Quinn Hughes",
    team: "VAN",
    team_name: "Canucks de Vancouver",
    position: "D",
    number: "43",
    base_cap_hit: 7850000,
    stats: { gp: 82, g: 17, a: 75, pts: 92, plusMinus: "+38" },
    epicTitle: "Norris Trophy Capitaire"
  },
  {
    nhl_id: 8480012,
    name: "Elias Pettersson",
    team: "VAN",
    team_name: "Canucks de Vancouver",
    position: "C",
    number: "40",
    base_cap_hit: 11600000,
    stats: { gp: 82, g: 34, a: 55, pts: 89, plusMinus: "+20" },
    epicTitle: "Sniper Précision Laser"
  },
  {
    nhl_id: 8476389,
    name: "J.T. Miller",
    team: "VAN",
    team_name: "Canucks de Vancouver",
    position: "C",
    number: "9",
    base_cap_hit: 8000000,
    stats: { gp: 81, g: 37, a: 66, pts: 103, plusMinus: "+32" },
    epicTitle: "Force Brute 100 Points"
  },
  {
    nhl_id: 8477967,
    name: "Thatcher Demko",
    team: "VAN",
    team_name: "Canucks de Vancouver",
    position: "G",
    number: "35",
    base_cap_hit: 5000000,
    stats: { gp: 51, wins: 35, so: 5, gaa: 2.45, svPct: .918 },
    epicTitle: "Forteresse de Rogers Arena"
  },

  // --- VEGAS GOLDEN KNIGHTS ---
  {
    nhl_id: 8478403,
    name: "Jack Eichel",
    team: "VGK",
    team_name: "Golden Knights de Vegas",
    position: "C",
    number: "9",
    base_cap_hit: 10000000,
    stats: { gp: 63, g: 31, a: 37, pts: 68, plusMinus: "+13" },
    epicTitle: "Patin Puissant & Vision Elite"
  },
  {
    nhl_id: 8475744,
    name: "Mark Stone",
    team: "VGK",
    team_name: "Golden Knights de Vegas",
    position: "RW",
    number: "61",
    base_cap_hit: 9500000,
    stats: { gp: 56, g: 16, a: 37, pts: 53, plusMinus: "+1" },
    epicTitle: "Roi des Revirements & Capitaine"
  },

  // --- DALLAS STARS ---
  {
    nhl_id: 8480027,
    name: "Jason Robertson",
    team: "DAL",
    team_name: "Stars de Dallas",
    position: "LW",
    number: "21",
    base_cap_hit: 7750000,
    stats: { gp: 82, g: 29, a: 51, pts: 80, plusMinus: "+17" },
    epicTitle: "Robo Sniper Élégant"
  },
  {
    nhl_id: 8480036,
    name: "Miro Heiskanen",
    team: "DAL",
    team_name: "Stars de Dallas",
    position: "D",
    number: "4",
    base_cap_hit: 8450000,
    stats: { gp: 71, g: 9, a: 45, pts: 54, plusMinus: "-1" },
    epicTitle: "Défenseur Marathonien 27min"
  },
  {
    nhl_id: 8479979,
    name: "Jake Oettinger",
    team: "DAL",
    team_name: "Stars de Dallas",
    position: "G",
    number: "29",
    base_cap_hit: 8250000,
    stats: { gp: 54, wins: 35, so: 3, gaa: 2.72, svPct: .905 },
    epicTitle: "Otter Portier Infranchissable"
  },

  // --- NASHVILLE PREDATORS ---
  {
    nhl_id: 8474563,
    name: "Roman Josi",
    team: "NSH",
    team_name: "Predators de Nashville",
    position: "D",
    number: "59",
    base_cap_hit: 9059000,
    stats: { gp: 82, g: 23, a: 62, pts: 85, plusMinus: "+12" },
    epicTitle: "Capitaine Virtuose Norris"
  },
  {
    nhl_id: 8476887,
    name: "Filip Forsberg",
    team: "NSH",
    team_name: "Predators de Nashville",
    position: "LW",
    number: "9",
    base_cap_hit: 8500000,
    stats: { gp: 82, g: 48, a: 46, pts: 94, plusMinus: "+11" },
    epicTitle: "Scoresmith Moustache d'Or"
  },
  {
    nhl_id: 8477424,
    name: "Juuse Saros",
    team: "NSH",
    team_name: "Predators de Nashville",
    position: "G",
    number: "74",
    base_cap_hit: 7740000,
    stats: { gp: 64, wins: 35, so: 3, gaa: 2.86, svPct: .906 },
    epicTitle: "Mètre 80 de Réflexes Purs"
  },

  // --- WINNIPEG JETS ---
  {
    nhl_id: 8476945,
    name: "Connor Hellebuyck",
    team: "WPG",
    team_name: "Jets de Winnipeg",
    position: "G",
    number: "37",
    base_cap_hit: 8500000,
    stats: { gp: 60, wins: 37, so: 5, gaa: 2.39, svPct: .921 },
    epicTitle: "Mur Vezina Infaillible"
  },
  {
    nhl_id: 8478460,
    name: "Kyle Connor",
    team: "WPG",
    team_name: "Jets de Winnipeg",
    position: "LW",
    number: "81",
    base_cap_hit: 7142857,
    stats: { gp: 65, g: 34, a: 27, pts: 61, plusMinus: "-7" },
    epicTitle: "Patin Explosif Buteur Naturel"
  },

  // --- CHICAGO BLACKHAWKS ---
  {
    nhl_id: 8484144,
    name: "Connor Bedard",
    team: "CHI",
    team_name: "Blackhawks de Chicago",
    position: "C",
    number: "98",
    base_cap_hit: 950000,
    stats: { gp: 68, g: 22, a: 39, pts: 61, plusMinus: "-44" },
    epicTitle: "L'Héritier Générationnel"
  },

  // --- PITTSBURGH PENGUINS ---
  {
    nhl_id: 8471675,
    name: "Sidney Crosby",
    team: "PIT",
    team_name: "Penguins de Pittsburgh",
    position: "C",
    number: "87",
    base_cap_hit: 8700000,
    stats: { gp: 82, g: 42, a: 52, pts: 94, plusMinus: "+9" },
    epicTitle: "The Next One • Légende Vivante"
  },
  {
    nhl_id: 8474578,
    name: "Erik Karlsson",
    team: "PIT",
    team_name: "Penguins de Pittsburgh",
    position: "D",
    number: "65",
    base_cap_hit: 10000000,
    stats: { gp: 82, g: 11, a: 45, pts: 56, plusMinus: "+4" },
    epicTitle: "Triple Gagnant du Trophée Norris"
  },

  // --- WASHINGTON CAPITALS ---
  {
    nhl_id: 8471214,
    name: "Alex Ovechkin",
    team: "WSH",
    team_name: "Capitals de Washington",
    position: "LW",
    number: "8",
    base_cap_hit: 9500000,
    stats: { gp: 79, g: 31, a: 34, pts: 65, plusMinus: "-22" },
    epicTitle: "The Great Eight • Chasse au Record 894"
  }
];

// Génère les 4 éditions de cartes pour chaque joueur
const PLAYERS = RAW_PLAYERS.map(p => {
  const isGoalie = p.position === 'G';
  const baseHit = p.base_cap_hit;

  return {
    nhl_id: p.nhl_id,
    name: p.name,
    team: p.team,
    team_name: p.team_name,
    position: p.position,
    number: p.number,
    base_cap_hit: baseHit,
    stats: p.stats,
    cards: [
      {
        edition_id: `${p.nhl_id}_base`,
        edition_name: "Série Régulière",
        rarity: "Common",
        cap_hit: baseHit,
        multiplier: 1.0,
        bg_color: "#161922"
      },
      {
        edition_id: `${p.nhl_id}_allstar`,
        edition_name: isGoalie ? "Mur Étoilé" : "Étoile du Match",
        rarity: "Rare",
        cap_hit: Math.round(baseHit * 1.15),
        multiplier: 1.25,
        bg_color: "linear-gradient(135deg, #b9935a 0%, #e7c996 100%)"
      },
      {
        edition_id: `${p.nhl_id}_prime`,
        edition_name: p.epicTitle || "Recrue Légendaire",
        rarity: "Epic",
        cap_hit: Math.round(baseHit * 1.35),
        multiplier: 1.5,
        bg_color: "linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)"
      },
      {
        edition_id: `${p.nhl_id}_ultra`,
        edition_name: "Diamant Cosmique (1%)",
        rarity: "Ultra-Rare",
        cap_hit: Math.round(baseHit * 1.5),
        multiplier: 2.0,
        bg_color: "linear-gradient(135deg, #ff0844 0%, #ffb199 50%, #ff0055 100%)"
      }
    ]
  };
});

const content = `// Base de données des joueurs de la LNH (${PLAYERS.length} Superstars Officielles LNH)
export const PLAYERS = ${JSON.stringify(PLAYERS, null, 2)};

export const SALARY_CAP_MAX = 88000000; // 88.0M$ Plafond Salarial officiel LNH 2024-2025
`;

fs.writeFileSync('src/data/players.js', content, 'utf8');
console.log(`✅ Fichier src/data/players.js mis à jour avec ${PLAYERS.length} joueurs élites LNH !`);
