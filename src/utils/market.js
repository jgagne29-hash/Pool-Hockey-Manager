/**
 * Module d'Économie des Cartes & Valeur Marchande (Marketplace)
 */

// Tarifs de revente rapide (Quick Sell) en Rondelles d'Or (Puck Coins)
export const QUICK_SELL_VALUES = {
  'Common': 50,
  'Rare': 250,
  'Epic': 1000,
  'Ultra-Rare': 5000
};

// Prix d'achat des paquets de cartes en magasin
export const PACK_COIN_PRICES = {
  'rookie': 300,
  'allstar': 1000,
  'legend': 3000
};

/**
 * Calcule la Valeur de Marché (Market Value) d'une carte pour les échanges entre gérants
 * Formule officielle : (Production LNH + Impact Rôle) * Multiplicateur Holographique
 */
export function calculateMarketValue(player, edition) {
  if (!player) return 0;
  const multiplier = edition?.multiplier || 1.0;

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

  // Bonus de rareté intrinsèque
  const rarityBonus = edition?.rarity === 'Ultra-Rare' ? 100 :
                      edition?.rarity === 'Epic' ? 45 :
                      edition?.rarity === 'Rare' ? 15 : 0;

  return Math.round((rawScore * multiplier) + rarityBonus);
}

/**
 * Calcule la valeur de revente rapide (Quick Sell) immédiate d'une carte
 */
export function getQuickSellCoinValue(rarity = 'Common') {
  return QUICK_SELL_VALUES[rarity] || 50;
}

