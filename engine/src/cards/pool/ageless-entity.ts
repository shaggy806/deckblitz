import { defineCard } from "../define.js";

// EDHREC rank 14739.

export default defineCard({
  name: "Ageless Entity",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: "Whenever you gain life, put that many +1/+1 counters on this creature.",
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
      resolve: null,
      text: "Whenever you gain life, put that many +1/+1 counters on this creature.",
    },
  ],
});
