import { getCardCondition } from './boosts';

/**
 * Module d'Économie des Cartes, Cotation & Algorithme d'Équité P2P (PoolDG.cards)
 */

// Tarifs de revente rapide (Quick Sell) ajustés aux 6 variantes officielles
export const QUICK_SELL_VALUES = {
  'Base': 25,
  'Common': 25,
  'Régulière': 75,
  'Super': 250,
  'Rare': 150,
  'Ultra': 750,
  'Ultra-Rare': 750,
  'Mystique': 1500,
  'Epic': 600,
  'The Patch (1-of-1)': 5000,
  'The Patch': 5000
};

// Budget de départ officiel offert à l'enregistrement pour tout monter de A à Z (5 000 🪙)
export const STARTING_USER_COINS = 5000;

// Taux de conversion officiel : Chaque point marqué par l'alignement rapporte 2 Rondelles d'Or
export const POINTS_TO_COINS_RATIO = 2;

// Marge d'écart maximale autorisée par l'algorithme d'équité P2P (15%)
export const MAX_TRADE_EQUITY_MARGIN_PCT = 15;

// Définition officielle des formats de paquets selon la valeur réelle des joueurs LNH
export const PACK_DEFINITIONS = {
  standard: {
    id: 'standard',
    name: 'Booster Standard (5 Cartes)',
    price: 750,
    cardCount: 5,
    dailyLimit: 10,
    tier: 'Argent',
    color: 'linear-gradient(135deg, #1d3557 0%, #457b9d 100%)',
    shadow: '0 12px 35px rgba(69, 123, 157, 0.4)',
    accent: '#00d2ff',
    description: 'Accessible après de bonnes performances hebdomadaires ou quelques jours de connexion.',
    chancesText: 'Base (70%), Régulière (20%), Super (6%) • 5 cartes'
  },
  premium: {
    id: 'premium',
    name: 'Booster Premium / Rareté Garantie (5 Cartes)',
    price: 2500,
    cardCount: 5,
    dailyLimit: 5,
    tier: 'Or',
    color: 'linear-gradient(135deg, #b9935a 0%, #f5af19 50%, #e7c996 100%)',
    shadow: '0 12px 35px rgba(245, 175, 25, 0.5)',
    accent: '#f5af19',
    description: 'Un investissement de moyen/long terme pour les D.G. qui veulent chasser les raretés. Taux de drop amélioré !',
    chancesText: 'Super (Garantie), Ultra, Mystique, The Patch 1-of-1 • 5 cartes'
  }
};

/**
 * Calcule la Valeur Marchande (Market Value) d'une carte pour les échanges entre gérants
 * Formule officielle :
 * [(Production LNH + Impact Rôle) * Multiplicateur Holographique + Bonus Rareté] * Facteur d'Usure (Durabilité 35j)
 * 
 * @param {object} player - Données du joueur (stats, position)
 * @param {object} edition - Variante de la carte (rarity, multiplier)
 * @param {number} durabilityDays - Jours restants de durabilité (0 à 35)
 * @returns {number} Cote marchande en points/rondelles
 */
export function calculateMarketValue(player, edition, durabilityDays = 35) {
  if (!player) return 0;
  const multiplier = edition?.multiplier || 1.0;
  const days = edition?.durability_days !== undefined ? edition.durability_days : durabilityDays;
  const condition = getCardCondition(days);

  let rawScore = 0;
  if (player.position === 'G') {
    const wins = player.stats?.wins || 0;
    const shutouts = player.stats?.so || 0;
    rawScore = (wins * 6) + (shutouts * 12);
  } else {
    const goals = player.stats?.g || 0;
    const assists = player.stats?.a || 0;
    const diff = parseInt(player.stats?.plusMinus || '0', 10) || 0;
    rawScore = (goals * 3) + (assists * 2) + Math.max(-5, diff);
  }

  // Bonus de rareté intrinsèque selon les 6 variantes
  const rarity = edition?.rarity || 'Base';
  let rarityBonus = 5;
  if (rarity === 'The Patch (1-of-1)' || edition?.is_one_of_one) rarityBonus = 750;
  else if (rarity === 'Mystique') rarityBonus = 350;
  else if (rarity === 'Ultra' || rarity === 'Ultra-Rare') rarityBonus = 180;
  else if (rarity === 'Super') rarityBonus = 70;
  else if (rarity === 'Régulière') rarityBonus = 25;

  // Calcul brut avec multiplicateur
  const baseValue = (rawScore * multiplier) + rarityBonus;

  // Application stricte du facteur d'usure de condition (Fraîche = 100%, Top Shape = 90%, etc.)
  const finalValue = Math.round(baseValue * condition.valueFactor);

  return Math.max(10, finalValue);
}

/**
 * Algorithme d'Équité P2P PoolDG.cards (Règle d'or de 15% max)
 * Protège les gérants contre les transactions prédatrices ou collusions.
 * 
 * @param {Array} offeredCards - Cartes offertes avec stats et jours restants
 * @param {Array} requestedCards - Cartes demandées avec stats et jours restants
 * @returns {object} Diagnostic d'équité de l'échange
 */
export function evaluateTradeEquity(offeredCards = [], requestedCards = []) {
  const sumOffered = offeredCards.reduce((acc, card) => {
    const p = card.playerData || card;
    return acc + calculateMarketValue(p, card, card.durability_days);
  }, 0);

  const sumRequested = requestedCards.reduce((acc, card) => {
    const p = card.playerData || card;
    return acc + calculateMarketValue(p, card, card.durability_days);
  }, 0);

  if (sumOffered === 0 && sumRequested === 0) {
    return {
      isFair: true,
      marginPct: 0,
      maxAllowedMarginPct: MAX_TRADE_EQUITY_MARGIN_PCT,
      offeredValue: 0,
      requestedValue: 0,
      status: 'NEUTRE',
      message: 'Sélectionnez des cartes pour évaluer l\'équité de la transaction.'
    };
  }

  const maxValue = Math.max(sumOffered, sumRequested);
  const diff = Math.abs(sumOffered - sumRequested);
  const marginPct = maxValue > 0 ? Math.round((diff / maxValue) * 100) : 0;
  const isFair = marginPct <= MAX_TRADE_EQUITY_MARGIN_PCT;

  return {
    isFair,
    marginPct,
    maxAllowedMarginPct: MAX_TRADE_EQUITY_MARGIN_PCT,
    offeredValue: sumOffered,
    requestedValue: sumRequested,
    difference: diff,
    status: isFair ? 'ÉQUITABLE' : 'DÉSÉQUILIBRÉ',
    message: isFair
      ? `Échange conforme (Écart de ${marginPct}% ≤ 15% toléré par la ligue).`
      : `Échange refusé par le comité d'équité (Écart de ${marginPct}% excède la limite stricte de 15%).`
  };
}

/**
 * Calcule la valeur de revente rapide (Quick Sell) d'une carte
 */
export function getQuickSellCoinValue(rarity = 'Base') {
  return QUICK_SELL_VALUES[rarity] || 25;
}
