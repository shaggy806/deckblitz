import { defineCard } from "../define.js";

export default defineCard({
  name: "Mystic Melting",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy target artifact or enchantment.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: ["artifact-or-enchantment"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});
