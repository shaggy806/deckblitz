import { defineCard } from "../define.js";

export default defineCard({
  name: "Rain of Embers",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Rain of Embers deals 1 damage to each creature and each player.",
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature" }, amount: 1 },
      { kind: "damage", amount: 1, who: "each-player" },
    ],
  },
});
