import { defineCard } from "../define.js";

const ENTER_TEXT = "Whenever a creature you control enters, scry 1 and put a plan counter on this enchantment.";
const PLAN_TEXT =
  "When the fourth plan counter is put on this enchantment, sacrifice it, draw a card, and put a +1/+1 counter on each creature you control.";

export default defineCard({
  name: "Political Triumph",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Plan"],
  text: `${ENTER_TEXT}\n${PLAN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "scry", amount: 1 },
          { kind: "add-counter", target: "source", counter: "plan", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      // "Sacrifice it, draw …, and put …": each happens, sacrificed or not.
      trigger: { on: "counters-put", who: "self", counter: "plan", nth: 4 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-source" },
          { kind: "draw", amount: 1 },
          { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: PLAN_TEXT,
    },
  ],
});
