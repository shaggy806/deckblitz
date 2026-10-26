import { defineCard } from "../define.js";

// EDHREC rank 24700.
//
// Rulings:
//   [2013-09-15] Heroic abilities won't trigger when a copy of a spell is created on the stack or
//     when a spell's targets are changed to include a creature with a heroic ability.
//   [2013-09-15] Heroic abilities will resolve before the spell that caused them to trigger.
//   [2013-09-15] Heroic abilities will trigger only once per spell, even if that spell targets the
//     creature with the heroic ability multiple times.
//   [2018-12-07] Resolving Arena Athlete's ability after a creature has blocked won't remove the
//     blocking creature from combat or cause the creature it blocked to become unblocked.

const TEXT =
  "Heroic — Whenever you cast a spell that targets this creature, target creature an opponent controls can't block this turn.";

export default defineCard({
  name: "Arena Athlete",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: TEXT,
    },
  ],
});
