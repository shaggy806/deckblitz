import { defineCard } from "../define.js";

// EDHREC rank 32065.
//
// Rulings:
//   [2004-10-04] You may activate Lesser Werewolf's ability no matter what its power is. However,
//     if Lesser Werewolf's power is 0 or less at the time the ability resolves, the ability won't
//     do anything.
//
// The power is checked as it resolves (a `conditional` on the source); the
// target is a creature blocking it or blocked by it (`blockingRelation:
// "either"`).
const TEXT =
  "{B}: If this creature's power is 1 or more, it gets -1/-0 until end of turn and put a -0/-1 counter on target creature blocking or blocked by this creature. Activate only during the declare blockers step.";

export default defineCard({
  name: "Lesser Werewolf",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 2,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      condition: { kind: "turn-structure", steps: ["declare-blockers"] },
      targets: [{ kind: "permanent", filter: { type: "creature", blockingRelation: { relation: "either" } } }],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { power: { op: "gte", n: 1 } } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: "source", power: -1, toughness: 0, duration: "end-of-turn" },
            { kind: "add-counter", target: 0, counter: "-0/-1", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
