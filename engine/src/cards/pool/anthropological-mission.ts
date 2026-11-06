import { defineCard } from "../define.js";

// EDHREC rank 27756.
// The count of quest counters is read after this trigger's own counter goes
// on, as the ability resolves.

const TRIGGER_TEXT =
  "Whenever you cast a noncreature spell, put a quest counter on this enchantment. Draw a card. Then discard a card unless this enchantment has three or more quest counters on it.";

export default defineCard({
  name: "Anthropological Mission",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: {
              kind: "not",
              of: { kind: "self-counters", counter: "quest", compare: { op: "gte", n: 3 } },
            },
            then: { kind: "discard", target: "you", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
