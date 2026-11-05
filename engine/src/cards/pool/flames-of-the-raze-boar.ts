import { defineCard } from "../define.js";

// EDHREC rank 25516. The target, dealt lethal damage, is still on the
// battlefield as the rest is dealt (its ruling); "that player" is its controller.

export default defineCard({
  name: "Flames of the Raze-Boar",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Flames of the Raze-Boar deals 4 damage to target creature an opponent controls. Then Flames of the Raze-Boar deals 2 damage to each other creature that player controls if you control a creature with power 4 or greater.",
  targets: ["creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
        then: {
          kind: "for-each-permanent",
          filter: { type: "creature", controlledBy: "you" },
          controlledByTarget: 0,
          exceptTarget: 0,
          as: 1,
          simultaneous: true,
          effect: { kind: "damage", amount: 2, target: 1 },
        },
      },
    ],
  },
});
