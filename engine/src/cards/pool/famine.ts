import { defineCard } from "../define.js";

export default defineCard({
  name: "Famine",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Famine deals 3 damage to each creature and each player.",
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature" }, amount: 3 },
      { kind: "damage", amount: 3, who: "each-player" },
    ],
  },
});
