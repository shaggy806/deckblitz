import { defineCard } from "../define.js";

export default defineCard({
  name: "Necrogen Scudder",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, you lose 3 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 3 },
      resolve: null,
      text: "When this creature enters, you lose 3 life.",
    },
  ],
});
