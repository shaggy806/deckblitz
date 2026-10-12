import { defineCard } from "../define.js";

export default defineCard({
  name: "Devastate",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target land. Devastate deals 1 damage to each creature and each player.",
  targets: ["land"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: 1 },
          { kind: "damage", amount: 1, who: "each-player" },
        ],
      },
    ],
  },
});
