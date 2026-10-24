import { defineCard } from "../define.js";

// EDHREC rank 31331.
//
// Deft Dismissal's divided damage among attacking or blocking creatures: the
// division is chosen as it's cast, each target getting at least 1, so at most
// five targets (the rulings).

export default defineCard({
  name: "Roil's Retribution",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Roil's Retribution deals 5 damage divided as you choose among any number of target attacking or blocking creatures.",
  targets: [{ kind: "any-number", of: "attacking-or-blocking-creature", min: 1, max: 5 }],
  divided: { total: 5, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
