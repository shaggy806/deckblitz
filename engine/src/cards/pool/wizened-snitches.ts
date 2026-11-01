import { defineCard } from "../define.js";

// EDHREC rank 14815.
//
// Rulings:
//   The top card of your library isn't in your hand, so you can't suspend it, cycle it, discard it,
//     or activate any of its activated abilities.
//   If the top card of your library changes while you're casting a spell, playing a land, or
//     activating an ability, the new top card won't be revealed until you finish doing so.
//   When playing with the top card of your library revealed, if an effect tells you to draw several
//     cards, reveal each one before you draw it.

const TEXT = "Players play with the top card of their libraries revealed.";

export default defineCard({
  name: "Wizened Snitches",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [{ affects: { scope: "self" }, visibility: { libraryTopRevealed: "each-player" }, text: TEXT }],
});
