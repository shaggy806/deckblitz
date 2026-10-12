import { defineCard } from "../define.js";

export default defineCard({
  name: "Fire Tempest",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Fire Tempest deals 6 damage to each creature and each player.",
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature" }, amount: 6 },
      { kind: "damage", amount: 6, who: "each-player" },
    ],
  },
});
