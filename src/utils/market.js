/**
 * Calcule la Valeur de Marché (Market Value) d'une carte selon la formule officielle du pooler :
 * Valeur = (Buts * 3 + Passes * 2 + Différentiel) * Multiplicateur de Rareté
 */
export function calculateMarketValue(player, edition) {
  if (!player || !edition) return 0;

  let rawScore = 0;
  if (player.position === 'G') {
    const wins = player.stats?.wins || 0;
    const shutouts = player.stats?.so || 0;
    rawScore = (wins * 7) + (shutouts * 12);
  } else {
    const goals = player.stats?.g || 0;
    const assists = player.stats?.a || 0;
    const diff = parseInt(player.stats?.plusMinus || '0', 10);
    rawScore = (goals * 3) + (assists * 2) + diff;
  }

  return Math.round(rawScore * edition.multiplier);
}
