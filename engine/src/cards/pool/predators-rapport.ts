import { defineCard } from "../define.js";

// EDHREC rank 14663.
//
// Rulings:
//   [2013-01-24] Use the creature's power and toughness when Predator's Rapport resolves to
//     determine how much life you gain.

export default defineCard({
  name: "Predator's Rapport",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose target creature you control. You gain life equal to that creature's power plus its toughness.",
  targets: ["creature-you-control"],
  effect: { kind: "gain-life", amount: { sum: [{ powerOf: 0 }, { toughnessOf: 0 }] } },
});
