import { defineCard } from "../define.js";

// EDHREC rank 15679.

export default defineCard({
  name: "Fangren Firstborn",
  manaCost: "{1}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 2,
  text: "Whenever this creature attacks, put a +1/+1 counter on each attacking creature.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-counter-all", filter: { type: "creature", attacking: true }, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever this creature attacks, put a +1/+1 counter on each attacking creature.",
    },
  ],
});
