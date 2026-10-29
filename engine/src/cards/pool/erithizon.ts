import { defineCard } from "../define.js";

// The defending player chooses the target as the ability is put on the stack
// — any creature, theirs or not (rules 603.3d, 700.2e's way).
const TEXT = "Whenever this creature attacks, put a +1/+1 counter on target creature of defending player's choice.";

export default defineCard({
  name: "Erithizon",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature"],
      targetsChosenBy: "trigger-player",
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
