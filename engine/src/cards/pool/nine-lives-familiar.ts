import { defineCard } from "../define.js";

// EDHREC rank 2341. "If you cast it" is the entering replacement's
// `ifCondition` over how it came (`cast`, `castBy: "you"`). "If it had a
// revival counter on it" reads the counters it died with (603.10a,
// `self-counters`), and "one fewer" is counted from them as well (608.2h):
// the delayed return reads the dead creature's last-known counters.
const TEXT =
  "This creature enters with eight revival counters on it if you cast it.\nWhen this creature dies, if it had a revival counter on it, return it to the battlefield with one fewer revival counter on it at the beginning of the next end step.";

export default defineCard({
  name: "Nine-Lives Familiar",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "revival",
          amount: { ifCondition: { kind: "source", filter: { cast: true, castBy: "you" } }, then: 8, else: 0 },
        },
      },
      text: "This creature enters with eight revival counters on it if you cast it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", counter: "revival", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "end" },
        text: "Return it to the battlefield with one fewer revival counter on it.",
        effect: {
          kind: "put-onto-battlefield",
          target: "trigger-object",
          withCounters: {
            kind: "revival",
            amount: { difference: [{ countersOn: "trigger-object", counter: "revival" }, 1] },
          },
        },
      },
      resolve: null,
      text: "When this creature dies, if it had a revival counter on it, return it to the battlefield with one fewer revival counter on it at the beginning of the next end step.",
    },
  ],
});
