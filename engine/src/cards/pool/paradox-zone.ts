import { defineCard } from "../define.js";

// X is read off the enchantment as the token's counters
// go on — after the doubling, so the first end step makes a 2/2.
const ENTERS_TEXT = "This enchantment enters with a growth counter on it.";
const END_STEP_TEXT =
  "At the beginning of your end step, double the number of growth counters on this enchantment. Then create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it, where X is the number of growth counters on this enchantment.";

export default defineCard({
  name: "Paradox Zone",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${END_STEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "double-counters", target: "source", counter: "growth" },
          {
            kind: "create-token",
            token: "Fractal Token",
            count: 1,
            thenCounters: { kind: "+1/+1", amount: { countersOn: "source", counter: "growth" } },
          },
        ],
      },
      resolve: null,
      text: END_STEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "growth", amount: 1 } },
      text: ENTERS_TEXT,
    },
  ],
});
