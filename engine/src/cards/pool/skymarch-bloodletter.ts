import { defineCard } from "../define.js";

export default defineCard({
  name: "Skymarch Bloodletter",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, target opponent loses 1 life and you gain 1 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 1, target: 0 }, { kind: "gain-life", amount: 1 }],
      },
      resolve: null,
      text: "When this creature enters, target opponent loses 1 life and you gain 1 life.",
    },
  ],
});
