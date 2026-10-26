import { defineCard } from "../define.js";

// EDHREC rank 27101.
//
// Rulings:
//   [2007-05-01] Ghostfire is colorless in all zones. Its damage comes from a colorless source.
//
// "Ghostfire is colorless" is a characteristic-defining ability (rule 604.3):
// its colours are none in every zone, which `colors: []` is.

export default defineCard({
  name: "Ghostfire",
  manaCost: "{2}{R}",
  colors: [],
  types: ["instant"],
  text: "Ghostfire is colorless.\nGhostfire deals 3 damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
});
