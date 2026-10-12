import { defineCard } from "../define.js";

export default defineCard({
  name: "Flare",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Flare deals 1 damage to any target.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 1, target: 0 },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});
