import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 26671.

const TEXT = "When this creature blocks, destroy it at end of combat.";

export default defineCard({
  name: "Cinder Wall",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 3,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "end-of-combat",
        effect: { kind: "destroy", target: "source" },
        text: "At end of combat, destroy this creature.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
