import { defineCard } from "../define.js";

// EDHREC rank 17180.
const ENTER_TEXT = "When this creature enters, put a +1/+1 counter on each creature you control with a +1/+1 counter on it.";

export default defineCard({
  name: "Twisted Spider-Clone",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider", "Human"],
  power: 4,
  toughness: 4,
  text: ENTER_TEXT,
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
      text: ENTER_TEXT,
    },
  ],
});
