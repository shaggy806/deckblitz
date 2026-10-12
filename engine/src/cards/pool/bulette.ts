import { defineCard } from "../define.js";

export default defineCard({
  name: "Bulette",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  text: "At the beginning of your end step, if a creature died this turn, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "At the beginning of your end step, if a creature died this turn, put a +1/+1 counter on this creature.",
      condition: { kind: "creature-died-this-turn" },
    },
  ],
});
