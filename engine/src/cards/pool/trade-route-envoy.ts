import { defineCard } from "../define.js";

// EDHREC rank 17628.
//
// "If you don't draw a card this way" reads what the draw did (`this-way`), so
// the counter also goes on when the condition held but the library was empty
// (rule 121.3: no card is drawn).
const TEXT =
  "When this creature enters, draw a card if you control a creature with a counter on it. If you don't draw a card this way, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Trade Route Envoy",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dog", "Soldier"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "conditional",
            condition: {
              kind: "controls",
              filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
              atLeast: 1,
            },
            then: { kind: "draw", amount: 1 },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "drawn", who: "you", atMost: 0 },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
