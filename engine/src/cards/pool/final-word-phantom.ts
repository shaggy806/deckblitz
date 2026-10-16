import { defineCard } from "../define.js";

// Its ruling: the last ability is about casting spells only — it doesn't let
// you activate a sorcery-speed ability then.

const TEXT = "During each opponent's end step, you may cast spells as though they had flash.";

export default defineCard({
  name: "Final-Word Phantom",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit", "Detective"],
  power: 1,
  toughness: 4,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      // An opponent's turn (every other player is one) and its end step.
      condition: {
        kind: "all",
        of: [
          { kind: "not", of: { kind: "your-turn" } },
          { kind: "turn-structure", steps: ["end"] },
        ],
      },
      castAsThoughFlash: true,
      text: TEXT,
    },
  ],
});
