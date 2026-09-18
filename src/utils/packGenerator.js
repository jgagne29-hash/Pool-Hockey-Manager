// 1. Définition des raretés et de leurs probabilités cumulées (Total 100%)
export const RARITIES = [
  {
    type: 'Ultra-Rare',
    threshold: 1,
    multiplier: 2.0,
    color: 'linear-gradient(135deg, #ff0844 0%, #ffb199 50%, #ff0055 100%)',
    badgeColor: '#ff0055',
    label: '💎 Ultra-Rare'
  }, // 0% à 1% (1% de chance)
  {
    type: 'Epic',
    threshold: 6,
    multiplier: 1.5,
    color: 'linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)',
    badgeColor: '#8a2387',
    label: '🔥 Épique'
  }, // 1% à 6% (5% de chance)
  {
    type: 'Rare',
    threshold: 31,
    multiplier: 1.2,
    color: 'linear-gradient(135deg, #b9935a 0%, #e7c996 100%)',
    badgeColor: '#b9935a',
    label: '⭐ Rare'
  }, // 6% à 31% (25% de chance)
  {
    type: 'Common',
    threshold: 100,
    multiplier: 1.0,
    color: '#161922',
    badgeColor: '#475569',
    label: 'Série Régulière'
  }  // 31% à 100% (69% de chance)
];

/**
 * Détermine une rareté aléatoire basée sur les configurations de probabilité pondérées
 * @returns {Object} La rareté tirée au sort
 */
export function getRandomRarity() {
  const roll = Math.random() * 100; // Génère un nombre entre 0.00 et 100.00
  // Trouve la première rareté où le jet est inférieur ou égal au seuil
  return RARITIES.find(rarity => roll <= rarity.threshold) || RARITIES[RARITIES.length - 1];
}

/**
 * Génère un paquet (Pack) de cartes aléatoires selon l'algorithme officiel du pool
 * @param {Array} playerPool - Liste complète des joueurs disponibles
 * @param {number} packSize - Nombre de cartes dans le paquet (ex: 3, 4 ou 5)
 * @returns {Array} Les cartes générées avec calcul financier et ID unique
 */
export function generatePack(playerPool, packSize = 5) {
  const pack = [];

  for (let i = 0; i < packSize; i++) {
    // 1. Sélectionner un joueur au hasard dans la base de données
    const randomPlayer = playerPool[Math.floor(Math.random() * playerPool.length)];

    // 2. Assigner une rareté aléatoire selon les vraies probabilités cumulées
    const selectedRarity = getRandomRarity();

    // 3. Calculer l'impact financier de cette édition spécifique (Cap Hit ajusté au prestige)
    const baseCapHit = randomPlayer.base_cap_hit || randomPlayer.cards?.[0]?.cap_hit || 10000000;
    const adjustedCapHit = Math.round(baseCapHit * (1 + (selectedRarity.multiplier - 1) * 0.5));

    // Déterminer le nom de l'édition
    let editionName = 'Série Régulière';
    if (selectedRarity.type === 'Ultra-Rare') {
      editionName = 'Diamant Cosmique (1%)';
    } else if (selectedRarity.type === 'Epic') {
      editionName = 'Recrue Légendaire';
    } else if (selectedRarity.type === 'Rare') {
      editionName = 'Étoile du Match';
    }

    // 4. Créer la carte unique pour l'inventaire du pooler
    pack.push({
      instance_id: `${randomPlayer.nhl_id}_${Date.now()}_${i}`, // ID unique pour les échanges
      nhl_id: randomPlayer.nhl_id,
      name: randomPlayer.name,
      team: randomPlayer.team,
      team_name: randomPlayer.team_name,
      position: randomPlayer.position,
      number: randomPlayer.number,
      stats: randomPlayer.stats,
      rarity: selectedRarity.type,
      edition_id: `${randomPlayer.nhl_id}_${selectedRarity.type.toLowerCase().replace('-', '_')}`,
      edition_name: editionName,
      multiplier: selectedRarity.multiplier,
      cap_hit: adjustedCapHit,
      bg_color: selectedRarity.color,
      playerData: randomPlayer
    });
  }

  return pack;
}
