import { defineCard } from "../define.js";

// Commander 2016 (C16). EDHREC rank 10064.
//
// Both targets are chosen as the trigger goes on the stack; one gone illegal,
// the other still gets its counters (the rulings).
const TEXT =
  "At the beginning of your upkeep, put three +1/+1 counters on target creature you control and three +1/+1 counters on target creature an opponent controls.";

export default defineCard({
  name: "Evolutionary Escalation",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["creature-you-control", "creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 3 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
