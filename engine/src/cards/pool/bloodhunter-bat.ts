import { defineCard } from "../define.js";

export default defineCard({
  name: "Bloodhunter Bat",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bat"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, target player loses 2 life and you gain 2 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 2, target: 0 }, { kind: "gain-life", amount: 2 }],
      },
      resolve: null,
      text: "When this creature enters, target player loses 2 life and you gain 2 life.",
    },
  ],
});
