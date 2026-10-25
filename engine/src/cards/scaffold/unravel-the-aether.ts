import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 15703.
//
// Rulings:
//   [2014-02-01] If the artifact or enchantment is a token, it will be shuffled into its owner’s
//     library when Unravel the Aether resolves, then will cease to exist. For practical purposes,
//     whatever item is representing the token should not actually be put into the library, though
//     the library is still shuffled.
//   [2014-02-01] If the artifact or enchantment is an illegal target as Unravel the Aether tries
//     to resolve, it won’t resolve and none of its effects will happen. No library will be
//     shuffled.

export default defineCard({
  name: "Unravel the Aether",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose target artifact or enchantment. Its owner shuffles it into their library.",
  // TODO(scaffold): Choose target artifact or enchantment.
  // TODO(scaffold): Its owner shuffles it into their library.
});
