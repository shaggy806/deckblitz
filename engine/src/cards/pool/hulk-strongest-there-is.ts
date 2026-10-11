import { defineCard } from "../define.js";

// EDHREC rank 15967.

const ENTER_TEXT = "Hulk enters with a +1/+1 counter on him.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, double the number of +1/+1 counters on each Gamma creature you control.";

export default defineCard({
  name: "Hulk, Strongest There Is",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gamma", "Berserker", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${ENTER_TEXT}\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "double-counters-all",
        filter: { type: "creature", subtype: "Gamma", controlledBy: "you" },
        counterKind: "+1/+1",
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
