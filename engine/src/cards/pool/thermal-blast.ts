import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 31578. Threshold is checked as the spell resolves
// (Thermal Blast itself is on the stack then, not in the graveyard).

export default defineCard({
  name: "Thermal Blast",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Thermal Blast deals 3 damage to target creature.\nThreshold — Thermal Blast deals 5 damage instead if there are seven or more cards in your graveyard.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "threshold" },
    then: { kind: "damage", amount: 5, target: 0 },
    else: { kind: "damage", amount: 3, target: 0 },
  },
});
