import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 30311.
//
// Rulings:
//   [2013-09-15] You perform the actions stated on a card in sequence. For some spells and
//     abilities, that means you’ll scry last. For others, that means you’ll scry and then perform
//     other actions.
//   [2013-09-15] When you scry, you may put all the cards you look at back on top of your library,
//     you may put all of those cards on the bottom of your library, or you may put some of those
//     cards on top and the rest of them on the bottom.
//   [2013-09-15] Heroic abilities will resolve before the spell that caused them to trigger.
//   [2013-09-15] Heroic abilities won’t trigger when a copy of a spell is created on the stack or
//     when a spell’s targets are changed to include a creature with a heroic ability.
//   [2013-09-15] Scry appears on some spells and abilities with one or more targets. If all of the
//     spell or ability’s targets are illegal when it tries to resolve, it won’t resolve and none
//     of its effects will happen. You won’t scry.
//   [2013-09-15] Heroic abilities will trigger only once per spell, even if that spell targets the
//     creature with the heroic ability multiple times.
//   [2013-09-15] You choose how to order cards returned to your library after scrying no matter
//     where you put them.

export default defineCard({
  name: "Chorus of the Tides",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Siren"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nHeroic — Whenever you cast a spell that targets this creature, scry 1. (To scry 1, look at the top card of your library, then you may put that card on the bottom.)",
  // TODO(scaffold): Heroic — Whenever you cast a spell that targets this creature, scry 1.
});
