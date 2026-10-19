import { defineCard } from "../define.js";

export default defineCard({
  name: "Colossal Badger",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Badger"],
  power: 6,
  toughness: 5,
  text: "When this creature enters, you gain 3 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "When this creature enters, you gain 3 life.",
    },
  ],
  faces: ["Colossal Badger", "Dig Deep"],
  adventure: true,
});
