import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 27164.
//
// Rulings:
//   [2004-10-04] You can fail to find a land card for any or all basic land types, even if a land
//     card with that basic land type is in your library.
//   [2004-10-04] You can find a nonbasic land card this way as long as it has a basic land type,
//     such as Stomping Ground.
//
// Exactly five lands (Bankrupt in Blood's `sacrificeCount`). The search is one find per basic
// land type (Krosan Verge's `together.oneEach`): any land card with the type fills its slot, a
// dual either of its two, and any slot may be missed (`min: 0`).
const LAND_TYPES = ["Plains", "Island", "Swamp", "Mountain", "Forest"] as const;

export default defineCard({
  name: "Gaea's Balance",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice five lands.\nSearch your library for a land card of each basic land type, put those cards onto the battlefield, then shuffle.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { type: "land", subtypes: [...LAND_TYPES] },
    destination: "battlefield",
    min: 0,
    max: 5,
    together: {
      oneEach: LAND_TYPES.map((type) => ({ label: `a ${type} card`, filter: { type: "land", subtype: type } })),
    },
  },
  additionalCost: { sacrifice: { type: "land", controlledBy: "you" }, sacrificeCount: 5 },
});
