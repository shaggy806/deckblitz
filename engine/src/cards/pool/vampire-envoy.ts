import { defineCard } from "../define.js";

const TEXT = "Whenever this creature becomes tapped, you gain 1 life.";

export default defineCard({
  name: "Vampire Envoy",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric", "Ally"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
