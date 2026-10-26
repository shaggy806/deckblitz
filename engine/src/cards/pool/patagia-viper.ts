import { defineCard } from "../define.js";

// Dissension. "Unless {U} was spent" is checked as the trigger resolves; one
// put onto the battlefield without being cast had nothing spent, so it's
// sacrificed (the ruling).
const SAC_TEXT = "When this creature enters, sacrifice it unless {U} was spent to cast it.";

export default defineCard({
  name: "Patagia Viper",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\nWhen this creature enters, create two 1/1 green and blue Snake creature tokens.\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Snake Token (Patagia Viper)", count: 2 },
      resolve: null,
      text: "When this creature enters, create two 1/1 green and blue Snake creature tokens.",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "source", filter: { manaSpentOfColors: { U: 1 } } } },
        then: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
