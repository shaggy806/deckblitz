import { defineCard } from "../define.js";

// Worldwake. Its controller's life total, read live and unclamped (rule
// 107.1b): the lower the life, the bigger the Shadow.

const SHRINK = "This creature gets -X/-X, where X is your life total.";

export default defineCard({
  name: "Death's Shadow",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 13,
  toughness: 13,
  text: SHRINK,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { lifeTotal: true, pt: [-1, -1] },
      text: SHRINK,
    },
  ],
});
