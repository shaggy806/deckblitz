import { defineCard } from "../define.js";

export default defineCard({
  name: "Orcish Cannonade",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Orcish Cannonade deals 2 damage to any target and 3 damage to you.\nDraw a card.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [{ kind: "damage", amount: 2, target: 0 }, { kind: "damage", amount: 3, who: "you" }],
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
