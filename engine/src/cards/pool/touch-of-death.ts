import { defineCard } from "../define.js";

export default defineCard({
  name: "Touch of Death",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Touch of Death deals 1 damage to target player or planeswalker. You gain 1 life.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: ["player-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 1, target: 0 },
      { kind: "gain-life", amount: 1 },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});
