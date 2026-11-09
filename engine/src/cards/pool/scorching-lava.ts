import { defineCard } from "../define.js";

// EDHREC rank 26019. Carbonize's shape when kicked: "that creature" is the target
// if it's a creature; a player just takes the damage.

export default defineCard({
  name: "Scorching Lava",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Kicker {R} (You may pay an additional {R} as you cast this spell.)\nScorching Lava deals 2 damage to any target. If this spell was kicked, that creature can't be regenerated this turn and if it would die this turn, exile it instead.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 2, target: 0 },
  kicker: {
    cost: "{R}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "damage", amount: 2, target: 0 },
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
  },
});
