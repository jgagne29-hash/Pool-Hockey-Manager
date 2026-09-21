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
  rookie: {
    id: 'rookie',
    name: 'Pack Recrue & Profondeur LNH (6 Cartes)',
    price: 150,
    cardCount: 6,
    dailyLimit: 15,
    tier: 'Bronze',
    color: 'linear-gradient(135deg, #135200 0%, #52c41a 100%)',
    shadow: '0 12px 32px rgba(82, 196, 26, 0.35)',
    accent: '#52c41a',
    description: '6 cartes par paquet ! Idéal pour bâtir ses 4 lignes de A à Z et accumuler des petites cartes à revendre pour grossir son budget.',
    chancesText: 'Base (70%), Régulière (20%), Super (6%) • 6 cartes garanties'
  },
  pro: {
    id: 'pro',
    name: 'Pack Régulier LNH (Top 9 / Top 4)',
    price: 400,
    cardCount: 6,
    dailyLimit: 10,
    tier: 'Argent',
    color: 'linear-gradient(135deg, #1d3557 0%, #457b9d 100%)',
    shadow: '0 12px 35px rgba(69, 123, 157, 0.4)',
    accent: '#00d2ff',
    description: '6 cartes établies de la LNH. Excellent ratio de cartes régulières et d\'opportunités d\'échanges monétaires.',
    chancesText: 'Base, Régulière, Super, Ultra (2%), Mystique (1.5%) • 6 cartes'
  },
  allstar: {
    id: 'allstar',
    name: 'Pack All-Star Or (6 Cartes)',
    price: 950,
    cardCount: 6,
    dailyLimit: 5,
    tier: 'Or',
    color: 'linear-gradient(135deg, #b9935a 0%, #f5af19 50%, #e7c996 100%)',
    shadow: '0 12px 35px rgba(245, 175, 25, 0.5)',
    accent: '#f5af19',
    description: 'Vedettes et étoiles confirmées de la ligue (Suzuki, Caufield, Lafrenière...). Accès aux The Patch 1-of-1 !',
    chancesText: 'Super (6%), Ultra (2%), Mystique (1.5%), The Patch 1/1 (0.5%)'
  },
  legend: {
    id: 'legend',
    name: 'Pack Superstars Stanley Cup (6 Cartes)',
    price: 2200,
    cardCount: 6,
    dailyLimit: 3,
    tier: 'Diamant',
    color: 'linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)',
    shadow: '0 15px 40px rgba(233, 64, 87, 0.6)',
    accent: '#e94057',
    description: 'L\'élite mondiale : McDavid, MacKinnon, Kucherov, Makar. Meilleure probabilité de cartes Mystiques et Patch 1/1.',
    chancesText: 'Super, Ultra, Mystique, The Patch 1-of-1 • 6 cartes'
  },
  goalie: {
    id: 'goalie',
    name: 'Pack Gardiens du Temple (4 Cartes)',
    price: 500,
    cardCount: 4,
    dailyLimit: 4,
    tier: 'Gardiens',
    color: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
    shadow: '0 12px 35px rgba(78, 67, 118, 0.5)',
    accent: '#a855f7',
    description: 'Exclusivité 100% Gardiens de but LNH (Montembeault, Swayman, Hellebuyck, Shesterkin...).',
    chancesText: 'Gardiens LNH certifiés • 4 cartes'
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
