import { defineCard } from "../define.js";

export default defineCard({
  name: "Char",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Char deals 4 damage to any target and 2 damage to you.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [{ kind: "damage", amount: 4, target: 0 }, { kind: "damage", amount: 2, who: "you" }],
  },
});
