import { defineCard } from "../define.js";

const TEXT = "Whenever you cast your first spell during each opponent's turn, you may tap or untap target nonland permanent.";

export default defineCard({
  name: "Stinging Lionfish",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Fish"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", firstEachTurn: true },
      condition: { kind: "not", of: { kind: "your-turn" } },
      targets: ["nonland-permanent"],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap target nonland permanent.", effect: { kind: "tap", target: 0 } },
          { text: "Untap target nonland permanent.", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
