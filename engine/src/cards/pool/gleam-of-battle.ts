import { defineCard } from "../define.js";

export default defineCard({
  name: "Gleam of Battle",
  manaCost: "{4}{R}{W}",
  colors: ["W", "R"],
  types: ["enchantment"],
  text: "Whenever a creature you control attacks, put a +1/+1 counter on it.",
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever a creature you control attacks, put a +1/+1 counter on it.",
    },
  ],
});
