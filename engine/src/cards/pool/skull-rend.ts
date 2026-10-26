import { defineCard } from "../define.js";

// Return to Ravnica. EDHREC rank 17436.
//
// Rulings:
//   [2012-10-01] Each of your opponents will discard cards, even if some or all of the damage is
//     prevented or redirected.
//   [2012-10-01] Skull Rend doesn't require any targets.

export default defineCard({
  name: "Skull Rend",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Skull Rend deals 2 damage to each opponent. Those players each discard two cards at random.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, who: "each-opponent" },
      { kind: "discard", target: "each-opponent", amount: 2, random: true },
    ],
  },
});
