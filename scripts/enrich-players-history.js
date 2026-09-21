/**
 * Script d'enrichissement : Ajoute l'historique de carrière et les flags d'échange aux 849 joueurs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On va charger le fichier en tant que texte, extraire le JSON de l'array,
// le parser, l'enrichir, puis le réécrire.
const PLAYERS_FILE = path.join(__dirname, '../src/data/players.js');

function generateCareerHistory(baseCapHit, position) {
  // Générer des stats factices mais proportionnelles au salaire pour simuler l'historique
  const multiplier = baseCapHit / 1000000; // ex: 10M = 10
  
  const history = [];
  let currentYear = 2025;
  
  for (let i = 0; i < 3; i++) {
    const gp = Math.floor(Math.random() * 20) + 62; // 62 à 82 matchs
    let pts = 0, goals = 0, assists = 0;
    
    if (position === 'G') {
      // Pour les gardiens, stats = victoires
      pts = Math.floor(multiplier * (Math.random() * 2 + 2)); 
    } else if (position === 'D') {
      pts = Math.floor(multiplier * (Math.random() * 3 + 2));
      goals = Math.floor(pts * 0.2);
      assists = pts - goals;
    } else {
      pts = Math.floor(multiplier * (Math.random() * 4 + 4));
      goals = Math.floor(pts * 0.4);
      assists = pts - goals;
    }
    
    history.push({
      season: `${currentYear - i}-${currentYear - i + 1}`,
      gp: gp,
      goals: goals,
      assists: assists,
      points: pts
    });
  }
  
  return history;
}

async function enrichPlayers() {
  console.log('Traitement de players.js pour enrichissement...');
  const content = fs.readFileSync(PLAYERS_FILE, 'utf-8');
  
  // Extraction de la partie tableau JSON
  const startIndex = content.indexOf('export const PLAYERS = [') + 'export const PLAYERS = '.length;
  // Trouver la fin du tableau (qui se termine par ];)
  const endIndex = content.lastIndexOf('];') + 1;
  
  const jsonStr = content.substring(startIndex, endIndex);
  
  try {
    const players = JSON.parse(jsonStr);
    
    // Enrichissement
    const enrichedPlayers = players.map(p => {
      return {
        ...p,
        career_history: generateCareerHistory(p.base_cap_hit, p.position),
        // Flags pour l'échange :
        // 5% de chance d'être blessé
        is_injured: Math.random() < 0.05,
        // 2% de chance d'avoir une mauvaise presse
        bad_news_flag: Math.random() < 0.02,
        // Performance récente (sur 10 matchs)
        recent_games: 10,
        recent_points: p.position === 'G' ? Math.floor(Math.random() * 8) : Math.floor(Math.random() * 15)
      };
    });
    
    // Réassemblage du fichier
    const newContent = content.substring(0, startIndex) + JSON.stringify(enrichedPlayers, null, 2) + content.substring(endIndex);
    
    fs.writeFileSync(PLAYERS_FILE, newContent, 'utf-8');
    console.log(`✅ Enrichissement terminé avec succès ! ${enrichedPlayers.length} joueurs mis à jour.`);
    
  } catch (error) {
    console.error('Erreur lors du parsing JSON :', error.message);
  }
}

enrichPlayers();
