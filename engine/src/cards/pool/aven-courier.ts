import { defineCard } from "../define.js";
import { CHOSEN_COUNTER } from "../../effects.js";

// EDHREC rank 8869.
//
// Rulings:
//   [2022-04-29] You choose the target permanent to put a counter on as you put the triggered
//     ability of Aven Courier on the stack. You choose the kind of counter from a permanent as
//     that ability resolves.

const TEXT =
  "Whenever this creature attacks, choose a counter on a permanent you control. Put a counter of that kind on target permanent you control if it doesn't have a counter of that kind on it.";

export default defineCard({
  name: "Aven Courier",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Advisor"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: {} }],
      effect: {
        kind: "choose-value",
        value: "counter-kind",
        among: { controlledBy: "you" },
        then: {
          kind: "conditional",
          condition: {
            kind: "not",
            of: { kind: "target", index: 0, filter: { counters: { kind: CHOSEN_COUNTER, compare: { op: "gte", n: 1 } } } },
          },
          then: { kind: "add-counter", target: 0, counter: CHOSEN_COUNTER, amount: 1 },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
