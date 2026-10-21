import { defineCard } from "../define.js";

// EDHREC rank 14515. Ikoria: Lair of Behemoths.
//
// Rulings:
//   [2020-04-17] If the target nonland permanent is an illegal target by the time Gust of Wind
//     tries to resolve, the spell won't resolve. You won't draw a card.
//   [2020-04-17] Gust of Wind is unaffected if you no longer control a creature with flying after
//     you've cast it.

export default defineCard({
  name: "Gust of Wind",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "This spell costs {2} less to cast if you control a creature with flying.\nReturn target nonland permanent you don't control to its owner's hand.\nDraw a card.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { type: "creature", keyword: "flying" }, atLeast: 1 },
    reduceGeneric: 2,
  },
  targets: ["nonland-permanent-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
