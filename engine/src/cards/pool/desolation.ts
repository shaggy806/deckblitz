import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of each end step, each player who tapped a land for mana this turn sacrifices a land of their choice. This enchantment deals 2 damage to each player who sacrificed a Plains this way.";

export default defineCard({
  name: "Desolation",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-player",
            who: "each-player",
            whoIf: {
              kind: "of-player",
              player: "that-player",
              condition: { kind: "turn-stat", stat: "lands-tapped-for-mana", who: "you", atLeast: 1 },
            },
            effect: { kind: "sacrifice", who: "that-player", filter: { type: "land" }, count: 1 },
          },
          {
            kind: "damage",
            amount: 2,
            who: "each-player",
            whoseIf: { kind: "this-way", what: "sacrificed", who: "that-player", filter: { subtype: "Plains" } },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
