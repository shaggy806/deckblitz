import { defineCard } from "../define.js";

// EDHREC rank 13286.
//
// Rulings:
//   [2025-04-04] If an effect instructs you to “double” a creature’s power, that creature gets
//     +X/+0, where X is its power as that effect begins to apply. Similarly, a creature whose
//     toughness is doubled gets +0/+X, where X is its toughness as the effect begins to apply.
//
// Chapter III is Unnatural Growth's `double-pt-all`: each creature gets +X/+X
// of its own P/T as it resolves, the creatures fixed then (rule 611.2c).

const TOKEN_TEXT = "I, II — Create a 5/5 green Elephant creature token.";
const DOUBLE_TEXT = "III — Double the power and toughness of each creature you control until end of turn.";

export default defineCard({
  name: "Roar of Endless Song",
  manaCost: "{2}{G}{U}{R}",
  colors: ["U", "R", "G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${TOKEN_TEXT}\n${DOUBLE_TEXT}`,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: { kind: "create-token", token: "5/5 Elephant Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "double-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: DOUBLE_TEXT,
    },
  ],
});
