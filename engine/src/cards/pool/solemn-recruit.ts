import { defineCard } from "../define.js";

// EDHREC rank 16056.

export default defineCard({
  name: "Solemn Recruit",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  text: "Double strike\nRevolt — At the beginning of your end step, if a permanent left the battlefield under your control this turn, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Revolt — At the beginning of your end step, if a permanent left the battlefield under your control this turn, put a +1/+1 counter on this creature.",
      condition: { kind: "turn-history", what: "left" },
    },
  ],
});
