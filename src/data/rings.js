export const CHAMPIONSHIP_RINGS = [
  {
    id: "market_master",
    title: "Maître du Marché",
    subtitle: "Spécialiste des Échanges",
    description: "Récompense le D.G. ayant effectué les transactions les plus rentables et maîtrisé l'algorithme d'échange à la perfection.",
    appearance: "Un anneau argenté orné d'un graphique de flèches croisées ou d'une balance incrustée de saphirs.",
    metal: "silver",
    gemstone: "sapphire",
    icon: "Balance",
    condition: "Effectuer 5 transactions avec un bénéfice de +10M de valeur cumulée."
  },
  {
    id: "shadow_strategist",
    title: "Stratège de l'Ombre",
    subtitle: "Spécialiste LAH & Réserve",
    description: "Récompense le gérant ayant sauvé sa saison en faisant les meilleurs rappels d'urgence lors des blessures.",
    appearance: "Un anneau de bronze vieilli ou de platine discret, gravé de la silhouette d'un patineur sortant du tunnel.",
    metal: "bronze",
    gemstone: "onyx",
    icon: "Ghost",
    condition: "Remplacer 3 joueurs blessés avec succès par des recrues à faible coût."
  },
  {
    id: "cap_master",
    title: "Maître du Cap",
    subtitle: "Gestion Financière",
    description: "Récompense le D.G. ayant optimisé au maximum ses 104 millions $ de masse salariale tout en extrayant un maximum de points.",
    appearance: "Un anneau doré incrusté d'un symbole de dollar stylisé ou d'une jauge de plafond salarial étincelante.",
    metal: "gold",
    gemstone: "emerald",
    icon: "DollarSign",
    condition: "Terminer la saison à moins de 50 000$ du plafond salarial tout en étant dans le Top 3."
  },
  {
    id: "offensive_king",
    title: "Roi de l'Attaque",
    subtitle: "Trophée Art-Ross Virtuel",
    description: "Récompense l'équipe ayant accumulé le plus grand total combiné de points en saison régulière.",
    appearance: "Un anneau flamboyant aux accents rouges et dorés, serti d'un rubis central représentant la puissance offensive brute.",
    metal: "gold-red",
    gemstone: "ruby",
    icon: "Flame",
    condition: "Terminer 1er au classement total des points offensifs (Saison Régulière)."
  },
  {
    id: "champion_1st",
    title: "Meilleur Pooler de l'Année (1er)",
    subtitle: "Le Couronnement Suprême",
    description: "C'est la bague ultime, la plus massive et prestigieuse. Le champion absolu des séries éliminatoires de fin de saison.",
    appearance: "Ornée d'un diamant central entouré du logo PoolDG. La photo du gagnant y est gravée en miniature.",
    metal: "platinum",
    gemstone: "diamond",
    icon: "Crown",
    condition: "Remporter la Grande Finale des Séries Éliminatoires.",
    isUltimate: true,
    rank: 1
  },
  {
    id: "champion_2nd",
    title: "Finaliste du Pool (2e)",
    subtitle: "Argent et Prestige",
    description: "Une magnifique bague en argent massif décernée au finaliste s'étant battu jusqu'à la fin.",
    appearance: "Un anneau en argent pur avec des accents de saphir.",
    metal: "silver",
    gemstone: "sapphire",
    icon: "Crown",
    condition: "Perdre en Finale (Terminer 2e).",
    isUltimate: true,
    rank: 2
  },
  {
    id: "champion_3rd",
    title: "Médaillé de Bronze (3e)",
    subtitle: "Le Podium",
    description: "La bague de bronze commémorant la présence sur le podium final de l'année.",
    appearance: "Un anneau lourd en bronze brossé avec des émeraudes.",
    metal: "bronze",
    gemstone: "emerald",
    icon: "Crown",
    condition: "Remporter le match de 3e position.",
    isUltimate: true,
    rank: 3
  }
];

// État temporaire simulant la possession des bagues par l'utilisateur actuel
export const USER_UNLOCKED_RINGS = ["market_master", "cap_master", "champion_1st", "champion_2nd", "champion_3rd"];
