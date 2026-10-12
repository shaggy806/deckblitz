import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";

// Doubling puts on as many +1/+1 counters as it has (the ruling) — the same
// placement a counter doubler sees.
const COMBAT_TEXT = "At the beginning of combat on your turn, put a +1/+1 counter on target creature.";
const ATTACK_TEXT = "Whenever this creature attacks while saddled, double the number of +1/+1 counters on target creature.";

export default defineCard({
  name: "Ornery Tumblewagg",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Brushwagg", "Mount"],
  power: 2,
  toughness: 2,
  text: `${COMBAT_TEXT}\n${ATTACK_TEXT}\n${saddleText(2)}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: ["creature"],
      effect: { kind: "double-counters", target: 0, counter: "+1/+1" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(2, saddleText(2))],
});
