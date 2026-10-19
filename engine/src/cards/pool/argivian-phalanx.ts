import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 23663.
//
// Rulings:
//   [2022-09-09] Argivian Phalanx's first ability can't reduce the {W} in its cost.

export default defineCard({
  name: "Argivian Phalanx",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Kor", "Soldier"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Affinity for creatures (This spell costs {1} less to cast for each creature you control.)\nVigilance (Attacking doesn't cause this creature to tap.)",
  selfCostReduction: affinity({ type: "creature" }),
});
