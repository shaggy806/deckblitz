import { defineCard } from "../define.js";

export default defineCard({
  name: "Maro",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  text: "Maro's power and toughness are each equal to the number of cards in your hand.",
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "cards-in-your-hand", plusPower: 0, plusToughness: 0 },
      text: "Maro's power and toughness are each equal to the number of cards in your hand.",
    },
  ],
});
