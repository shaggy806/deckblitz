import { defineCard } from "../define.js";

// Conflux (CON). EDHREC rank 10525.
//
// Rulings: the X chosen, not the mana spent, is read; X = 4 enters with four
// counters, X = 5 with ten.
//
// "X, plus another X if X is 5 or more" as one amount: an enters replacement
// can't ask a `{ kind: "x" }` condition (no X reaches `staticConditionMet`
// there), so the "5 or more" is the step (X − 4) − (X − 5), each difference
// floored at 0 (rule 107.1b): 0 for X ≤ 4, 1 for X ≥ 5. X itself is read
// everywhere in an own "enters with" amount (`enteringCounterAmount`).
const STEP = { difference: [{ difference: ["x", 4] }, { difference: ["x", 5] }] } as const;
const ENTER_TEXT =
  "This creature enters with X +1/+1 counters on it. If X is 5 or more, it enters with an additional X +1/+1 counters on it.";
const PING_TEXT = "{1}{R}, Remove a +1/+1 counter from this creature: It deals 1 damage to any target.";

export default defineCard({
  name: "Apocalypse Hydra",
  manaCost: "{X}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${PING_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { sum: ["x", { product: ["x", STEP] }] } },
      },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});
