/**
 * Progression officielle PoolDG.cards :
 * 5 Grands Grades x 10 Sous-Niveaux (50 Niveaux au Total)
 * 1. Recrue (Niveaux 1 à 10)
 * 2. Adjoint (Niveaux 11 à 20)
 * 3. Directeur Général (D.G.) (Niveaux 21 à 30)
 * 4. Président (Niveaux 31 à 40)
 * 5. Légende (Hall of Fame) (Niveaux 41 à 50)
 */

export const GRADES = [
  {
    gradeId: 1,
    name: 'Recrue',
    badge: '🥉',
    color: '#94a3b8',
    description: 'Apprenti gestionnaire de franchise LNH',
    capDiscount: 0,
    xpMultiplier: 1.0
  },
  {
    gradeId: 2,
    name: 'Adjoint',
    badge: '🥈',
    color: '#38bdf8',
    description: 'Adjoint au directeur des opérations hockey',
    capDiscount: 1000000, // 1M$ de flexibilité
    xpMultiplier: 1.05
  },
  {
    gradeId: 3,
    name: 'Directeur Général (D.G.)',
    badge: '🥇',
    color: '#f59e0b',
    description: 'Maître des négociations et de la masse salariale',
    capDiscount: 2000000, // 2M$ de flexibilité
    xpMultiplier: 1.15
  },
  {
    gradeId: 4,
    name: 'Président',
    badge: '👑',
    color: '#a855f7',
    description: 'Dirigeant exécutif de franchise sportive d\'élite',
    capDiscount: 3500000, // 3.5M$ de flexibilité
    xpMultiplier: 1.25
  },
  {
    gradeId: 5,
    name: 'Légende (Hall of Fame)',
    badge: '💎',
    color: '#ec4899',
    description: 'Bâtisseur immortel intronisé au Temple de la Renommée',
    capDiscount: 5000000, // 5M$ de flexibilité
    xpMultiplier: 1.50
  }
];

// Barème XP par sous-niveau (1 à 10) pour chaque grade
// Chaque niveau nécessite un palier d'XP calculé
export function getLevelXpRequirement(globalLevel) {
  // Courbe exponentielle douce : commence à 100 XP, monte jusqu'à ~2500 XP par niveau au sommet
  const base = 120;
  return Math.round(base * Math.pow(globalLevel, 1.18));
}

/**
 * Calcule les informations complètes de grade et niveau du D.G. à partir du total d'XP
 * @param {number} totalXp - XP totale accumulée
 * @returns {object} Détails du grade, sous-niveau (1-10), niveau global (1-50) et progression
 */
export function getManagerGradeInfo(totalXp = 0) {
  let accumulatedXp = 0;
  let globalLevel = 1;

  for (let lvl = 1; lvl <= 50; lvl++) {
    const requiredForThisLvl = getLevelXpRequirement(lvl);
    if (totalXp >= accumulatedXp + requiredForThisLvl && lvl < 50) {
      accumulatedXp += requiredForThisLvl;
      globalLevel = lvl + 1;
    } else {
      break;
    }
  }

  // Grade (1 à 5)
  const gradeIndex = Math.min(4, Math.floor((globalLevel - 1) / 10));
  const currentGrade = GRADES[gradeIndex];
  const subLevel = ((globalLevel - 1) % 10) + 1;

  const currentLevelRequirement = getLevelXpRequirement(globalLevel);
  const xpInCurrentLevel = Math.max(0, totalXp - accumulatedXp);
  const neededForNext = globalLevel >= 50 ? 0 : Math.max(0, currentLevelRequirement - xpInCurrentLevel);
  const progressPct = globalLevel >= 50 ? 100 : Math.min(100, Math.round((xpInCurrentLevel / currentLevelRequirement) * 100));

  return {
    globalLevel,
    subLevel,
    gradeId: currentGrade.gradeId,
    gradeName: currentGrade.name,
    badge: currentGrade.badge,
    color: currentGrade.color,
    title: `${currentGrade.name} - Niveau ${subLevel}/10 (Rang ${globalLevel})`,
    fullTitle: `${currentGrade.badge} ${currentGrade.name} [Niv. ${subLevel}]`,
    currentXp: totalXp,
    xpInCurrentLevel,
    currentLevelRequirement,
    neededForNext,
    progressPct,
    capDiscount: currentGrade.capDiscount,
    xpMultiplier: currentGrade.xpMultiplier,
    isMaxLevel: globalLevel >= 50
  };
}

// Compatibilité descendante pour l'ancien helper
export function getManagerLevelInfo(totalXp = 0) {
  const gradeInfo = getManagerGradeInfo(totalXp);
  return {
    level: gradeInfo.gradeId,
    title: gradeInfo.title,
    currentXp: totalXp,
    xpForCurrentLevel: gradeInfo.xpInCurrentLevel,
    neededForNext: gradeInfo.neededForNext,
    totalLevelSpan: gradeInfo.currentLevelRequirement,
    progressPct: gradeInfo.progressPct,
    badge: gradeInfo.badge,
    unlockedMsg: `Grade : ${gradeInfo.gradeName} (${gradeInfo.subLevel}/10)`,
    nextUnlock: gradeInfo.isMaxLevel ? 'Prestige Maximal' : `Niveau suivant : +${gradeInfo.neededForNext} XP`
  };
}

export function getDynamicThresholds(managerLevel = 1) {
  return {
    ultra: 2,
    epic: 6,
    rare: 20,
    common: 70,
    chances: { base: 70, regular: 20, super: 6, ultra: 2, mystique: 1.5, patch: 0.5 },
    unlocked: { common: true, rare: true, epic: true, ultra: true, mystique: true, patch: true },
    label: `Grade ${managerLevel} : Accès aux 6 variantes officielles (Base, Régulière, Super, Ultra, Mystique, The Patch)`
  };
}

/**
 * Multiplicateur de saison (Octobre à Avril)
 */
export function calculateXpGain(baseActionXp, currentMonth = new Date().getMonth() + 1) {
  let timeMultiplier = 1.0;
  if (currentMonth === 1 || currentMonth === 2) timeMultiplier = 2.0; // Mi-saison x2
  if (currentMonth === 3 || currentMonth === 4) timeMultiplier = 3.0; // Sprint x3
  return Math.round(baseActionXp * timeMultiplier);
}

export function getCatchupDetails(currentMonth = new Date().getMonth() + 1) {
  const MONTH_NAMES = {
    1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril',
    5: 'Mai', 6: 'Juin', 7: 'Juillet', 8: 'Août',
    9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre'
  };

  let multiplier = 1.0;
  let tagColor = '#00d2ff';
  let label = 'Saison Régulière (XP x1.0)';
  let description = 'Rythme standard de progression';

  if (currentMonth === 1 || currentMonth === 2) {
    multiplier = 2.0;
    tagColor = '#faad14';
    label = "Rattrapage d'Hiver (XP x2.0 🚀)";
    description = 'Milieu de saison : XP doublée pour rattraper les meneurs !';
  } else if (currentMonth === 3 || currentMonth === 4) {
    multiplier = 3.0;
    tagColor = '#ff0055';
    label = 'Sprint de Fin de Saison (XP x3.0 🔥)';
    description = 'Dernière ligne droite : progression turbo x3 pour les nouveaux !';
  }

  return {
    monthNumber: currentMonth,
    monthName: MONTH_NAMES[currentMonth] || `Mois ${currentMonth}`,
    multiplier,
    tagColor,
    label,
    description
  };
}

/**
 * TAUX DE DROP OFFICIELS (POOLDG.CARDS) :
 * 1. Base (70.0% / x1.0)
 * 2. Régulière (20.0% / x1.2)
 * 3. Super (6.0% / x1.5)
 * 4. Ultra (2.0% / x1.9)
 * 5. Mystique (1.5% / x2.5)
 * 6. The Patch 1-of-1 (0.5% / x3.5 - Strictement limité)
 */
export const OFFICIAL_DROP_RATES = {
  patch: 0.005,    // 0.5%
  mystique: 0.015, // 1.5%
  ultra: 0.02,     // 2.0%
  super: 0.06,     // 6.0%
  regular: 0.20,   // 20.0%
  base: 0.70       // 70.0%
};

/**
 * Détermine la variante tirée selon le jet de dé probabiliste
 * @returns {string} Clé de variante ('patch', 'mystique', 'ultra', 'super', 'regular', 'base')
 */
export function rollCardVariant() {
  const roll = Math.random(); // 0.000 à 1.000

  if (roll < OFFICIAL_DROP_RATES.patch) {
    return 'patch'; // The Patch (1-of-1)
  }
  if (roll < OFFICIAL_DROP_RATES.patch + OFFICIAL_DROP_RATES.mystique) {
    return 'mystique'; // Mystique
  }
  if (roll < OFFICIAL_DROP_RATES.patch + OFFICIAL_DROP_RATES.mystique + OFFICIAL_DROP_RATES.ultra) {
    return 'ultra'; // Ultra
  }
  if (roll < OFFICIAL_DROP_RATES.patch + OFFICIAL_DROP_RATES.mystique + OFFICIAL_DROP_RATES.ultra + OFFICIAL_DROP_RATES.super) {
    return 'super'; // Super
  }
  if (roll < OFFICIAL_DROP_RATES.patch + OFFICIAL_DROP_RATES.mystique + OFFICIAL_DROP_RATES.ultra + OFFICIAL_DROP_RATES.super + OFFICIAL_DROP_RATES.regular) {
    return 'regular'; // Régulière
  }
  return 'base'; // Base (70%)
}

/**
 * Générateur de paquets de cartes officiel PoolDG.cards
 * Intègre les 6 variantes officielles, 35 jours de durabilité initiale et zéro doublon par paquet.
 */
export function generateBalancedPack(playerPool, managerLevel = 2, packSize = 6, packType = 'allstar') {
  const pack = [];
  const pickedIds = new Set();

  let filteredPool = playerPool;
  if (packType === 'rookie') {
    filteredPool = playerPool.filter(p => {
      const pts = p.stats?.pts || (p.stats?.g || 0) + (p.stats?.a || 0);
      return (pts <= 45 || (p.base_cap_hit && p.base_cap_hit <= 4000000)) && p.position !== 'G';
    });
  } else if (packType === 'pro') {
    filteredPool = playerPool.filter(p => {
      const pts = p.stats?.pts || (p.stats?.g || 0) + (p.stats?.a || 0);
      return (pts >= 25 && pts <= 70) || (p.position === 'D' && pts >= 20);
    });
  } else if (packType === 'allstar') {
    filteredPool = playerPool.filter(p => {
      const pts = p.stats?.pts || (p.stats?.g || 0) + (p.stats?.a || 0);
      const isTopD = p.position === 'D' && pts >= 38;
      const isTopG = p.position === 'G' && (p.stats?.wins || 0) >= 15;
      return pts >= 50 || isTopD || isTopG;
    });
  } else if (packType === 'legend') {
    filteredPool = playerPool.filter(p => {
      const pts = p.stats?.pts || (p.stats?.g || 0) + (p.stats?.a || 0);
      const isSuperstarD = p.position === 'D' && pts >= 48;
      const isEliteG = p.position === 'G' && (p.stats?.wins || 0) >= 22;
      return pts >= 65 || isSuperstarD || isEliteG;
    });
  } else if (packType === 'goalie') {
    filteredPool = playerPool.filter(p => p.position === 'G');
  }

  if (!filteredPool || filteredPool.length < packSize) {
    filteredPool = playerPool;
  }

  for (let i = 0; i < packSize; i++) {
    const availablePlayers = filteredPool.filter(p => !pickedIds.has(p.nhl_id));
    const poolToUse = availablePlayers.length > 0 ? availablePlayers : filteredPool;
    const randomPlayer = poolToUse[Math.floor(Math.random() * poolToUse.length)];
    pickedIds.add(randomPlayer.nhl_id);

    const variantKey = rollCardVariant();
    
    // Récupérer la variante exacte chez le joueur
    const variantCard = randomPlayer.cards?.find(c => {
      if (variantKey === 'patch') return c.is_one_of_one || c.rarity.includes('Patch');
      if (variantKey === 'mystique') return c.rarity === 'Mystique';
      if (variantKey === 'ultra') return c.rarity === 'Ultra';
      if (variantKey === 'super') return c.rarity === 'Super';
      if (variantKey === 'regular') return c.rarity === 'Régulière';
      return c.rarity === 'Base';
    }) || randomPlayer.cards?.[0];

    pack.push({
      instance_id: `${randomPlayer.nhl_id}_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
      nhl_id: randomPlayer.nhl_id,
      name: randomPlayer.name,
      team: randomPlayer.team,
      team_name: randomPlayer.team_name,
      position: randomPlayer.position,
      number: randomPlayer.number,
      stats: randomPlayer.stats,
      rarity: variantCard.rarity,
      edition_id: variantCard.edition_id,
      edition_name: variantCard.edition_name,
      multiplier: variantCard.multiplier,
      bg_color: variantCard.bg_color,
      cap_hit: variantCard.cap_hit,
      serial: variantCard.serial || (variantCard.is_one_of_one ? '1/1' : null),
      is_one_of_one: variantCard.is_one_of_one || false,
      durability_days: 35, // 35 jours de durabilité initiale complète
      playerData: randomPlayer
    });
  }

  return pack;
}
