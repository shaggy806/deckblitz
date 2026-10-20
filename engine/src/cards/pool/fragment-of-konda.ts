import { defineCard } from "../define.js";

// Back face of The Fall of Lord Konda.

export default defineCard({
  name: "Fragment of Konda",
  art: "https://cards.scryfall.io/art_crop/back/4/d/4d784409-df6d-45d4-8f8b-6e3fd57a8fde.jpg",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Noble"],
  power: 1,
  toughness: 3,
  keywords: ["defender"],
  text: "Defender\nWhen this creature dies, draw a card.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this creature dies, draw a card.",
    },
  ],
  faces: ["The Fall of Lord Konda", "Fragment of Konda"],
  transform: true,
});
