/**
 * Calcule la cote globale (OVR - Overall Rating) d'un joueur façon EA NHL, 
 * basée sur ses statistiques de la saison passée.
 * 
 * @param {Object} player L'objet joueur contenant ses stats et sa position
 * @returns {Number} La cote globale (ex: 90)
 */
export const calculatePlayerOVR = (player) => {
  if (!player || !player.stats) return 72; // Cote AHL par défaut
  
  // Si le joueur est explicitement blessé (DTD, IR, Out), on donne une cote AHL
  if (player.is_injured) return 72;

  const stats = player.stats;
  const isDefense = player.position === 'D';
  const isGoalie = player.position === 'G';
  
  let baseOVR = 74; // Recrue LNH / Bottom 6
  let bonus = 0;

  if (isGoalie) {
    // Logique simplifiée pour gardien: on se base sur les GP et les Points (s'il y en a)
    // Idéalement, il faudrait avoir les victoires et SV%, mais en absence, 
    // on donne un OVR arbitraire basé sur le cap hit ou on le fixe à 82 + bonus GP.
    baseOVR = 80;
    bonus = (stats.gp || 0) * 0.15; 
  } else if (isDefense) {
    // Les défenseurs font moins de points, chaque point vaut plus.
    const pts = stats.pts || 0;
    // Un bon défenseur offensif comme Makar (90 pts) doit taper dans les 95+ OVR.
    bonus = pts * 0.28; 
  } else {
    // Attaquants
    const pts = stats.pts || 0;
    // Un joueur à 100 pts doit taper 96-98.
    // 74 + (100 * 0.22) = 96
    bonus = pts * 0.22;
  }

  // Bonus supplémentaire pour les vétérans avec beaucoup de matchs
  const gpBonus = (stats.gp || 0) > 60 ? 1.5 : 0;
  
  let ovr = Math.round(baseOVR + bonus + gpBonus);

  // Hard caps
  if (ovr > 99) ovr = 99;
  if (ovr < 72) ovr = 72;

  return ovr;
};

/**
 * Calcule la moyenne OVR d'un alignement (équipe).
 * @param {Array} lineup Liste d'objets joueurs dans l'alignement
 * @returns {Number} Moyenne OVR
 */
export const calculateTeamOVR = (lineup) => {
  if (!lineup || lineup.length === 0) return 0;
  
  const total = lineup.reduce((acc, item) => {
    // item peut être { player: {...}, edition: {...} } ou directement { ...player }
    const playerObj = item.player || item;
    return acc + calculatePlayerOVR(playerObj);
  }, 0);

  return Math.round(total / lineup.length);
};
