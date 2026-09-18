/**
 * Calcule la cote globale d'un gérant (Manager Rating) sur 1000
 * @param {number} pointsCumules - Points totaux du pooler
 * @param {number} budgetDepense - Masse salariale totale de son alignement actif
 * @param {number} transactionsReussies - Nombre de trades gagnants ou choix optimisés
 */
export function calculateManagerRating(pointsCumules, budgetDepense, transactionsReussies) {
  // 1. Score de Performance de Base (Max 500 pts)
  // Aligné sur une référence de ligue standard (ex: objectif de 1500 points de pool)
  const performanceScore = Math.min(500, (pointsCumules / 1500) * 500);

  // 2. Score d'Efficacité Salariale / ROI (Max 350 pts)
  // Plus le pooler fait de points par million dépensé, plus ce score est élevé.
  const millionsDepenses = budgetDepense / 1000000;
  const pointsParMillion = millionsDepenses > 0 ? pointsCumules / millionsDepenses : 0;
  const roiScore = Math.min(350, (pointsParMillion / 15) * 350); // 15 pts/M $ comme cible idéale

  // 3. Score d'Activité et Flair Stratégique (Max 150 pts)
  const strategyScore = Math.min(150, transactionsReussies * 15);

  // Somme totale arrondie
  return {
    totalRating: Math.round(performanceScore + roiScore + strategyScore),
    performanceScore: Math.round(performanceScore),
    roiScore: Math.round(roiScore),
    strategyScore: Math.round(strategyScore),
    pointsParMillion: pointsParMillion.toFixed(2)
  };
}

/**
 * Associe un score à un niveau de badge et à ses propriétés visuelles
 */
export function getRankDetails(rating) {
  if (rating >= 900) return { title: 'Maître du Plafond', color: '#ff0055', gradient: 'linear-gradient(135deg, #ff0055 0%, #00ffcc 100%)', badge: '💎', description: 'Génie financier et stratège d\'élite incontesté de la ligue.' };
  if (rating >= 700) return { title: 'Directeur Général Pro', color: '#faad14', gradient: 'linear-gradient(135deg, #fadb14 0%, #faad14 100%)', badge: '🥇', description: 'Excellente gestion de la masse et vision de repêchage aiguisée.' };
  if (rating >= 400) return { title: 'Directeur Adjoint', color: '#1890ff', gradient: 'linear-gradient(135deg, #40a9ff 0%, #096dd9 100%)', badge: '🥈', description: 'Bon potentiel, quelques ajustements requis sur le retour sur investissement.' };
  return { title: 'Manager Recrue', color: '#bfbfbf', gradient: 'linear-gradient(135deg, #d9d9d9 0%, #8c8c8c 100%)', badge: '🥉', description: 'En apprentissage des subtilités du plafond salarial LNH.' };
}

/**
 * Convertit une rareté en nombre d'étoiles accessibles pour les jeunes :
 * Commune : 1⭐, Rare : 2⭐, Épique : 3⭐, Ultra-Rare : 4⭐
 */
export function getStarsForRarity(rarity) {
  switch (rarity) {
    case 'Ultra-Rare': return 4;
    case 'Epic': return 3;
    case 'Rare': return 2;
    default: return 1;
  }
}

/**
 * Formule simplifiée et accessible pour calculer le Manager Rating (Cote)
 * Idéal pour les jeunes : utilise de petits chiffres compréhensibles basés sur les Étoiles ⭐.
 */
export function calculateSimpleRating(totalPoints, totalStars, totalTrades) {
  // 1. Performance brute (Max 500 pts) : Les points accumulés par l'équipe
  const performanceScore = Math.min(500, totalPoints * 2);

  // 2. Stratégie Étoiles / ROI (Max 350 pts) : Points divisés par le nombre d'étoiles alignées
  const starEfficiency = totalStars > 0 ? (totalPoints / totalStars) : 0;
  const roiScore = Math.min(350, Math.round(starEfficiency * 25));

  // 3. Bonus Activité (Max 150 pts) : Récompense l'effort de faire des échanges (15 pts par trade)
  const activityScore = Math.min(150, totalTrades * 15);

  const totalRating = Math.min(1000, performanceScore + roiScore + activityScore);

  return {
    totalRating,
    performanceScore,
    roiScore,
    activityScore,
    starEfficiency: starEfficiency.toFixed(1)
  };
}

