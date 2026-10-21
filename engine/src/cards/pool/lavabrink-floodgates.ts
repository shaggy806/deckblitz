import { defineCard } from "../define.js";

// EDHREC rank 13307. The player whose upkeep it is chooses: put a doom
// counter, remove one, or neither (the ruling). The sacrifice is checked only
// as this ability resolves, and the 6 damage is a reflexive trigger of that
// sacrifice alone.

export default defineCard({
  name: "Lavabrink Floodgates",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: "{T}: Add {R}{R}.\nAt the beginning of each player's upkeep, that player may put a doom counter on this artifact or remove a doom counter from it. Then if it has three or more doom counters on it, sacrifice this artifact. When you do, it deals 6 damage to each creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 2 },
      resolve: null,
      text: "{T}: Add {R}{R}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "each-player-may",
            who: "active-player",
            choices: [
              {
                text: "Put a doom counter on Lavabrink Floodgates.",
                effect: { kind: "add-counter", target: "source", counter: "doom", amount: 1, by: "that-player" },
              },
              {
                text: "Remove a doom counter from Lavabrink Floodgates.",
                effect: { kind: "remove-counter", target: "source", counter: "doom", amount: 1 },
              },
              { text: "Do neither.", effect: { kind: "sequence", effects: [] } },
            ],
          },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "doom", compare: { op: "gte", n: 3 } },
            then: {
              kind: "sacrifice-source",
              then: {
                kind: "reflexive-trigger",
                targets: [],
                effect: { kind: "damage-all", filter: { type: "creature" }, amount: 6 },
                text: "When you do, it deals 6 damage to each creature.",
              },
            },
          },
        ],
      },
      resolve: null,
      text: "At the beginning of each player's upkeep, that player may put a doom counter on this artifact or remove a doom counter from it. Then if it has three or more doom counters on it, sacrifice this artifact. When you do, it deals 6 damage to each creature.",
    },
  ],
});
