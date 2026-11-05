import { defineCard } from "../define.js";

// EDHREC rank 27167.

export default defineCard({
  name: "Sengir Bats",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bat"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhenever a creature dealt damage by this creature this turn dies, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: { type: "creature", damagedThisTurnBy: { source: "this" } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever a creature dealt damage by this creature this turn dies, put a +1/+1 counter on this creature.",
    },
  ],
});
