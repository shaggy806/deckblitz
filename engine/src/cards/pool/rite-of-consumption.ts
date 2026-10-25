import { defineCard } from "../define.js";

// EDHREC rank 8007.
//
// Rulings:
//   [2013-04-15] You must sacrifice exactly one creature to cast this spell; you cannot cast it
//     without sacrificing a creature, and you cannot sacrifice additional creatures.
// The sacrificed creature's power is its last-known power (Fling's shape).

export default defineCard({
  name: "Rite of Consumption",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nRite of Consumption deals damage equal to the sacrificed creature's power to target player or planeswalker. You gain life equal to the damage dealt this way.",
  targets: ["player-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", target: 0, amount: { powerOf: "sacrificed" } },
      { kind: "gain-life", amount: { damageDealtThisWay: true } },
    ],
  },
});
