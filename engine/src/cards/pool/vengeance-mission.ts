import { defineCard } from "../define.js";

const TEXT =
  "Whenever a creature dies, put a quest counter on this enchantment. Target opponent loses 1 life. That player loses 2 life instead if there are seven or more quest counters on this enchantment.";

export default defineCard({
  name: "Vengeance Mission",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
          {
            kind: "lose-life",
            target: 0,
            amount: {
              ifCondition: { kind: "self-counters", counter: "quest", compare: { op: "gte", n: 7 } },
              then: 2,
              else: 1,
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
