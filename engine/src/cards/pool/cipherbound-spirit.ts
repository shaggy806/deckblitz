import { defineCard } from "../define.js";

// Soulcipher Board's back face.

export default defineCard({
  name: "Cipherbound Spirit",
  art: "https://cards.scryfall.io/art_crop/back/7/3/73e7ed48-8f7b-4bdf-bade-a09597ceafcd.jpg",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nThis creature can block only creatures with flying.\n{3}{U}: Draw two cards, then discard a card.",
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: "{3}{U}: Draw two cards, then discard a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { keyword: "flying" },
      text: "This creature can block only creatures with flying.",
    },
  ],
  faces: ["Soulcipher Board", "Cipherbound Spirit"],
  transform: true,
});
