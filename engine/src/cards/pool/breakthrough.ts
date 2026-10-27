import { defineCard } from "../define.js";

// Torment. EDHREC rank 10076.
//
// "Choose X cards in your hand and discard the rest" is discarding all but X
// of them, your choice of which: a discard of (hand size − X), never below 0
// (rule 107.1b), counted after the four draws.

export default defineCard({
  name: "Breakthrough",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw four cards, then choose X cards in your hand and discard the rest.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 4 },
      { kind: "discard", target: "you", amount: { difference: [{ cardsInHand: "you" }, "x"] } },
    ],
  },
});
