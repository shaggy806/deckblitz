import { defineCard } from "../define.js";

// EDHREC rank 28397.

const TEXT =
  "When this creature enters, discard any number of creature cards. For each card discarded this way, put two +1/+1 counters on this creature.";

export default defineCard({
  name: "Mind Maggots",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 0, anyNumber: true, filter: { type: "creature" } },
          {
            kind: "add-counter",
            target: "source",
            counter: "+1/+1",
            amount: { product: [{ thisWay: "discarded" }, 2] },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
