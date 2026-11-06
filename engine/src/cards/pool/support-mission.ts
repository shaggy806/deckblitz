import { defineCard } from "../define.js";

// EDHREC rank 29804.

const TEXT =
  "Whenever a creature you control enters, put a quest counter on this enchantment. Put a +1/+1 counter on that creature. If this enchantment has five or more quest counters on it, instead put two +1/+1 counters on that creature.";

// The quest counters are counted as the ability resolves, after its own.
export default defineCard({
  name: "Support Mission",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "quest", compare: { op: "gte", n: 5 } },
            then: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 2 },
            else: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
