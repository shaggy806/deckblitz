import { defineCard } from "../define.js";

export default defineCard({
  name: "Savage Packmate",
  art: "https://cards.scryfall.io/art_crop/back/c/b/cb168e3c-2c78-4e70-a39b-06aa6a47998c.jpg",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 5,
  toughness: 5,
  keywords: ["trample", "nightbound"],
  text: "Trample\nOther creatures you control get +1/+0.\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantPt: [1, 0],
      text: "Other creatures you control get +1/+0.",
    },
  ],
  faces: ["Child of the Pack", "Savage Packmate"],
  transform: true,
});
