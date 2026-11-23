import { defineCard } from "../define.js";

// A playtest card (Mystery Booster 2).

export default defineCard({
  name: "Stone Drake",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhen Stone Drake enters the battlefield, choose one —\n• Distract — Tap target land. Draw a card.\n• Enthrall — Target player discards a card for each spell you've cast this turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Distract — Tap target land. Draw a card.",
            targets: ["land"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "tap", target: 0 },
                { kind: "draw", amount: 1 },
              ],
            },
          },
          {
            text: "Enthrall — Target player discards a card for each spell you've cast this turn.",
            targets: ["player"],
            effect: { kind: "discard", target: 0, amount: { turnStat: "spells-cast" } },
          },
        ],
      },
      resolve: null,
      text: "When Stone Drake enters the battlefield, choose one —\n• Distract — Tap target land. Draw a card.\n• Enthrall — Target player discards a card for each spell you've cast this turn.",
    },
  ],
});
