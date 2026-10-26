import { defineCard } from "../define.js";

// EDHREC rank 27980.

const TEXT = "When this creature blocks, sacrifice it at end of combat.";

export default defineCard({
  name: "Stoic Ephemera",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 5,
  toughness: 5,
  keywords: ["defender", "flying"],
  text: `Defender (This creature can't attack.)\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "end-of-combat",
        effect: { kind: "sacrifice-target", target: "source" },
        text: "Sacrifice Stoic Ephemera.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
