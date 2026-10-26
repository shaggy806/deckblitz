import { defineCard } from "../define.js";

export default defineCard({
  name: "Tobita, Master of Winds",
  art: "https://cards.scryfall.io/art_crop/front/9/d/9de1eebf-5725-438c-bcf0-f3a4d8a89fb0.jpg",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: "Creatures you control have flying.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantKeywords: ["flying"],
      text: "Creatures you control have flying.",
    },
  ],
  faces: ["Student of Elements", "Tobita, Master of Winds"],
  flip: true,
});
