import { defineCard } from "../define.js";

// EDHREC rank 15134.

export default defineCard({
  name: "Patron of the Valiant",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, put a +1/+1 counter on each creature you control with a +1/+1 counter on it.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: "When this creature enters, put a +1/+1 counter on each creature you control with a +1/+1 counter on it.",
    },
  ],
});
