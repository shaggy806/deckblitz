import { defineCard } from "../define.js";

// EDHREC rank 23596. Chaosphere's first line.
//
// Rulings:
//   [2008-05-01] A creature with reach can still block creatures with flying as well as creatures
//     without flying.
const TEXT = "Creatures with flying can block only creatures with flying.";

export default defineCard({
  name: "Dense Canopy",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [{ affects: { scope: "all-creatures", withKeyword: "flying" }, canBlockOnly: { keyword: "flying" }, text: TEXT }],
});
