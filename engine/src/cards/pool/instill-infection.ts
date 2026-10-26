import { defineCard } from "../define.js";

// EDHREC rank 24061.

export default defineCard({
  name: "Instill Infection",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Put a -1/-1 counter on target creature.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      { kind: "draw", amount: 1 },
    ],
  },
});
