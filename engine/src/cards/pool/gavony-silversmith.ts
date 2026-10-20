import { defineCard } from "../define.js";

// EDHREC rank 23299. Rishkar's shape: two optional slots, the second another
// creature than the first.

export default defineCard({
  name: "Gavony Silversmith",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  text: "When this creature enters, put a +1/+1 counter on each of up to two target creatures.",
  triggered: [
    {
      resolve: null,
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      text: "When this creature enters, put a +1/+1 counter on each of up to two target creatures.",
    },
  ],
});
