import { defineCard } from "../define.js";

// EDHREC rank 16998. Whether you control a Jace is checked as it resolves.

export default defineCard({
  name: "Jace's Triumph",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw two cards. If you control a Jace planeswalker, draw three cards instead.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Jace" }, atLeast: 1 },
    then: { kind: "draw", amount: 3 },
    else: { kind: "draw", amount: 2 },
  },
});
