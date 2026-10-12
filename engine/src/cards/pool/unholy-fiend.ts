import { defineCard } from "../define.js";

export default defineCard({
  name: "Unholy Fiend",
  art: "https://cards.scryfall.io/art_crop/back/f/8/f8b8f0b4-71e1-4822-99a1-b1b3c2f10cb2.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 3,
  text: "At the beginning of your end step, you lose 1 life.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "lose-life", amount: 1 },
      resolve: null,
      text: "At the beginning of your end step, you lose 1 life.",
    },
  ],
  faces: ["Cloistered Youth", "Unholy Fiend"],
  transform: true,
});
