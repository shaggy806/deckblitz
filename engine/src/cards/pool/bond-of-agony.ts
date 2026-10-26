import { defineCard } from "../define.js";

// Dissension. EDHREC rank 15255.
//
// Rulings:
//   [2006-05-01] You can't choose an X that's greater than your life total.
//   [2013-04-15] You must pay both X life and {X}{B}.
//
// "Each other player" is each opponent: every other player is one.

export default defineCard({
  name: "Bond of Agony",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, pay X life.\nEach other player loses X life.",
  targets: [],
  effect: { kind: "lose-life", amount: "x", who: "each-opponent" },
  additionalCost: { payLifeX: true },
});
