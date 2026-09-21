import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NHL_API_BASE = 'https://api-web.nhle.com/v1';

async function fetchTeams() {
  console.log("🏒 Récupération des équipes de la LNH...");
  const res = await fetch(`${NHL_API_BASE}/standings/now`);
  if (!res.ok) throw new Error("Erreur lors de la récupération des classements.");
  const data = await res.json();
  // Retourne les abréviations des 32 équipes (ex: MTL, TOR, BOS)
  return data.standings.map(t => ({
    abbrev: t.teamAbbrev?.default || t.teamAbbrev?.fr,
    name: t.teamName?.fr || t.teamName?.default,
    logo: t.teamLogo
  })).filter(t => t.abbrev);
}

async function fetchTeamRoster(teamAbbrev) {
  console.log(`📥 Téléchargement de l'alignement pour ${teamAbbrev}...`);
  const res = await fetch(`${NHL_API_BASE}/roster/${teamAbbrev}/current`);
  if (!res.ok) return null;
  return await res.json();
}

function generateCards(player) {
  const cards = [];
  
  // 1. Édition Base (Garantie)
  cards.push({
    edition_id: `${player.id}_base`,
    name: "Édition Base",
    multiplier: 1.0,
    rarity: "Common",
    imageUrl: player.headshot || "https://assets.nhle.com/mugs/nhl/default-skater.png"
  });

  // 2. Édition Pro Set Retro (Garantie)
  cards.push({
    edition_id: `${player.id}_retro`,
    name: "Pro Set Retro",
    multiplier: 1.6,
    rarity: "Epic",
    imageUrl: player.headshot || "https://assets.nhle.com/mugs/nhl/default-skater.png"
  });

  // 3. Édition "The Patch" (~1.6% de chance d'exister pour ce joueur, car on génère 6 cartes)
  if (Math.random() > 0.98) {
    for (let i = 1; i <= 6; i++) {
      cards.push({
        edition_id: `${player.id}_patch_piece_${i}`,
        name: `The Patch (Pièce ${i}/6)`,
        multiplier: 3.5,
        rarity: "Ultra-Rare",
        imageUrl: player.headshot || "https://assets.nhle.com/mugs/nhl/default-skater.png",
        patch_piece: i
      });
    }
  } else if (Math.random() > 0.70) {
    // Sinon, Édition All-Star (30% de chance)
    cards.push({
      edition_id: `${player.id}_allstar`,
      name: "Étoile Brillante",
      multiplier: 2.0,
      rarity: "Rare",
      imageUrl: player.headshot || "https://assets.nhle.com/mugs/nhl/default-skater.png"
    });
  }

  return cards;
}

function formatPlayer(playerData, team, position) {
  return {
    nhl_id: playerData.id.toString(),
    name: `${playerData.firstName.default} ${playerData.lastName.default}`,
    team: team.abbrev,
    team_name: team.name,
    team_logo: team.logo,
    position: position,
    number: playerData.sweaterNumber || 0,
    is_ahl: false, // L'API roster/current retourne les joueurs actifs.
    salary: Math.floor(Math.random() * (12000000 - 800000) + 800000), // Simulation de salaire
    cards: generateCards(playerData)
  };
}

async function runScraper() {
  try {
    const teams = await fetchTeams();
    const allPlayers = [];

    for (const team of teams) {
      const roster = await fetchTeamRoster(team.abbrev);
      if (!roster) continue;

      // Attaquants (Forwards)
      if (roster.forwards) {
        roster.forwards.forEach(p => {
          allPlayers.push(formatPlayer(p, team, p.positionCode || 'F'));
        });
      }

      // Défenseurs (Defensemen)
      if (roster.defensemen) {
        roster.defensemen.forEach(p => {
          allPlayers.push(formatPlayer(p, team, 'D'));
        });
      }

      // Gardiens (Goalies)
      if (roster.goalies) {
        roster.goalies.forEach(p => {
          allPlayers.push(formatPlayer(p, team, 'G'));
        });
      }

      // Pause pour ne pas spammer l'API
      await new Promise(r => setTimeout(r, 200));
    }

    console.log(`✅ Extraction terminée ! ${allPlayers.length} joueurs récupérés.`);

    // Générer le fichier JS
    const fileContent = `// Fichier généré automatiquement par generate-free-db.js
// Données extraites de l'API publique de la LNH. Zéro frais.

export const SALARY_CAP_MAX = 104000000;

export const PLAYERS = ${JSON.stringify(allPlayers, null, 2)};
`;

    const outputPath = path.join(__dirname, '..', 'src', 'data', 'players_generated.js');
    fs.writeFileSync(outputPath, fileContent, 'utf-8');
    
    console.log(`💾 Base de données sauvegardée dans : ${outputPath}`);
    console.log(`⚠️  N'oublie pas de changer l'import dans App.jsx pour utiliser players_generated.js au lieu de players.js !`);

  } catch (error) {
    console.error("❌ Erreur fatale :", error);
  }
}

runScraper();
