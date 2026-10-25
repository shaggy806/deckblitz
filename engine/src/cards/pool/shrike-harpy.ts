import { defineCard } from "../define.js";

// EDHREC rank 29711.

export default defineCard({
  name: "Shrike Harpy",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Harpy"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  tribute: 2,
  text: "Flying\nTribute 2 (As this creature enters, an opponent of your choice may put two +1/+1 counters on it.)\nWhen this creature enters, if tribute wasn't paid, target opponent sacrifices a creature of their choice.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: "When this creature enters, if tribute wasn't paid, target opponent sacrifices a creature of their choice.",
      condition: { kind: "tribute-not-paid" },
    },
  ],
});
