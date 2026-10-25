import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 10893.
//
// Rulings:
//   [2013-09-15] You choose how to order cards returned to your library after scrying no matter
//     where you put them.
//   [2013-09-15] Scry appears on some spells and abilities with one or more targets. If all of the
//     spell or ability’s targets are illegal when it tries to resolve, it won’t resolve and none
//     of its effects will happen. You won’t scry.
//   [2013-09-15] When you scry, you may put all the cards you look at back on top of your library,
//     you may put all of those cards on the bottom of your library, or you may put some of those
//     cards on top and the rest of them on the bottom.
//   [2013-09-15] You perform the actions stated on a card in sequence. For some spells and
//     abilities, that means you’ll scry last. For others, that means you’ll scry and then perform
//     other actions.
//   [2014-02-01] The effect that causes the creature to gain indestructible doesn’t have a
//     duration. It lasts until the creature leaves the battlefield.
//   [2014-02-01] The indestructible granted by Fated Return isn’t part of the creature’s copiable
//     values. If the creature is copied, the copy won’t have indestructible (unless the creature
//     otherwise has indestructible).

export default defineCard({
  name: "Fated Return",
  manaCost: "{4}{B}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Put target creature card from a graveyard onto the battlefield under your control. It gains indestructible. If it's your turn, scry 2.",
  // TODO(scaffold): Put target creature card from a graveyard onto the battlefield under your control.
  // TODO(scaffold): It gains indestructible.
  // TODO(scaffold): If it's your turn, scry 2.
});
