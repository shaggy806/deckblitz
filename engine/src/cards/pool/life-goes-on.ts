import { defineCard } from "../define.js";

// EDHREC rank 18177.
//
// Rulings:
//   [2017-07-14] You won't gain more than 8 life if more than one creature died this turn.

export default defineCard({
  name: "Life Goes On",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "You gain 4 life. If a creature died this turn, you gain 8 life instead.",
  effect: {
    kind: "conditional",
    condition: { kind: "creature-died-this-turn" },
    then: { kind: "gain-life", amount: 8 },
    else: { kind: "gain-life", amount: 4 },
  },
});
