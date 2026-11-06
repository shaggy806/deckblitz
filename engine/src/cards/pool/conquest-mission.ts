import { defineCard } from "../define.js";

// EDHREC rank 23354.
// The count of quest counters is read after this trigger's own counter goes
// on, as the ability resolves.

const TRIGGER_TEXT =
  "Whenever a nontoken artifact you control enters, put a quest counter on this enchantment. Create a 1/1 colorless Borg artifact creature token. If this enchantment has six or more quest counters on it, create two of those tokens instead.";

export default defineCard({
  name: "Conquest Mission",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact", token: false } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "quest", compare: { op: "gte", n: 6 } },
            then: { kind: "create-token", token: "Borg Token", count: 2 },
            else: { kind: "create-token", token: "Borg Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
