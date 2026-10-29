import { defineCard } from "../define.js";

// EDHREC rank 23661.
//
// Raid is asked as it resolves, over the whole turn (the rulings).

export default defineCard({
  name: "Arrow Storm",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Arrow Storm deals 4 damage to any target.\nRaid — If you attacked this turn, instead Arrow Storm deals 5 damage to that permanent or player and the damage can't be prevented.",
  targets: ["any-target"],
  effect: {
    kind: "conditional",
    condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
    then: { kind: "damage", amount: 5, target: 0, cantBePrevented: true },
    else: { kind: "damage", amount: 4, target: 0 },
  },
});
