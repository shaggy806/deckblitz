import { defineCard } from "../define.js";

export default defineCard({
  name: "Archway Angel",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, you gain 2 life for each Gate you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { countOf: { subtype: "Gate", controlledBy: "you" }, times: 2 } },
      resolve: null,
      text: "When this creature enters, you gain 2 life for each Gate you control.",
    },
  ],
});
