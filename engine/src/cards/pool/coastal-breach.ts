import { defineCard } from "../define.js";

// EDHREC rank 12825.
//
// Rulings:
//   [2016-11-08] Effects that reduce what you pay to cast a spell don’t affect its mana value.
//   [2016-11-08] Causing an opponent to lose the game after you’ve announced that you’re casting a
//     spell with undaunted and determined its total cost won’t cause you to have to pay more mana.

export default defineCard({
  name: "Coastal Breach",
  manaCost: "{6}{U}",
  colors: ["U"],
  types: ["sorcery"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { opponents: true },
  },
  text: "Undaunted (This spell costs {1} less to cast for each opponent.)\nReturn all nonland permanents to their owners' hands.",
  effect: { kind: "return-to-hand-all", filter: { notTypes: ["land"] } },
});
