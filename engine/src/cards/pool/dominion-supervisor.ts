import { defineCard } from "../define.js";

// EDHREC rank 28767.

const ENTER_TEXT = "When this creature enters, put a +1/+1 counter on target creature.";
const TRAMPLE_TEXT = "Creatures you control with counters on them have trample.";

export default defineCard({
  name: "Dominion Supervisor",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Vorta", "Doctor"],
  power: 3,
  toughness: 1,
  text: `${ENTER_TEXT}\n${TRAMPLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { compare: { op: "gte", n: 1 } } },
      },
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
});
