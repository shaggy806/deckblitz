import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 18609.
//
// Rulings:
//   [2004-10-04] This can be used on damage to a creature, player, or planeswalker.
//   [2004-10-04] This can be used on instant or sorcery spells on the stack, but not on abilities.

export default defineCard({
  name: "Hidden Retreat",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Put a card from your hand on top of your library: Prevent all damage that would be dealt by target instant or sorcery spell this turn.",
  // TODO(scaffold): Put a card from your hand on top of your library: Prevent all damage that would be dealt by target instant or sorcery spell this turn.
});
