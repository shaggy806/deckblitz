import { defineCard } from "../define.js";

// Mirage. EDHREC rank 18877.
//
// Rulings:
//   [2004-10-04] Will not tap a creature that is both white and another color.

export default defineCard({
  name: "Blinding Light",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Tap all nonwhite creatures.",
  targets: [],
  effect: { kind: "tap-all", filter: { type: "creature", notColors: ["W"] } },
});
