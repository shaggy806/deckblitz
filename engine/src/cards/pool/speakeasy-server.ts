import { defineCard } from "../define.js";

export default defineCard({
  name: "Speakeasy Server",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Citizen"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, you gain 1 life for each other creature you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Counted as it resolves (rule 608.2h).
      effect: { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" }, excludeSelf: true } },
      resolve: null,
      text: "When this creature enters, you gain 1 life for each other creature you control.",
    },
  ],
});
