import { defineCard } from "../define.js";

export default defineCard({
  name: "Gravpack Monoist",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature dies, create a tapped 2/2 colorless Robot artifact creature token.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Robot Token", count: 1, tapped: true },
      resolve: null,
      text: "When this creature dies, create a tapped 2/2 colorless Robot artifact creature token.",
    },
  ],
});
