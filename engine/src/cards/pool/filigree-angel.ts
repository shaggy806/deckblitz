import { defineCard } from "../define.js";

// Counted as the trigger resolves, the Angel itself included (its ruling).
export default defineCard({
  name: "Filigree Angel",
  manaCost: "{5}{W}{W}{U}",
  colors: ["W", "U"],
  types: ["artifact", "creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, you gain 3 life for each artifact you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { countOf: { type: "artifact", controlledBy: "you" }, times: 3 } },
      resolve: null,
      text: "When this creature enters, you gain 3 life for each artifact you control.",
    },
  ],
});
