import { defineCard } from "../define.js";

// EDHREC rank 18175. Zendikar Rising.
//
// The kicked counter is Shalai's Acolyte's enters replacement; the end-step
// return an intervening if on the counters it has (rule 603.4), checked again
// as it resolves.

const ENTER_TEXT = "If this creature was kicked, it enters with a +1/+1 counter on it.";
const END_TEXT =
  "At the beginning of your end step, if this creature doesn't have a +1/+1 counter on it, return it to its owner's hand.";

export default defineCard({
  name: "Shatterskull Charger",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 4,
  toughness: 3,
  keywords: ["trample", "haste"],
  text: `Kicker {2}\nTrample, haste\n${ENTER_TEXT}\n${END_TEXT}`,
  kicker: { cost: "{2}" },
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 1, else: 0 } },
      },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
