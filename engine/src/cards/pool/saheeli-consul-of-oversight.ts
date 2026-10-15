import { defineCard } from "../define.js";

// EDHREC rank 21778.
// Makes Thopter → use "Thopter Token".

export default defineCard({
  name: "Saheeli, Consul of Oversight",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhenever you scry or surveil, create a 1/1 colorless Thopter artifact creature token with flying. This ability triggers only once each turn.",
  triggered: [
    {
      trigger: { on: "scries", who: "you", orSurveil: true },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "create-token", token: "Thopter Token", count: 1 },
      resolve: null,
      text: "Whenever you scry or surveil, create a 1/1 colorless Thopter artifact creature token with flying. This ability triggers only once each turn.",
    },
  ],
});
