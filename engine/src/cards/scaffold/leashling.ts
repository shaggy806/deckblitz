import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 27673.

export default defineCard({
  name: "Leashling",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Dog"],
  power: 3,
  toughness: 3,
  text: "Put a card from your hand on top of your library: Return this creature to its owner's hand.",
  // TODO(scaffold): Put a card from your hand on top of your library: Return this creature to its owner's hand.
});
