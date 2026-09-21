// src/utils/LiveNhlApi.js
// Utilitaire pour interroger l'API publique officielle de la LNH et AHL

const NHL_API_BASE = 'https://api-web.nhle.com/v1';

// Pour la AHL, l'API est souvent propulsée par HockeyTech (lscluster.hockeytech.com) 
// ou on peut utiliser un fallback simulé si les requêtes CORS bloquent.
// Une implémentation complète AHL nécessite souvent une clé cliente HockeyTech, 
// mais on fournit l'architecture ici.

export const fetchLiveNhlScores = async () => {
  try {
    const response = await fetch(`${NHL_API_BASE}/score/now`);
    if (!response.ok) throw new Error('Erreur réseau NHL API');
    const data = await response.json();
    return data; // Retourne les matchs, scores, chronomètre
  } catch (error) {
    console.error("Erreur lors de la récupération des scores en direct:", error);
    return null;
  }
};

export const fetchBoxscore = async (gameId) => {
  try {
    const response = await fetch(`${NHL_API_BASE}/gamecenter/${gameId}/boxscore`);
    if (!response.ok) throw new Error(`Erreur réseau boxscore pour le match ${gameId}`);
    const data = await response.json();
    return data; // Retourne les stats détaillées des joueurs pour le match
  } catch (error) {
    console.error(`Erreur lors de la récupération du boxscore ${gameId}:`, error);
    return null;
  }
};

/**
 * Agrège les points Fantasy pour un joueur spécifique en écoutant les matchs en direct
 */
export const getPlayerLiveFantasyPoints = (nhlId, liveBoxscores) => {
  let points = 0;
  let stats = { goals: 0, assists: 0, shots: 0, hits: 0, blocks: 0, toi: "00:00" };

  for (const box of liveBoxscores) {
    const awaySkaters = box?.boxscore?.playerByGameStats?.awayTeam?.forwards || [];
    const awayDef = box?.boxscore?.playerByGameStats?.awayTeam?.defense || [];
    const homeSkaters = box?.boxscore?.playerByGameStats?.homeTeam?.forwards || [];
    const homeDef = box?.boxscore?.playerByGameStats?.homeTeam?.defense || [];
    
    const allPlayers = [...awaySkaters, ...awayDef, ...homeSkaters, ...homeDef];
    
    const playerStats = allPlayers.find(p => p.playerId === nhlId);
    
    if (playerStats) {
      stats.goals += playerStats.goals || 0;
      stats.assists += playerStats.assists || 0;
      stats.shots += playerStats.shots || 0;
      stats.hits += playerStats.hits || 0;
      stats.blocks += playerStats.blockedShots || 0;
      stats.toi = playerStats.toi || stats.toi;
      
      // Barème standard LNH Pool
      points += (playerStats.goals || 0) * 2;
      points += (playerStats.assists || 0) * 1;
      
      if (playerStats.goals >= 3) {
        points += 2; // Bonus Hat Trick
      }
    }
  }

  return { points, stats };
};
