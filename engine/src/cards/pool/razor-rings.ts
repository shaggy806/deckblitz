import { defineCard } from "../define.js";

// EDHREC rank 15894. Avatar: The Last Airbender.

export default defineCard({
  name: "Razor Rings",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Razor Rings deals 4 damage to target attacking or blocking creature. You gain life equal to the excess damage dealt this way.",
  targets: ["attacking-or-blocking-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      { kind: "gain-life", amount: { excessDamageThisWay: true } },
    ],
  },
});
