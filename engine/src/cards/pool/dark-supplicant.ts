import { defineCard } from "../define.js";
import { searchZonesAndOr } from "../helpers.js";

// "Your graveyard, hand, and/or library": the zones are chosen as the ability
// resolves. A named card is a stated quality, so even a search that must be
// made may find nothing in a hidden zone (rule 701.23b).

const SEARCH =
  "{T}, Sacrifice three Clerics: Search your graveyard, hand, and/or library for a card named Scion of Darkness and put it onto the battlefield. If you search your library this way, shuffle.";

export default defineCard({
  name: "Dark Supplicant",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: SEARCH,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { subtype: "Cleric" }, count: 3 } },
      targets: [],
      effect: searchZonesAndOr(["graveyard", "hand", "library"], {
        kind: "search-library",
        filter: { name: "Scion of Darkness" },
        destination: "battlefield",
        min: 0,
        max: 1,
      }),
      resolve: null,
      text: SEARCH,
    },
  ],
});
