import { defineCard } from "../define.js";

// EDHREC rank 19695.

export default defineCard({
  name: "Healing Hands",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Target player gains 4 life.\nDraw a card.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: 4, toControllerOfTarget: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
