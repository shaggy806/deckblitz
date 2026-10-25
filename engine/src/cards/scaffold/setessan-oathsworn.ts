import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 23903.
//
// Rulings:
//   [2013-09-15] Heroic abilities will resolve before the spell that caused them to trigger.
//   [2013-09-15] Heroic abilities won’t trigger when a copy of a spell is created on the stack or
//     when a spell’s targets are changed to include a creature with a heroic ability.
//   [2013-09-15] Heroic abilities will trigger only once per spell, even if that spell targets the
//     creature with the heroic ability multiple times.

export default defineCard({
  name: "Setessan Oathsworn",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Satyr", "Warrior"],
  power: 1,
  toughness: 1,
  text: "Heroic — Whenever you cast a spell that targets this creature, put two +1/+1 counters on this creature.",
  // TODO(scaffold): Heroic — Whenever you cast a spell that targets this creature, put two +1/+1 counters on this creature.
});
