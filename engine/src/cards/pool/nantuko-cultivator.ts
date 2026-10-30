import { defineCard } from "../define.js";

// EDHREC rank 14069.

const TEXT =
  "When this creature enters, you may discard any number of land cards. Put that many +1/+1 counters on this creature and draw that many cards.";

export default defineCard({
  name: "Nantuko Cultivator",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Druid"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // "Any number" already includes none, so the "may" needs no question
      // of its own.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 0, anyNumber: true, filter: { type: "land" } },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: { thisWay: "discarded" } },
          { kind: "draw", amount: { thisWay: "discarded" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
