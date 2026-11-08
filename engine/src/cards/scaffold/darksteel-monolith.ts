import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 2371.
//
// Rulings:
//   [2023-07-28] If you cast a card for an alternative cost of {0}, you can't pay any other
//     alternative costs. You can, however, pay additional costs like kicker. If the card has any
//     mandatory additional costs, you must pay those.
//   [2023-07-28] You must still follow any relevant timing rules for the colorless spell you cast
//     from your hand.

export default defineCard({
  name: "Darksteel Monolith",
  manaCost: "{8}",
  colors: [],
  types: ["artifact"],
  keywords: ["indestructible"],
  text: "Indestructible\nOnce each turn, you may pay {0} rather than pay the mana cost for a colorless spell you cast from your hand.",
  // TODO(scaffold): Once each turn, you may pay {0} rather than pay the mana cost for a colorless spell you cast from your hand.
});
