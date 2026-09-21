export const AHL_AFFILIATIONS = {
  "ANA": { teamName: "San Diego Gulls", poolId: "san_diego_gulls" },
  "BOS": { teamName: "Providence Bruins", poolId: "providence_bruins" },
  "BUF": { teamName: "Rochester Americans", poolId: "rochester_americans" },
  "CAR": { teamName: "Chicago Wolves", poolId: "chicago_wolves" },
  "CBJ": { teamName: "Cleveland Monsters", poolId: "cleveland_monsters" },
  "CGY": { teamName: "Calgary Wranglers", poolId: "calgary_wranglers" },
  "CHI": { teamName: "Rockford IceHogs", poolId: "rockford_icehogs" },
  "COL": { teamName: "Colorado Eagles", poolId: "colorado_eagles" },
  "DAL": { teamName: "Texas Stars", poolId: "texas_stars" },
  "DET": { teamName: "Grand Rapids Griffins", poolId: "grand_rapids_griffins" },
  "EDM": { teamName: "Bakersfield Condors", poolId: "bakersfield_condors" },
  "FLA": { teamName: "Charlotte Checkers", poolId: "charlotte_checkers" },
  "LAK": { teamName: "Ontario Reign", poolId: "ontario_reign" },
  "MIN": { teamName: "Iowa Wild", poolId: "iowa_wild" },
  "MTL": { teamName: "Rocket de Laval", poolId: "laval_rocket" },
  "NJD": { teamName: "Utica Comets", poolId: "utica_comets" },
  "NSH": { teamName: "Milwaukee Admirals", poolId: "milwaukee_admirals" },
  "NYI": { teamName: "Bridgeport Islanders", poolId: "bridgeport_islanders" },
  "NYR": { teamName: "Hartford Wolf Pack", poolId: "hartford_wolf_pack" },
  "OTT": { teamName: "Belleville Senators", poolId: "belleville_senators" },
  "PHI": { teamName: "Lehigh Valley Phantoms", poolId: "lehigh_valley_phantoms" },
  "PIT": { teamName: "Wilkes-Barre/Scranton Penguins", poolId: "wbs_penguins" },
  "SJS": { teamName: "San Jose Barracuda", poolId: "san_jose_barracuda" },
  "SEA": { teamName: "Coachella Valley Firebirds", poolId: "coachella_valley_firebirds" },
  "STL": { teamName: "Springfield Thunderbirds", poolId: "springfield_thunderbirds" },
  "TBL": { teamName: "Syracuse Crunch", poolId: "syracuse_crunch" },
  "TOR": { teamName: "Toronto Marlies", poolId: "toronto_marlies" },
  "UTA": { teamName: "Tucson Roadrunners", poolId: "tucson_roadrunners" },
  "VAN": { teamName: "Abbotsford Canucks", poolId: "abbotsford_canucks" },
  "VGK": { teamName: "Henderson Silver Knights", poolId: "henderson_silver_knights" },
  "WSH": { teamName: "Hershey Bears", poolId: "hershey_bears" },
  "WPG": { teamName: "Manitoba Moose", poolId: "manitoba_moose" }
};

/**
 * Vérifie si un joueur est blessé et propose le club-école associé
 */
export function handlePlayerInjury(player) {
  if (player.is_injured) {
    const affiliation = AHL_AFFILIATIONS[player.team];
    if (affiliation) {
      return {
        status: "CALL_UP_REQUIRED",
        message: `${player.name} (${player.team}) est blessé. Vous pouvez effectuer un rappel d'urgence depuis le ${affiliation.teamName}.`,
        availableFarmTeam: affiliation.poolId,
        teamName: affiliation.teamName
      };
    }
  }
  return { status: "ACTIVE" };
}
