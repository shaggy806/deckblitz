import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 26969.
// Makes Centaur → new token "3/3 Green Enchantment Centaur Token" (scaffolded).
//
// Rulings:
//   [2013-09-15] Scry appears on some spells and abilities with one or more targets. If all of the
//     spell or ability’s targets are illegal when it tries to resolve, it won’t resolve and none
//     of its effects will happen. You won’t scry.
//   [2013-09-15] When you scry, you may put all the cards you look at back on top of your library,
//     you may put all of those cards on the bottom of your library, or you may put some of those
//     cards on top and the rest of them on the bottom.
//   [2013-09-15] You perform the actions stated on a card in sequence. For some spells and
//     abilities, that means you’ll scry last. For others, that means you’ll scry and then perform
//     other actions.
//   [2013-09-15] You choose how to order cards returned to your library after scrying no matter
//     where you put them.

export default defineCard({
  name: "Fated Intervention",
  manaCost: "{2}{G}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Create two 3/3 green Centaur enchantment creature tokens. If it's your turn, scry 2.",
  // TODO(scaffold): If it's your turn, scry 2.
  // TODO(scaffold): (parsed "Create two 3/3 green Centaur enchantment creature tokens." as {"kind":"create-token","token":"3/3 Green Enchantment Centaur Token","count":2})
});
