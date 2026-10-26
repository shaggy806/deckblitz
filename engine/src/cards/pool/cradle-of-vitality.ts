import { defineCard } from "../define.js";

// EDHREC rank 12571.
//
// One trigger per life-gain event; the counters are the life that event
// gained (the trigger value), paid for once.

const TEXT =
  "Whenever you gain life, you may pay {1}{W}. If you do, put a +1/+1 counter on target creature for each 1 life you gained.";

export default defineCard({
  name: "Cradle of Vitality",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Pay {1}{W} to put a +1/+1 counter on the target creature for each 1 life you gained?",
        cost: "{1}{W}",
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { triggerValue: true } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
