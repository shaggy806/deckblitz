import { defineCard } from "../define.js";

// EDHREC rank 7480.
//
// - The draw: a `would-draw` "draw two instead" passing by your draw step's first card
//   (`exceptFirstInDrawStep`), multiplying with any other such replacement.
// - The tokens: Adrix and Nev's `would-create-token` multiplier, scoped to tokens created under
//   your control.

const DRAW_TEXT =
  "If you would draw a card except the first one you draw in each of your draw steps, draw two cards instead.";
const TOKEN_TEXT =
  "If one or more tokens would be created under your control, twice that many of those tokens are created instead.";

export default defineCard({
  name: "Bard, King of Dale",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Archer"],
  power: 3,
  toughness: 5,
  keywords: ["reach", "vigilance"],
  text: `Reach, vigilance\n${DRAW_TEXT}\n${TOKEN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-draw", who: "you", instead: { draws: 2 }, exceptFirstInDrawStep: true },
      text: DRAW_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-create-token", multiplier: 2 },
      text: TOKEN_TEXT,
    },
  ],
});
