import { defineCard } from "../define.js";

// EDHREC rank 26389.

export default defineCard({
  name: "Dromoka Captain",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["first-strike"],
  text: "First strike\nWhenever this creature attacks, bolster 1. (Choose a creature with the least toughness among creatures you control and put a +1/+1 counter on it.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "bolster", amount: 1 },
      resolve: null,
      text: "Whenever this creature attacks, bolster 1.",
    },
  ],
});
