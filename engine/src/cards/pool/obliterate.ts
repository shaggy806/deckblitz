import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 9562.
//
// Rulings:
//   [2004-10-04] Counterspells can be cast that target it, but when they resolve they simply don’t
//     counter it since it can’t be countered.
//
// Jokulhaups' effect, uncounterable.
export default defineCard({
  name: "Obliterate",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  cantBeCountered: true,
  text: "This spell can't be countered.\nDestroy all artifacts, creatures, and lands. They can't be regenerated.",
  targets: [],
  effect: {
    kind: "destroy-all",
    filter: { typesAnyOf: ["artifact", "creature", "land"] },
    cantBeRegenerated: true,
  },
});
