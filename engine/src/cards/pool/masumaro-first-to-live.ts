import { defineCard } from "../define.js";

// A characteristic-defining ability (rule 604.3): twice the cards in its
// controller's hand (its owner's off the battlefield), the count added to
// itself (`sum`).

const PT_TEXT = "Masumaro's power and toughness are each equal to twice the number of cards in your hand.";

export default defineCard({
  name: "Masumaro, First to Live",
  manaCost: "{3}{G}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 0,
  text: PT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { sum: ["cards-in-your-hand", "cards-in-your-hand"] }, plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
  ],
});
