import { defineCard } from "../define.js";

// EDHREC rank 25194.
//
// Rulings:
//   [2022-12-08] The number of other spells cast this turn is determined as Storm Entity enters
//     the battlefield. It will count spells that were cast while Storm Entity was on the stack. It
//     will not count copies of spells that were created directly on the stack.
//
// Every player's spells cast this turn (the `spells-cast` turn stat counts
// casts, never copies put on the stack), less this one when it entered as a
// spell that was cast — put onto the battlefield any other way, it isn't
// among them.

const COUNTERS_TEXT = "This creature enters with a +1/+1 counter on it for each other spell cast this turn.";

export default defineCard({
  name: "Storm Entity",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${COUNTERS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            difference: [
              { turnStat: "spells-cast", who: "each-player" },
              { ifCondition: { kind: "source", filter: { cast: true } }, then: 1, else: 0 },
            ],
          },
        },
      },
      text: COUNTERS_TEXT,
    },
  ],
});
