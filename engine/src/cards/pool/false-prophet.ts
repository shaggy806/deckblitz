import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 19985.
//
// Rulings:
//   [2004-10-04] False Prophet only exiles creatures, which means only creature permanents which
//     are on the battlefield. It won’t exile itself since it is already in the graveyard.

export default defineCard({
  name: "False Prophet",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: "When this creature dies, exile all creatures.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "exile-all", filter: { type: "creature" } },
      resolve: null,
      text: "When this creature dies, exile all creatures.",
    },
  ],
});
