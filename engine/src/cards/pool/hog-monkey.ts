import { defineCard } from "../define.js";

// EDHREC rank 21170.
//
// Rulings:
//   [2025-10-02] The creature you target must have a +1/+1 counter on it when the ability goes on
//     the stack at the beginning of combat. You cannot put the counter on it in response.
//   [2025-10-02] If an exhaust ability of a permanent is activated, and then that permanent leaves
//     the battlefield and returns to the battlefield, it becomes a new object so its exhaust
//     ability can be activated again.

const COMBAT_TEXT =
  "At the beginning of combat on your turn, target creature you control with a +1/+1 counter on it gains menace until end of turn.";
const EXHAUST_TEXT = "Exhaust — {5}: Put two +1/+1 counters on this creature.";

export default defineCard({
  name: "Hog-Monkey",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Boar", "Monkey"],
  power: 3,
  toughness: 2,
  text: `${COMBAT_TEXT} (It can't be blocked except by two or more creatures.)\n${EXHAUST_TEXT} (Activate each exhaust ability only once.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [
        {
          kind: "permanent",
          whose: "you",
          filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        },
      ],
      effect: { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      exhaust: true,
      text: EXHAUST_TEXT,
    },
  ],
});
