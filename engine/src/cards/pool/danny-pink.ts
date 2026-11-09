import { defineCard } from "../define.js";

const GRANT =
  "Creatures you control have \"Whenever one or more counters are put on this creature for the first time each turn, draw a card.\"";

// EDHREC rank 2701.
export default defineCard({
  name: "Danny Pink",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Advisor"],
  power: 4,
  toughness: 3,
  text: `Mentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)\n${GRANT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true, power: { op: "lt", n: { amount: { powerOf: "source" } } } } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Mentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "counters-put", who: "self", firstTimeEachTurn: true },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: "Whenever one or more counters are put on this creature for the first time each turn, draw a card.",
        },
      ],
      text: GRANT,
    },
  ],
});
