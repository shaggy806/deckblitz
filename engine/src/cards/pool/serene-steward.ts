import { defineCard } from "../define.js";

// EDHREC rank 19621.
//
// Once per life-gaining event, however much (the rulings); the target is
// chosen as it triggers and the {W} paid as it resolves — Dawn of Hope's
// paid `may`.
const TEXT = "Whenever you gain life, you may pay {W}. If you do, put a +1/+1 counter on target creature.";

export default defineCard({
  name: "Serene Steward",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric", "Ally"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Pay {W} to put a +1/+1 counter on the target creature?",
        cost: "{W}",
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
