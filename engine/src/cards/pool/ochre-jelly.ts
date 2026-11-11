import { defineCard } from "../define.js";

// EDHREC rank 6738.
//
// Rulings:
//   For example, if Ochre Jelly had five +1/+1 counters on it when it dies, the token you create
//   will enter the battlefield with two +1/+1 counters on it. When that token dies, the next one
//   you create will enter with one +1/+1 counter on it.
//
// - "If it had two or more +1/+1 counters on it" and "half that many" both
//   read the Jelly as it last existed on the battlefield (rule 603.10a), the
//   second from the delayed ability, whose source is still that Jelly: a
//   token Jelly that has ceased to exist is read the same way.
// - The token copies the Jelly's printed values, so its own "enters with X"
//   gives it nothing (X is 0 off the stack): what it enters with is the
//   copy effect's `withCounters`.
const ENTERS_TEXT = "This creature enters with X +1/+1 counters on it.";
const SPLIT_TEXT =
  "Split — When this creature dies, if it had two or more +1/+1 counters on it, create a token that's a copy of it at the beginning of the next end step. The token enters with half that many +1/+1 counters on it, rounded down.";

export default defineCard({
  name: "Ochre Jelly",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\n${ENTERS_TEXT}\n${SPLIT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 2 } },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "end" },
        effect: {
          kind: "create-token-copy",
          of: "source",
          count: 1,
          who: "you",
          withCounters: { kind: "+1/+1", amount: { half: { countersOn: "source", counter: "+1/+1" }, round: "down" } },
        },
        text: "At the beginning of the next end step, create a token that's a copy of Ochre Jelly. The token enters with half that many +1/+1 counters on it, rounded down.",
      },
      resolve: null,
      text: SPLIT_TEXT,
    },
  ],
});
