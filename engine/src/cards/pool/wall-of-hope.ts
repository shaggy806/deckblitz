import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 13504.

const TEXT = "Whenever this creature is dealt damage, you gain that much life.";

export default defineCard({
  name: "Wall of Hope",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
