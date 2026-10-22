import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] Only affects creatures on the battlefield, not ones in hands or graveyards.
//
// One exile event; then each player draws one card for each creature they
// controlled that was exiled this way (tokens included).
export default defineCard({
  name: "Martyr's Cry",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile all white creatures. For each creature exiled this way, its controller draws a card.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-all", filter: { type: "creature", colors: ["W"] } },
      { kind: "draw", who: "each-player", amount: { thisWay: "exiled", who: "each" } },
    ],
  },
});
