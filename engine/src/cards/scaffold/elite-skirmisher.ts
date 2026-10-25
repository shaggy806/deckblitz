import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 27350.
//
// Rulings:
//   [2013-09-15] Heroic abilities will trigger only once per spell, even if that spell targets the
//     creature with the heroic ability multiple times.
//   [2013-09-15] Heroic abilities won't trigger when a copy of a spell is created on the stack or
//     when a spell's targets are changed to include a creature with a heroic ability.
//   [2013-09-15] Heroic abilities will resolve before the spell that caused them to trigger.

export default defineCard({
  name: "Elite Skirmisher",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 1,
  text: "Heroic — Whenever you cast a spell that targets this creature, you may tap target creature.",
  // TODO(scaffold): Heroic — Whenever you cast a spell that targets this creature, you may tap target creature.
});
