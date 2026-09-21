// Système de Boost Temporaire (Durabilité 35 Jours Max)
// Les cartes TCG ne remplacent pas les joueurs repêchés : elles s'attachent en boost temporaire.

export const MAX_BOOST_DURABILITY_DAYS = 35;

/**
 * Calcule l'état d'usure et la cote de condition d'une carte selon ses jours restants.
 * L'état d'usure influe directement sur l'efficacité et la valeur marchande P2P.
 * 
 * @param {number} remainingDays - Jours restants (0 à 35)
 * @returns {object} Informations de condition
 */
export function getCardCondition(remainingDays = 35) {
  const days = Math.max(0, Math.min(MAX_BOOST_DURABILITY_DAYS, Number(remainingDays) || 0));

  if (days >= 31) {
    return {
      status: 'Fraîche',
      badge: '✨ Fraîche',
      description: 'Sortie du paquet, brillance maximale',
      daysLeft: days,
      maxDays: MAX_BOOST_DURABILITY_DAYS,
      percentage: Math.round((days / MAX_BOOST_DURABILITY_DAYS) * 100),
      valueFactor: 1.0, // 100% de la cote P2P
      active: true,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.25)',
      badgeClass: 'condition-fresh'
    };
  }

  if (days >= 21) {
    return {
      status: 'Top Shape',
      badge: '⚡ Top Shape',
      description: 'Excellente condition de jeu',
      daysLeft: days,
      maxDays: MAX_BOOST_DURABILITY_DAYS,
      percentage: Math.round((days / MAX_BOOST_DURABILITY_DAYS) * 100),
      valueFactor: 0.90, // 90% de la cote P2P
      active: true,
      color: '#00d2ff',
      bgGlow: 'rgba(0, 210, 255, 0.25)',
      badgeClass: 'condition-top-shape'
    };
  }

  if (days >= 10) {
    return {
      status: 'Légère Usure',
      badge: '⚠️ Légère Usure',
      description: 'Utilisation régulière sur la glace',
      daysLeft: days,
      maxDays: MAX_BOOST_DURABILITY_DAYS,
      percentage: Math.round((days / MAX_BOOST_DURABILITY_DAYS) * 100),
      valueFactor: 0.72, // 72% de la cote P2P
      active: true,
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.25)',
      badgeClass: 'condition-light-wear'
    };
  }

  if (days >= 1) {
    return {
      status: 'Usée',
      badge: '⏳ Usée',
      description: 'Fin de cycle de vie imminente',
      daysLeft: days,
      maxDays: MAX_BOOST_DURABILITY_DAYS,
      percentage: Math.round((days / MAX_BOOST_DURABILITY_DAYS) * 100),
      valueFactor: 0.45, // 45% de la cote P2P
      active: true,
      color: '#ef4444',
      bgGlow: 'rgba(239, 68, 68, 0.25)',
      badgeClass: 'condition-worn'
    };
  }

  return {
    status: 'Épuisée',
    badge: '🛑 Épuisée',
    description: 'Boost inactif (reste conservée dans le Cartable)',
    daysLeft: 0,
    maxDays: MAX_BOOST_DURABILITY_DAYS,
    percentage: 0,
    valueFactor: 0.15, // Valeur de collectionneur résiduelle
    active: false,
    color: '#64748b',
    bgGlow: 'rgba(100, 116, 139, 0.2)',
    badgeClass: 'condition-depleted'
  };
}

/**
 * Calcule l'impact effectif d'un boost de carte sur un joueur repêché
 * @param {object} draftedPlayer - Le joueur de base dans l'alignement
 * @param {object|null} attachedCard - La carte attachée comme boost
 * @returns {object} Multiplicateur effectif, masse salariale et statut
 */
export function calculateBoostImpact(draftedPlayer, attachedCard) {
  if (!draftedPlayer) return null;
  if (!attachedCard) {
    return {
      hasBoost: false,
      effectiveMultiplier: 1.0,
      effectiveCapHit: draftedPlayer.base_cap_hit || draftedPlayer.cap_hit || 0,
      condition: null
    };
  }

  const daysLeft = attachedCard.durability_days !== undefined ? attachedCard.durability_days : MAX_BOOST_DURABILITY_DAYS;
  const condition = getCardCondition(daysLeft);

  // Si le boost est épuisé (0 jours restants), le multiplicateur retombe à 1.0
  const effectiveMultiplier = condition.active ? (attachedCard.multiplier || 1.0) : 1.0;
  
  // Le Cap Hit appliqué est celui de la variante si le boost est actif, sinon le cap hit standard
  const effectiveCapHit = condition.active
    ? (attachedCard.cap_hit || draftedPlayer.base_cap_hit || draftedPlayer.cap_hit || 0)
    : (draftedPlayer.base_cap_hit || draftedPlayer.cap_hit || 0);

  return {
    hasBoost: true,
    cardId: attachedCard.edition_id,
    rarity: attachedCard.rarity,
    daysLeft,
    condition,
    effectiveMultiplier,
    effectiveCapHit,
    bonusPercent: Math.round((effectiveMultiplier - 1.0) * 100)
  };
}
