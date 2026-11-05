import { defineCard } from "../define.js";

// EDHREC rank 27912.

export default defineCard({
  name: "Saheeli's Silverwing",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, look at the top card of target opponent's library.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "look-at-library-top", target: 0 },
      resolve: null,
      text: "When this creature enters, look at the top card of target opponent's library.",
    },
  ],
});
