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
 * Générateur de paquets de cartes équitable et réaliste
 * Filtre les joueurs selon le niveau du paquet (Recrue, Pro, All-Star, Légende, Gardien)
 * Garantit :
 * 1. Cohérence entre la valeur réelle des joueurs LNH et le type de paquet
 * 2. Zéro doublon de joueur dans un même paquet
 * 3. Distribution des raretés ajustée au niveau du DG et au type de booster
 */
export function generateBalancedPack(playerPool, managerLevel = 2, packSize = 4, packType = 'allstar') {
  const pack = [];
  const thresholds = getDynamicThresholds(managerLevel);
  const pickedIds = new Set();

  // 1. Découpage réaliste du bassin de joueurs selon le type de paquet
  let filteredPool = playerPool;
  if (packType === 'rookie') {
    // Joueurs de profondeur, recrues et salaires modestes (bons pour le cap salarial)
    filteredPool = playerPool.filter(p => {
      const pts = p.stats?.pts || (p.stats?.g || 0) + (p.stats?.a || 0);
      return (pts <= 40 || (p.base_cap_hit && p.base_cap_hit <= 3500000)) && p.position !== 'G';
    });
  } else if (packType === 'pro') {
    // Joueurs réguliers de la LNH (Top 9 / Top 4 D)
    filteredPool = playerPool.filter(p => {
      const pts = p.stats?.pts || (p.stats?.g || 0) + (p.stats?.a || 0);
      return (pts >= 25 && pts <= 65) || (p.position === 'D' && pts >= 20);
    });
  } else if (packType === 'allstar') {
    // Étoiles et vedettes de la ligue (55+ pts, Top D ou gardiens partants)
    filteredPool = playerPool.filter(p => {
      const pts = p.stats?.pts || (p.stats?.g || 0) + (p.stats?.a || 0);
      const isTopD = p.position === 'D' && pts >= 40;
      const isTopG = p.position === 'G' && (p.stats?.wins || 0) >= 15;
      return pts >= 50 || isTopD || isTopG;
    });
  } else if (packType === 'legend') {
    // Superstars mondiales (70+ points ou statut de franchise)
    filteredPool = playerPool.filter(p => {
      const pts = p.stats?.pts || (p.stats?.g || 0) + (p.stats?.a || 0);
      const isSuperstarD = p.position === 'D' && pts >= 50;
      const isEliteG = p.position === 'G' && (p.stats?.wins || 0) >= 24;
      const eliteIds = [8478402, 8477492, 8476453, 8479318, 8480069, 8480018, 8481540, 8478499, 8476882];
      return pts >= 68 || isSuperstarD || isEliteG || eliteIds.includes(p.nhl_id);
    });
  } else if (packType === 'goalie') {
    // 100% Gardiens de but LNH
    filteredPool = playerPool.filter(p => p.position === 'G');
  }

  // Fallback si le filtre est trop restrictif
  if (!filteredPool || filteredPool.length < packSize) {
    filteredPool = playerPool;
  }

  for (let i = 0; i < packSize; i++) {
    // Filtrer pour exclure les joueurs déjà tirés dans ce même paquet
    const availablePlayers = filteredPool.filter(p => !pickedIds.has(p.nhl_id));
    const poolToUse = availablePlayers.length > 0 ? availablePlayers : filteredPool;
    const randomPlayer = poolToUse[Math.floor(Math.random() * poolToUse.length)];
    pickedIds.add(randomPlayer.nhl_id);

    const roll = Math.random() * 100;
    let assignedRarity = 'Common';
    let multiplier = 1.0;
    let color = '#161922';
    let editionName = 'Série Régulière';

    // Tirage selon le type de paquet et les permissions du manager
    if (packType === 'legend') {
      // Pack Légende : 20% Ultra (si débloqué), 45% Épique, 35% Rare (Zéro commune)
      if (roll <= (thresholds.unlocked.ultra ? 20 : 0)) {
        assignedRarity = 'Ultra-Rare';
        multiplier = 2.0;
        color = 'linear-gradient(135deg, #ff0844 0%, #ffb199 50%, #ff0055 100%)';
        editionName = 'Diamant Cosmique (1%)';
      } else if (roll <= 65) {
        assignedRarity = 'Epic';
        multiplier = 1.5;
        color = 'linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)';
        editionName = randomPlayer.cards?.find(c => c.rarity === 'Epic')?.edition_name || 'Élite Légendaire';
      } else {
        assignedRarity = 'Rare';
        multiplier = 1.25;
        color = 'linear-gradient(135deg, #b9935a 0%, #e7c996 100%)';
        editionName = randomPlayer.cards?.find(c => c.rarity === 'Rare')?.edition_name || 'Étoile du Match';
      }
    } else if (packType === 'allstar') {
      // Pack All-Star : 5% Ultra, 30% Épique, 50% Rare, 15% Commune
      if (roll <= (thresholds.unlocked.ultra ? 5 : 0)) {
        assignedRarity = 'Ultra-Rare';
        multiplier = 2.0;
        color = 'linear-gradient(135deg, #ff0844 0%, #ffb199 50%, #ff0055 100%)';
        editionName = 'Diamant Cosmique';
      } else if (roll <= (thresholds.unlocked.epic ? 35 : 0)) {
        assignedRarity = 'Epic';
        multiplier = 1.5;
        color = 'linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)';
        editionName = randomPlayer.cards?.find(c => c.rarity === 'Epic')?.edition_name || 'Vedette All-Star';
      } else if (roll <= 85) {
        assignedRarity = 'Rare';
        multiplier = 1.25;
        color = 'linear-gradient(135deg, #b9935a 0%, #e7c996 100%)';
        editionName = randomPlayer.cards?.find(c => c.rarity === 'Rare')?.edition_name || 'Étoile du Match';
      }
    } else if (packType === 'pro') {
      // Pack Pro : 8% Épique, 32% Rare, 60% Commune
      if (roll <= (thresholds.unlocked.epic ? 8 : 0)) {
        assignedRarity = 'Epic';
        multiplier = 1.5;
        color = 'linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)';
        editionName = 'Pro Spécial';
      } else if (roll <= 40) {
        assignedRarity = 'Rare';
        multiplier = 1.25;
        color = 'linear-gradient(135deg, #b9935a 0%, #e7c996 100%)';
        editionName = 'Joueur Établi';
      }
    } else if (packType === 'goalie') {
      // Pack Gardien : 15% Épique, 35% Rare, 50% Commune
      if (roll <= (thresholds.unlocked.epic ? 15 : 0)) {
        assignedRarity = 'Epic';
        multiplier = 1.5;
        color = 'linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)';
        editionName = 'Mur de Brique';
      } else if (roll <= 50) {
        assignedRarity = 'Rare';
        multiplier = 1.25;
        color = 'linear-gradient(135deg, #b9935a 0%, #e7c996 100%)';
        editionName = 'Gardien Partant';
      }
    } else {
      // Pack Recrue & Profondeur : 15% Rare, 85% Commune
      if (roll <= 15) {
        assignedRarity = 'Rare';
        multiplier = 1.25;
        color = 'linear-gradient(135deg, #b9935a 0%, #e7c996 100%)';
        editionName = 'Espoir LNH';
      }
    }

    // Trouver l'édition correspondante chez le joueur
    const matchingEdition = randomPlayer.cards?.find(c => c.rarity === assignedRarity);
    const baseCap = randomPlayer.base_cap_hit || randomPlayer.cards?.[0]?.cap_hit || 3500000;
    const adjustedCapHit = matchingEdition ? matchingEdition.cap_hit : Math.round(baseCap * (1 + (multiplier - 1) * 0.4));

    pack.push({
      instance_id: `${randomPlayer.nhl_id}_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
      nhl_id: randomPlayer.nhl_id,
      name: randomPlayer.name,
      team: randomPlayer.team,
      team_name: randomPlayer.team_name,
      position: randomPlayer.position,
      number: randomPlayer.number,
      stats: randomPlayer.stats,
      rarity: assignedRarity,
      edition_id: matchingEdition ? matchingEdition.edition_id : `${randomPlayer.nhl_id}_${assignedRarity.toLowerCase().replace('-', '_')}`,
      edition_name: matchingEdition ? matchingEdition.edition_name : editionName,
      multiplier: matchingEdition ? matchingEdition.multiplier : multiplier,
      bg_color: matchingEdition ? matchingEdition.bg_color : color,
      cap_hit: adjustedCapHit,
      playerData: randomPlayer
    });
  }

  return pack;
}


