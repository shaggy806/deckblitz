import { defineCard } from "../define.js";

// EDHREC rank 26909.
//
// Rulings:
//   Does not undo any abilities which triggered due to the declaration of blockers.
//   The new blocker does not trigger any abilities which trigger on creatures becoming blockers:
//     the creatures were already blockers, and only who's blocking changes.

const TEXT =
  "{T}: Choose two target blocked attacking creatures. If each of those creatures could be blocked by all creatures that the other is blocked by, each creature that's blocking exactly one of those attacking creatures stops blocking it and is blocking the other attacking creature. Activate only during the declare blockers step.";

const BLOCKED = { kind: "permanent", filter: { type: "creature", attacking: true, blocked: true } } as const;

export default defineCard({
  name: "General Jarkeld",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [BLOCKED, { kind: "other", of: BLOCKED, than: { slot: 0 } }],
      effect: { kind: "swap-blocks", between: "attackers", first: 0, second: 1 },
      condition: { kind: "turn-structure", steps: ["declare-blockers"] },
      resolve: null,
      text: TEXT,
    },
  ],
});
