import { defineCard } from "../define.js";

// EDHREC rank 23554.
//
// Rulings:
//   [2004-10-04] Damage that is prevented does not count toward the total.

export default defineCard({
  name: "Final Punishment",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player loses life equal to the damage already dealt to that player this turn.",
  targets: ["player"],
  effect: { kind: "lose-life", target: 0, amount: { turnStat: "damage-taken", target: 0 } },
});
