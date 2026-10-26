import { defineCard } from "../define.js";

// Rulings:
//   [2007-10-01] You gain the life when Heal the Scars resolves, not when the creature actually
//     regenerates.

export default defineCard({
  name: "Heal the Scars",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Regenerate target creature. You gain life equal to that creature's toughness.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "regenerate", target: 0 },
      { kind: "gain-life", amount: { toughnessOf: 0 } },
    ],
  },
});
