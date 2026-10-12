import { defineCard } from "../define.js";

export default defineCard({
  name: "Glistening Goremonger",
  art: "https://cards.scryfall.io/art_crop/back/0/e/0ee40c4b-2ca3-4cda-bc9e-451455c17adc.jpg",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Devil"],
  power: 3,
  toughness: 2,
  text: "When this creature dies, each opponent sacrifices an artifact or creature of their choice.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "each-opponent",
        filter: { typesAnyOf: ["artifact", "creature"] },
        count: 1,
      },
      resolve: null,
      text: "When this creature dies, each opponent sacrifices an artifact or creature of their choice.",
    },
  ],
  faces: ["Pyretic Prankster", "Glistening Goremonger"],
  transform: true,
});
