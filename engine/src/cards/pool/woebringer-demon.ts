import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). Eldrazi Monument's shape, for each player's upkeep.

export default defineCard({
  name: "Woebringer Demon",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of each player's upkeep, that player sacrifices a creature of their choice. If the player can't, sacrifice this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "active-player", filter: { type: "creature" }, count: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", atMost: 0 },
            then: { kind: "sacrifice-source" },
          },
        ],
      },
      resolve: null,
      text: "At the beginning of each player's upkeep, that player sacrifices a creature of their choice. If the player can't, sacrifice this creature.",
    },
  ],
});
