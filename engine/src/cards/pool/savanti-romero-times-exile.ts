import { defineCard } from "../define.js";

// EDHREC rank 14151.
//
// Rulings:
//   [2026-01-27] Savanti Romero's last ability counts all counters on Savanti Romero, not just
//     +1/+1 counters.
//   [2026-01-27] The value of X is calculated only once, as Savanti Romero's last ability
//     resolves.

const COMBAT_TEXT =
  "At the beginning of combat on your turn, put a +1/+1 counter on Savanti Romero. Then you draw X cards and lose X life, where X is the number of counters on Savanti Romero.";

// X counts every counter of every kind (`countersOn` with no `counter`), read
// after the +1/+1 counter goes on; drawing doesn't change it, so the draw and
// the life loss see the same X.
export default defineCard({
  name: "Savanti Romero, Time's Exile",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon", "Wizard"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "draw", amount: { countersOn: "source" } },
          { kind: "lose-life", amount: { countersOn: "source" }, who: "you" },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
