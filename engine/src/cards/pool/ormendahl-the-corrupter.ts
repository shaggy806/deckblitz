import { defineCard } from "../define.js";

export default defineCard({
  name: "Ormendahl, the Corrupter",
  art: "https://cards.scryfall.io/art_crop/back/0/f/0f6e668d-2502-4e82-b4c2-ef34c9afa27e.jpg",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample", "lifelink"],
  text: "Flying, trample, lifelink\nSacrifice another creature: Draw a card.",
  activated: [
    {
      // Cirith Ungol Patrol's "Sacrifice another creature".
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Sacrifice another creature: Draw a card.",
    },
  ],
  faces: ["Jerren, Corrupted Bishop", "Ormendahl, the Corrupter"],
  transform: true,
});
