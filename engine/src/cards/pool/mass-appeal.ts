import { defineCard } from "../define.js";

// EDHREC rank 7232. The Humans are counted as it resolves (the ruling).
export default defineCard({
  name: "Mass Appeal",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw a card for each Human you control.",
  targets: [],
  effect: { kind: "draw", amount: { countOf: { subtype: "Human", controlledBy: "you" } } },
});
