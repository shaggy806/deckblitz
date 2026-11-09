import { defineCard } from "../define.js";

// EDHREC rank 26319.

export default defineCard({
  name: "Carbonize",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Carbonize deals 3 damage to any target. If it's a creature, it can't be regenerated this turn, and if it would die this turn, exile it instead.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "creature" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "cant-regenerate", target: 0 },
            { kind: "exile-if-dies-this-turn", target: 0 },
          ],
        },
      },
    ],
  },
});
