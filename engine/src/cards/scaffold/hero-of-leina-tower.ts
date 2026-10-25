import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 26886.
//
// Rulings:
//   [2013-09-15] Heroic abilities will trigger only once per spell, even if that spell targets the
//     creature with the heroic ability multiple times.
//   [2013-09-15] Heroic abilities will resolve before the spell that caused them to trigger.
//   [2013-09-15] Heroic abilities won’t trigger when a copy of a spell is created on the stack or
//     when a spell’s targets are changed to include a creature with a heroic ability.
//   [2018-12-07] The amount to pay for {X} is chosen as the triggered ability resolves. No player
//     may take actions between the time you pay {X} and the time Hero of Leina Tower has X +1/+1
//     counters on it.

export default defineCard({
  name: "Hero of Leina Tower",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 1,
  text: "Heroic — Whenever you cast a spell that targets this creature, you may pay {X}. If you do, put X +1/+1 counters on this creature.",
  // TODO(scaffold): Heroic — Whenever you cast a spell that targets this creature, you may pay {X}. If you do, put X +1/+1 counters on this creature.
});
