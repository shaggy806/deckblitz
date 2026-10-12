import { defineCard } from "../define.js";

export default defineCard({
  name: "Vampire Sovereign",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Noble"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, target opponent loses 3 life and you gain 3 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 3, target: 0 }, { kind: "gain-life", amount: 3 }],
      },
      resolve: null,
      text: "When this creature enters, target opponent loses 3 life and you gain 3 life.",
    },
  ],
});
