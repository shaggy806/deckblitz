import { defineCard } from "../define.js";

// A blue Dog Illusion whose power and toughness are each twice the cards in
// its controller's hand (Mordenkainen's −2) — a characteristic-defining
// ability (rule 604.3), changing as the hand does (the ruling).
export default defineCard({
  name: "Dog Illusion Token",
  art: "ce3c0bd9-8a37-4164-9937-f35d1c210fe8",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dog", "Illusion"],
  power: 0,
  toughness: 0,
  text: "This creature's power and toughness are each equal to twice the number of cards in your hand.",
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { sum: ["cards-in-your-hand", "cards-in-your-hand"] }, plusPower: 0, plusToughness: 0 },
      text: "This creature's power and toughness are each equal to twice the number of cards in your hand.",
    },
  ],
});
