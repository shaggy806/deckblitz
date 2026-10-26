import { defineCard } from "../define.js";

// EDHREC rank 26635.
//
// Rulings:
//   [2013-09-15] Heroic abilities won't trigger when a copy of a spell is created on the stack or
//     when a spell's targets are changed to include a creature with a heroic ability.
//   [2013-09-15] Wavecrash Triton's ability tracks the creature, but not its controller. If the
//     creature changes controllers before its first controller's next untap step has come around,
//     then it won't untap during its new controller's next untap step.
//   [2013-09-15] Heroic abilities will trigger only once per spell, even if that spell targets the
//     creature with the heroic ability multiple times.
//   [2013-09-15] Heroic abilities will resolve before the spell that caused them to trigger.
//   [2013-09-15] Wavecrash Triton's ability can target a creature that's already tapped. That
//     creature still won't untap during its controller's next untap step.

const TEXT =
  "Heroic — Whenever you cast a spell that targets this creature, tap target creature an opponent controls. That creature doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Wavecrash Triton",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
