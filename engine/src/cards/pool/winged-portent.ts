import { defineCard } from "../define.js";

// EDHREC rank 11265.

export default defineCard({
  name: "Winged Portent",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Cleave {4}{G}{U} (You may cast this spell for its cleave cost. If you do, remove the words in square brackets.)\nDraw a card for each creature you control [with flying].",
  targets: [],
  effect: {
    kind: "draw",
    amount: { countOf: { type: "creature", controlledBy: "you", keyword: "flying" } },
  },
  cleave: {
    cost: "{4}{G}{U}",
    targets: [],
    effect: { kind: "draw", amount: { countOf: { type: "creature", controlledBy: "you" } } },
  },
});
