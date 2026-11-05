import { defineCard } from "../define.js";

const TEXT = "Whenever this creature attacks, defending player loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Odious Witch",
  art: "https://cards.scryfall.io/art_crop/back/7/f/7fb728de-0d6e-4b32-b0c4-edd7382d1391.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", who: "trigger-player", amount: 1 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Ragged Recluse", "Odious Witch"],
  transform: true,
});
