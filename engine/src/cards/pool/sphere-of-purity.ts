import { defineCard } from "../define.js";

export default defineCard({
  name: "Sphere of Purity",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "If an artifact would deal damage to you, prevent 1 of that damage.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "you", source: { type: "artifact" }, preventAmount: 1 },
      text: "If an artifact would deal damage to you, prevent 1 of that damage.",
    },
  ],
});
