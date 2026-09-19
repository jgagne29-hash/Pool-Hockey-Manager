/**
 * Module d'Économie des Cartes & Valeur Marchande (Marketplace)
 */

// Tarifs de revente rapide (Quick Sell) modérés pour valoriser le talent de gestionnaire (Management Skills)
export const QUICK_SELL_VALUES = {
  'Common': 10,       // Carte ordinaire : valeur de dépannage
  'Rare': 35,         // Carte Rare : 35 rondelles
  'Epic': 120,        // Carte Épique : 120 rondelles
  'Ultra-Rare': 450   // Carte Ultra-Rare Diamant : 450 rondelles
};

// Budget de départ offert à l'enregistrement
export const STARTING_USER_COINS = 1500;

// Taux de conversion officiel : Chaque point marqué par l'alignement rapporte 2 Rondelles d'Or
export const POINTS_TO_COINS_RATIO = 2;

// Définition officielle des formats de paquets selon la valeur réelle des joueurs LNH
export const PACK_DEFINITIONS = {
  rookie: {
    id: 'rookie',
    name: 'Pack Recrue & Profondeur LNH',
    price: 150,
    cardCount: 3,
    dailyLimit: 10,
    tier: 'Bronze',
    color: 'linear-gradient(135deg, #135200 0%, #52c41a 100%)',
    shadow: '0 12px 32px rgba(82, 196, 26, 0.35)',
    accent: '#52c41a',
    description: 'Joueurs de profondeur et recrues de la LNH. Idéal pour bâtir un alignement respectant le plafond salarial !',
    chancesText: 'Commune (85%), Rare (15%)'
  },
  pro: {
    id: 'pro',
    name: 'Pack Régulier LNH (Top 9 / Top 4)',
    price: 450,
    cardCount: 4,
    dailyLimit: 6,
    tier: 'Argent',
    color: 'linear-gradient(135deg, #1d3557 0%, #457b9d 100%)',
    shadow: '0 12px 35px rgba(69, 123, 157, 0.4)',
    accent: '#00d2ff',
    description: 'Joueurs établis de la LNH avec production constante et impact défensif.',
    chancesText: 'Commune (60%), Rare (32%), Épique (8%)'
  },
  allstar: {
    id: 'allstar',
    name: 'Pack All-Star Or',
    price: 1000,
    cardCount: 4,
    dailyLimit: 3,
    tier: 'Or',
    color: 'linear-gradient(135deg, #b9935a 0%, #f5af19 50%, #e7c996 100%)',
    shadow: '0 12px 35px rgba(245, 175, 25, 0.5)',
    accent: '#f5af19',
    description: 'Vedettes et étoiles confirmées de la ligue (Suzuki, Caufield, Lafrenière...).',
    chancesText: 'Rare (55%), Épique (35%), Ultra-Rare (10%)'
  },
  legend: {
    id: 'legend',
    name: 'Pack Superstars Stanley Cup',
    price: 2500,
    cardCount: 5,
    dailyLimit: 1,
    tier: 'Diamant',
    color: 'linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)',
    shadow: '0 15px 40px rgba(233, 64, 87, 0.6)',
    accent: '#e94057',
    description: 'L\'élite mondiale : McDavid, MacKinnon, Kucherov, Makar. Garanti au moins 1 carte Épique ou Ultra-Rare !',
    chancesText: 'Rare (35%), Épique (45%), Ultra-Rare (20%)'
  },
  goalie: {
    id: 'goalie',
    name: 'Pack Gardiens du Temple',
    price: 600,
    cardCount: 3,
    dailyLimit: 2,
    tier: 'Gardiens',
    color: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
    shadow: '0 12px 35px rgba(78, 67, 118, 0.5)',
    accent: '#a855f7',
    description: 'Exclusivité 100% Gardiens de but LNH (Montembeault, Swayman, Hellebuyck, Shesterkin...).',
    chancesText: 'Gardiens Communs (50%), Rares (35%), Épiques (15%)'
  }
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
 * Calcule la valeur de revente rapide (Quick Sell) modérée d'une carte
 */
export function getQuickSellCoinValue(rarity = 'Common') {
  return QUICK_SELL_VALUES[rarity] || 10;
}


