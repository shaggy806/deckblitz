import { defineCard } from "../define.js";

// EDHREC rank 587.
//
// A `would-draw` "draw two instead" that passes by the first card you draw in each of your draw
// steps (`exceptFirstInDrawStep`): a draw in an opponent's draw step, or your second in your own,
// is doubled.

const DRAW_TEXT =
  "If you would draw a card except the first one you draw in each of your draw steps, draw two cards instead.";

export default defineCard({
  name: "Teferi's Ageless Insight",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: DRAW_TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-draw", who: "you", instead: { modify: { set: 2 } }, exceptFirstInDrawStep: true },
      text: DRAW_TEXT,
    },
  ],
});
