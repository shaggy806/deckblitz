import { defineCard } from "../define.js";

// EDHREC rank 28329.
// Makes Bird → use "Bird Token".

export default defineCard({
  name: "Ornitharch",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Archon"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  tribute: 2,
  text: "Flying\nTribute 2 (As this creature enters, an opponent of your choice may put two +1/+1 counters on it.)\nWhen this creature enters, if tribute wasn't paid, create two 1/1 white Bird creature tokens with flying.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Bird Token", count: 2 },
      resolve: null,
      text: "When this creature enters, if tribute wasn't paid, create two 1/1 white Bird creature tokens with flying.",
      condition: { kind: "tribute-not-paid" },
    },
  ],
});
