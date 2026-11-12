import { defineCard } from "../define.js";

// EDHREC rank 13961. Counted as the trigger resolves (Path of Bravery's shape).

export default defineCard({
  name: "Ancestor Dragon",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  text: "Flying\nWhenever one or more creatures you control attack, you gain 1 life for each attacking creature.",
  triggered: [
    {
      trigger: { on: "attacks-batch", who: "you" },
      targets: [],
      effect: { kind: "gain-life", amount: { countOf: { type: "creature", attacking: true } } },
      resolve: null,
      text: "Whenever one or more creatures you control attack, you gain 1 life for each attacking creature.",
    },
  ],
});
