import { defineCard } from "../define.js";

// Rulings:
//   [2008-04-01] If a card named Stomping Slabs wasn't revealed this way, Stomping Slabs deals no
//     damage to its target.

export default defineCard({
  name: "Stomping Slabs",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Reveal the top seven cards of your library, then put those cards on the bottom of your library in any order. If a card named Stomping Slabs was revealed this way, Stomping Slabs deals 7 damage to any target.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: 7,
        reveal: true,
        min: 0,
        max: 0,
        destination: "hand",
        leftover: "bottom-any-order",
      },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "revealed", filter: { name: "Stomping Slabs" }, atLeast: 1 },
        then: { kind: "damage", target: 0, amount: 7 },
      },
    ],
  },
});
