import { defineCard } from "../define.js";

// Future Sight (FUT). EDHREC rank 9780.

export default defineCard({
  name: "Foresee",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Scry 4, then draw two cards.",
  effect: { kind: "scry", amount: 4, then: { kind: "draw", amount: 2 } },
});
