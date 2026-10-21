import { defineCard } from "../define.js";

// EDHREC rank 14536. "Each other player" is each opponent in a free-for-all.

export default defineCard({
  name: "Syphon Soul",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Syphon Soul deals 2 damage to each other player. You gain life equal to the damage dealt this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, who: "each-opponent" },
      { kind: "gain-life", amount: { damageDealtThisWay: true } },
    ],
  },
});
