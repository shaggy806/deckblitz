import { defineCard } from "../define.js";

// EDHREC rank 28761.
//
// "Only during the declare attackers step" — any player's turn's.

export default defineCard({
  name: "Teleport",
  manaCost: "{U}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Cast this spell only during the declare attackers step.\nTarget creature can't be blocked this turn.",
  castOnlyIf: { kind: "turn-structure", steps: ["declare-attackers"] },
  targets: ["creature"],
  // A rule for the turn, not a granted ability (rule 611.2c): a later loss
  // of abilities doesn't take it away.
  effect: { kind: "restrict", target: 0, restrictions: ["cant-be-blocked"] },
});
