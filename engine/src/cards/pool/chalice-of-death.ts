import { defineCard } from "../define.js";

export default defineCard({
  name: "Chalice of Death",
  art: "https://cards.scryfall.io/art_crop/back/e/4/e432b156-baf0-48a1-b8fb-1aa18bfbf7de.jpg",
  colors: [],
  types: ["artifact"],
  text: "{T}: Target player loses 5 life.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player"],
      effect: { kind: "lose-life", amount: 5, target: 0 },
      resolve: null,
      text: "{T}: Target player loses 5 life.",
    },
  ],
  faces: ["Chalice of Life", "Chalice of Death"],
  transform: true,
});
