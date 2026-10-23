import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 23462.
//
// Whether you control an artifact is read after the draw, with no window to
// play one in between (ruling).
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
