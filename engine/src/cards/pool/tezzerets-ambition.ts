import { defineCard } from "../define.js";

// The artifact check is made after the draw, with nothing in between (the ruling).
export default defineCard({
  name: "Tezzeret's Ambition",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw three cards. If you control no artifacts, discard a card.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 } },
        then: { kind: "discard", target: "you", amount: 1 },
      },
    ],
  },
});
