import { defineCard } from "../define.js";

// EDHREC rank 31340.

const TEXT = "When this creature enters, you may have target opponent sacrifice a creature of their choice.";

export default defineCard({
  name: "Predatory Nightstalker",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightstalker"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "may",
        prompt: "Have the target opponent sacrifice a creature?",
        effect: { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
