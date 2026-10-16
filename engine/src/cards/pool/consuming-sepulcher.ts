import { defineCard } from "../define.js";

const TEXT = "At the beginning of your upkeep, each opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Consuming Sepulcher",
  art: "https://cards.scryfall.io/art_crop/back/d/b/dbaa9a2d-e9fd-4746-a26c-f99ae731f024.jpg",
  colors: ["B"],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Tithing Blade", "Consuming Sepulcher"],
  transform: true,
});
