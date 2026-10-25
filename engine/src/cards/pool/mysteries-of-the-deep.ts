import { defineCard } from "../define.js";

// Worldwake (WWK). EDHREC rank 22792.
//
// Landfall is checked as the spell resolves (the rulings), and three cards
// replace the two rather than adding to them.
export default defineCard({
  name: "Mysteries of the Deep",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw two cards.\nLandfall — If you had a land enter the battlefield under your control this turn, draw three cards instead.",
  effect: {
    kind: "conditional",
    condition: { kind: "turn-history", what: "entered", who: "you", filter: { type: "land" }, atLeast: 1 },
    then: { kind: "draw", amount: 3 },
    else: { kind: "draw", amount: 2 },
  },
});
