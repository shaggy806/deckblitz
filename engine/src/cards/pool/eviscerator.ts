import { defineCard } from "../define.js";

export default defineCard({
  name: "Eviscerator",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 5,
  toughness: 5,
  text: "Protection from white\nWhen this creature enters, you lose 5 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 5 },
      resolve: null,
      text: "When this creature enters, you lose 5 life.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W"] },
      text: "Protection from white",
    },
  ],
});
