import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 26542.
//
// Rulings:
//   [2013-09-15] You choose how to order cards returned to your library after scrying no matter
//     where you put them.
//   [2013-09-15] Scry appears on some spells and abilities with one or more targets. If all of the
//     spell or ability’s targets are illegal when it tries to resolve, it won’t resolve and none
//     of its effects will happen. You won’t scry.
//   [2013-09-15] You perform the actions stated on a card in sequence. For some spells and
//     abilities, that means you’ll scry last. For others, that means you’ll scry and then perform
//     other actions.
//   [2013-09-15] When you scry, you may put all the cards you look at back on top of your library,
//     you may put all of those cards on the bottom of your library, or you may put some of those
//     cards on top and the rest of them on the bottom.
//   [2014-02-01] If a creature affected by Sudden Storm changes controllers before its old
//     controller’s next untap step, Sudden Storm will prevent it from becoming untapped during its
//     new controller’s next untap step.
//   [2014-02-01] If you chose two targets and one is an illegal target when Sudden Storm resolves,
//     that creature won’t become tapped and it won’t be stopped from untapping during its
//     controller’s next untap step. It won’t be affected by Sudden Storm in any way.
//   [2014-02-01] This spell can target tapped creatures. If a targeted creature is already tapped
//     when the spell resolves, that creature remains tapped and doesn’t untap during its
//     controller’s next untap step.
//   [2014-02-01] If you choose zero targets, you’ll just scry 1 when the ability resolves.
//     However, if you choose at least one target and all of Sudden Storm’s targets are illegal as
//     it tries to resolve, the spell won’t resolve and none of its effects will happen. You won’t
//     scry in that case.

export default defineCard({
  name: "Sudden Storm",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap up to two target creatures. Those creatures don't untap during their controllers' next untap steps. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  // TODO(scaffold): Tap up to two target creatures.
  // TODO(scaffold): Those creatures don't untap during their controllers' next untap steps.
  // TODO(scaffold): (parsed "Scry 1." as {"kind":"scry","amount":1})
});
