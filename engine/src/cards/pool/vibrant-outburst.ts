import { defineCard } from "../define.js";

// EDHREC rank 14861.

export default defineCard({
  name: "Vibrant Outburst",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Vibrant Outburst deals 3 damage to any target. Tap up to one target creature.",
  targets: ["any-target", { kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      { kind: "tap", target: 1 },
    ],
  },
});
