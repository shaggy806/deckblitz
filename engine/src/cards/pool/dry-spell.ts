import { defineCard } from "../define.js";

export default defineCard({
  name: "Dry Spell",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Dry Spell deals 1 damage to each creature and each player.",
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature" }, amount: 1 },
      { kind: "damage", amount: 1, who: "each-player" },
    ],
  },
});
