import { defineCard } from "../define.js";

export default defineCard({
  name: "Steam Blast",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Steam Blast deals 2 damage to each creature and each player.",
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature" }, amount: 2 },
      { kind: "damage", amount: 2, who: "each-player" },
    ],
  },
});
