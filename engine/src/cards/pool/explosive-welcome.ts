import { defineCard } from "../define.js";

export default defineCard({
  name: "Explosive Welcome",
  manaCost: "{7}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Explosive Welcome deals 5 damage to any target and 3 damage to any other target. Add {R}{R}{R}.",
  targets: ["any-target", { kind: "other", of: "any-target", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 5, target: 0 },
          { kind: "damage", amount: 3, target: 1 },
        ],
      },
      { kind: "add-mana", mana: "R", amount: 3 },
    ],
  },
});
