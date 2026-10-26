import { defineCard } from "../define.js";

// EDHREC rank 18187.

export default defineCard({
  name: "Sorcerous Sight",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Look at target opponent's hand.\nDraw a card.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "look-at-hand", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
