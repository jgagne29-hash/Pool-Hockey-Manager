import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AHL_AFFILIATIONS = {
  "ANA": { teamName: "San Diego Gulls", poolId: "san_diego_gulls" },
  "BOS": { teamName: "Providence Bruins", poolId: "providence_bruins" },
  "BUF": { teamName: "Rochester Americans", poolId: "rochester_americans" },
  "CAR": { teamName: "Chicago Wolves", poolId: "chicago_wolves" },
  "CBJ": { teamName: "Cleveland Monsters", poolId: "cleveland_monsters" },
  "CGY": { teamName: "Calgary Wranglers", poolId: "calgary_wranglers" },
  "CHI": { teamName: "Rockford IceHogs", poolId: "rockford_icehogs" },
  "COL": { teamName: "Colorado Eagles", poolId: "colorado_eagles" },
  "DAL": { teamName: "Texas Stars", poolId: "texas_stars" },
  "DET": { teamName: "Grand Rapids Griffins", poolId: "grand_rapids_griffins" },
  "EDM": { teamName: "Bakersfield Condors", poolId: "bakersfield_condors" },
  "FLA": { teamName: "Charlotte Checkers", poolId: "charlotte_checkers" },
  "LAK": { teamName: "Ontario Reign", poolId: "ontario_reign" },
  "MIN": { teamName: "Iowa Wild", poolId: "iowa_wild" },
  "MTL": { teamName: "Rocket de Laval", poolId: "laval_rocket" },
  "NJD": { teamName: "Utica Comets", poolId: "utica_comets" },
  "NSH": { teamName: "Milwaukee Admirals", poolId: "milwaukee_admirals" },
  "NYI": { teamName: "Bridgeport Islanders", poolId: "bridgeport_islanders" },
  "NYR": { teamName: "Hartford Wolf Pack", poolId: "hartford_wolf_pack" },
  "OTT": { teamName: "Belleville Senators", poolId: "belleville_senators" },
  "PHI": { teamName: "Lehigh Valley Phantoms", poolId: "lehigh_valley_phantoms" },
  "PIT": { teamName: "Wilkes-Barre/Scranton Penguins", poolId: "wbs_penguins" },
  "SJS": { teamName: "San Jose Barracuda", poolId: "san_jose_barracuda" },
  "SEA": { teamName: "Coachella Valley Firebirds", poolId: "coachella_valley_firebirds" },
  "STL": { teamName: "Springfield Thunderbirds", poolId: "springfield_thunderbirds" },
  "TBL": { teamName: "Syracuse Crunch", poolId: "syracuse_crunch" },
  "TOR": { teamName: "Toronto Marlies", poolId: "toronto_marlies" },
  "UTA": { teamName: "Tucson Roadrunners", poolId: "tucson_roadrunners" },
  "VAN": { teamName: "Abbotsford Canucks", poolId: "abbotsford_canucks" },
  "VGK": { teamName: "Henderson Silver Knights", poolId: "henderson_silver_knights" },
  "WSH": { teamName: "Hershey Bears", poolId: "hershey_bears" },
  "WPG": { teamName: "Manitoba Moose", poolId: "manitoba_moose" }
};

const POSITIONS = ['C', 'LW', 'RW', 'D', 'G'];

const AHL_PLAYERS = [];

let idCounter = 9000000;

Object.entries(AHL_AFFILIATIONS).forEach(([nhlTeam, ahlTeam]) => {
  // Générer un joueur par position pour chaque club école
  POSITIONS.forEach(pos => {
    AHL_PLAYERS.push({
      nhl_id: idCounter++,
      name: `Réserviste ${pos} (${ahlTeam.teamName})`,
      team: nhlTeam, // Ils appartiennent au club NHL
      ahl_team: ahlTeam.teamName,
      position: pos,
      number: Math.floor(Math.random() * 98) + 1,
      base_cap_hit: 775000, // Salaire minimum
      is_injured: false,
      bad_news_flag: false,
      recent_points: Math.floor(Math.random() * 3),
      recent_games: 5,
      career_history: [
        { season: '2025-2026', gp: 40, goals: 5, assists: 10, points: 15 }
      ],
      is_ahl_reserve: true
    });
  });
});

const DATA_DIR = path.join(__dirname, '../src/data');
const OUTPUT_FILE = path.join(DATA_DIR, 'ahl_players.js');

const fileContent = `export const AHL_PLAYERS = ${JSON.stringify(AHL_PLAYERS, null, 2)};\n`;

fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf-8');
console.log(`✅ Génération terminée : ${AHL_PLAYERS.length} réservistes créés (Fichier : ahl_players.js)`);
