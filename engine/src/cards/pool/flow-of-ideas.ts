import { defineCard } from "../define.js";

// EDHREC rank 9874.

export default defineCard({
  name: "Flow of Ideas",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw a card for each Island you control.",
  targets: [],
  effect: { kind: "draw", amount: { countOf: { subtype: "Island", controlledBy: "you" } } },
});
