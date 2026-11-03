import { defineCard } from "../define.js";

// Ruling: a creature put onto the battlefield attacking didn't "attack" and won't be counted.

const TEXT = "When you attack with exactly two creatures, transform this creature.";

export default defineCard({
  name: "Alluring Suitor",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", exactly: 2 },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Alluring Suitor", "Deadly Dancer"],
  transform: true,
});
