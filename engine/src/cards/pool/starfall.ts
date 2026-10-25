import { defineCard } from "../define.js";

export default defineCard({
  name: "Starfall",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Starfall deals 3 damage to target creature. If that creature is an enchantment, Starfall deals 3 damage to that creature's controller.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "enchantment" } },
        then: { kind: "damage", amount: 3, toControllerOfTarget: 0 },
      },
    ],
  },
});
