import { defineCard } from "../define.js";

// EDHREC rank 11593.

export default defineCard({
  name: "Mysterious Egg",
  manaCost: "{1}",
  colors: [],
  types: ["creature"],
  subtypes: ["Egg"],
  power: 0,
  toughness: 2,
  text: "Whenever this creature mutates, put a +1/+1 counter on it.",
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever this creature mutates, put a +1/+1 counter on it.",
    },
  ],
});
