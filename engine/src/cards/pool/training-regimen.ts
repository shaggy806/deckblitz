import { defineCard } from "../define.js";

// EDHREC rank 10654. Marvel Super Heroes.

const TRAMPLE_TEXT = "Creatures you control with +1/+1 counters on them have trample.";
const COMBAT_TEXT = "At the beginning of combat on your turn, put a +1/+1 counter on target creature you control.";

export default defineCard({
  name: "Training Regimen",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${TRAMPLE_TEXT}\n${COMBAT_TEXT}`,
  static: [
    {
      // Badgermole's shape.
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
