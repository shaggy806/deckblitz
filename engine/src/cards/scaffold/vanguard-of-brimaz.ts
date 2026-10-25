import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 16340.
// Makes Cat Soldier → new token "Cat Soldier Token (Vigilance)" (scaffolded).
//
// Rulings:
//   [2013-09-15] Heroic abilities will resolve before the spell that caused them to trigger.
//   [2013-09-15] Heroic abilities won’t trigger when a copy of a spell is created on the stack or
//     when a spell’s targets are changed to include a creature with a heroic ability.
//   [2013-09-15] Heroic abilities will trigger only once per spell, even if that spell targets the
//     creature with the heroic ability multiple times.

export default defineCard({
  name: "Vanguard of Brimaz",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: "Vigilance\nHeroic — Whenever you cast a spell that targets this creature, create a 1/1 white Cat Soldier creature token with vigilance.",
  // TODO(scaffold): Heroic — Whenever you cast a spell that targets this creature, create a 1/1 white Cat Soldier creature token with vigilance.
});
