/**
 * Module d'Économie des Cartes & Valeur Marchande (Marketplace)
 */

// Tarifs de revente rapide (Quick Sell) ajustés pour valoriser le talent de gestionnaire (Management Skills)
export const QUICK_SELL_VALUES = {
  'Common': 25,       // Carte ordinaire / profondeur : 25 rondelles (facile à échanger pour monter son budget)
  'Rare': 60,         // Carte Rare : 60 rondelles
  'Epic': 180,        // Carte Épique : 180 rondelles
  'Ultra-Rare': 500   // Carte Ultra-Rare Diamant : 500 rondelles
};

// Budget de départ officiel offert à l'enregistrement pour tout monter de A à Z (5 000 🪙)
export const STARTING_USER_COINS = 5000;

// Taux de conversion officiel : Chaque point marqué par l'alignement rapporte 2 Rondelles d'Or
export const POINTS_TO_COINS_RATIO = 2;

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
    chancesText: 'Commune (85%), Rare (15%) • 6 cartes garanties'
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
    chancesText: 'Commune (65%), Rare (28%), Épique (7%) • 6 cartes garanties'
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
    description: 'Vedettes et étoiles confirmées de la ligue (Suzuki, Caufield, Lafrenière...).',
    chancesText: 'Rare (55%), Épique (35%), Ultra-Rare (10%) • 6 cartes garanties'
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
    description: 'L\'élite mondiale : McDavid, MacKinnon, Kucherov, Makar. Garanti au moins 1 carte Épique ou Ultra-Rare !',
    chancesText: 'Rare (35%), Épique (45%), Ultra-Rare (20%) • 6 cartes'
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
    chancesText: 'Gardiens Communs (55%), Rares (35%), Épiques (10%) • 4 gardiens'
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


