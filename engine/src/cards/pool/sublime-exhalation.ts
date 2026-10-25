import { defineCard } from "../define.js";

// EDHREC rank 15262.
//
// Rulings:
//   [2016-11-08] Causing an opponent to lose the game after you've announced that you're casting a
//     spell with undaunted and determined its total cost won't cause you to have to pay more mana.
//   [2016-11-08] Effects that reduce what you pay to cast a spell don't affect its mana value.

export default defineCard({
  name: "Sublime Exhalation",
  manaCost: "{6}{W}",
  colors: ["W"],
  types: ["sorcery"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { opponents: true },
  },
  text: "Undaunted (This spell costs {1} less to cast for each opponent.)\nDestroy all creatures.",
  effect: { kind: "destroy-all", filter: { type: "creature" } },
});
