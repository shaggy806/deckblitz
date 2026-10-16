import { defineCard } from "../define.js";

// EDHREC rank 18328.
//
// Rulings:
//   [2024-04-12] Use the mana value of the creature as it last existed on the battlefield to
//     determine whether or not you surveil.
//   [2024-04-12] If the target creature has {X} in its mana cost, X is 0 for the purpose of
//     determining its mana value.
//   [2024-04-12] If the target creature is an illegal target as Consuming Ashes tries to resolve,
//     it won’t resolve and none of its effects will happen. You won’t surveil.

// "If it had mana value 3 or less" is read off the creature as it last
// existed on the battlefield (the ruling — the `target` condition, rule
// 608.2h); an illegal target means no surveil.
export default defineCard({
  name: "Consuming Ashes",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile target creature. If it had mana value 3 or less, surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 3 } } },
        then: { kind: "surveil", amount: 2 },
      },
    ],
  },
});
