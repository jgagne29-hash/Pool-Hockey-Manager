/**
 * Calcule les probabilités dynamiques de rareté selon le niveau du joueur/gérant.
 * Empêche un joueur bas niveau de piger des Ultra-Rares immédiatement (progression équitable).
 */
export function getDynamicThresholds(managerLevel) {
  if (managerLevel === 1) {
    return {
      ultra: 0,
      epic: 0,
      rare: 20,
      common: 100,
      chances: { common: 80, rare: 20, epic: 0, ultra: 0 },
      unlocked: { common: true, rare: true, epic: false, ultra: false },
      label: 'Niveau 1 : Recrue (0% Ultra, 0% Épique, 20% Rare, 80% Commune)'
    };
  }
  if (managerLevel === 2) {
    return {
      ultra: 0,
      epic: 5,
      rare: 25,
      common: 100,
      chances: { common: 75, rare: 20, epic: 5, ultra: 0 },
      unlocked: { common: true, rare: true, epic: true, ultra: false },
      label: 'Niveau 2 : Adjoint (0% Ultra, 5% Épique, 20% Rare, 75% Commune)'
    };
  }
  // Niveau 3+ : Accès aux probabilités standards (1% Ultra, 5% Épique, 25% Rare, 69% Commune)
  return {
    ultra: 1,
    epic: 6,
    rare: 31,
    common: 100,
    chances: { common: 69, rare: 25, epic: 5, ultra: 1 },
    unlocked: { common: true, rare: true, epic: true, ultra: true },
    label: 'Niveau 3+ : DG Pro (1% Ultra, 5% Épique, 25% Rare, 69% Commune)'
  };
}

/**
 * Calcule le gain d'expérience (XP) pour les actions du jeu.
 * Intègre un mécanisme de rattrapage automatique (Catch-up) plus la saison avance !
 * @param {number} baseActionXp - XP de base pour l'action
 * @param {number} currentMonth - Mois de hockey (1 à 12, ex: 10 = Octobre, 1 = Janvier, 3 = Mars)
 * @returns {number} Montant d'XP arrondi avec multiplicateur appliqué
 */
export function calculateXpGain(baseActionXp, currentMonth = new Date().getMonth() + 1) {
  // Mois de hockey : Octobre (10) à Avril (4)
  // Si on est en Janvier/Février (milieu de saison), on double ou triple l'XP 
  // pour que les jeunes qui joignent tard grimpent de niveau rapidement.
  let timeMultiplier = 1.0;
  
  if (currentMonth === 1 || currentMonth === 2) timeMultiplier = 2.0; // Janvier, Février (XP x2)
  if (currentMonth === 3 || currentMonth === 4) timeMultiplier = 3.0; // Mars, Avril (XP x3)

  return Math.round(baseActionXp * timeMultiplier);
}

/**
 * Obtenir les détails descriptifs du rattrapage de saison pour l'affichage UI
 */
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
 * Calcule le niveau et l'avancement XP du gérant
 * Niveau 1: 0 - 299 XP
 * Niveau 2: 300 - 799 XP
 * Niveau 3: 800+ XP (DG Pro)
 */
export function getManagerLevelInfo(totalXp = 0) {
  if (totalXp < 300) {
    return {
      level: 1,
      title: 'Manager Recrue',
      currentXp: totalXp,
      xpForCurrentLevel: totalXp,
      neededForNext: 300 - totalXp,
      totalLevelSpan: 300,
      progressPct: Math.min(100, Math.round((totalXp / 300) * 100)),
      badge: '🥉',
      unlockedMsg: 'Niveau 2 requis (300 XP) pour débloquer les cartes Épiques',
      nextUnlock: 'Cartes Épiques (5%)'
    };
  }
  if (totalXp < 800) {
    return {
      level: 2,
      title: 'Directeur Adjoint',
      currentXp: totalXp,
      xpForCurrentLevel: totalXp - 300,
      neededForNext: 800 - totalXp,
      totalLevelSpan: 500,
      progressPct: Math.min(100, Math.round(((totalXp - 300) / 500) * 100)),
      badge: '🥈',
      unlockedMsg: 'Niveau 3 requis (800 XP) pour débloquer les Ultra-Rares 1%',
      nextUnlock: 'Cartes Ultra-Rares Diamant 1% (x2.0)'
    };
  }
  return {
    level: 3,
    title: 'Directeur Général Pro',
    currentXp: totalXp,
    xpForCurrentLevel: totalXp,
    neededForNext: 0,
    totalLevelSpan: 800,
    progressPct: 100,
    badge: '🥇',
    unlockedMsg: 'Niveau Maximum Atteint ! Toutes les probabilités et raretés sont débloquées.',
    nextUnlock: 'Tout débloqué 🏆'
  };
}

/**
 * Générateur de paquets de cartes sécurisé pour l'équité selon le niveau du manager
 */
export function generateBalancedPack(playerPool, managerLevel, packSize = 4) {
  const pack = [];
  const thresholds = getDynamicThresholds(managerLevel);

  for (let i = 0; i < packSize; i++) {
    const randomPlayer = playerPool[Math.floor(Math.random() * playerPool.length)];
    const roll = Math.random() * 100;
    
    let assignedRarity = 'Common';
    let multiplier = 1.0;
    let color = '#1f1f1f';
    let editionName = 'Série Régulière';

    if (roll <= thresholds.ultra) {
      assignedRarity = 'Ultra-Rare';
      multiplier = 2.0;
      color = '#ff0055';
      editionName = 'Diamant Cosmique (1%)';
    } else if (roll <= thresholds.epic) {
      assignedRarity = 'Epic';
      multiplier = 1.5;
      color = '#8a2387';
      editionName = 'Recrue Légendaire';
    } else if (roll <= thresholds.rare) {
      assignedRarity = 'Rare';
      multiplier = 1.2;
      color = '#b9935a';
      editionName = 'Étoile du Match';
    }

    const baseCap = randomPlayer.base_cap_hit || randomPlayer.cards?.[0]?.cap_hit || 10000000;
    const adjustedCapHit = Math.round(baseCap * (1 + (multiplier - 1) * 0.5));

    // Conserve le contrat exact de l'utilisateur + métadonnées de joueur pour le rendu visuel
    pack.push({
      instance_id: `${randomPlayer.nhl_id}_${Date.now()}_${i}`,
      nhl_id: randomPlayer.nhl_id,
      name: randomPlayer.name,
      team: randomPlayer.team,
      team_name: randomPlayer.team_name,
      position: randomPlayer.position,
      number: randomPlayer.number,
      stats: randomPlayer.stats,
      rarity: assignedRarity,
      edition_id: `${randomPlayer.nhl_id}_${assignedRarity.toLowerCase().replace('-', '_')}`,
      edition_name: editionName,
      multiplier: multiplier,
      bg_color: color,
      cap_hit: adjustedCapHit,
      playerData: randomPlayer
    });
  }
  return pack;
}
