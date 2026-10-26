import { defineCard } from "../define.js";

// EDHREC rank 23524.

const TEXT = "When this creature blocks a creature, destroy both creatures.";

export default defineCard({
  name: "Alaborn Zealot",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "destroy", target: "trigger-object" },
          { kind: "destroy", target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
