import { defineCard } from "../define.js";

// Ruling (2022-09-09): you may sacrifice Gibbering Barricade to its own ability.
const ABILITY_TEXT = "{2}{B}, Sacrifice a creature: You gain 1 life and draw a card.";

export default defineCard({
  name: "Gibbering Barricade",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Wall"],
  power: 2,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n${ABILITY_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
