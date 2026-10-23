import { defineCard } from "../define.js";

// The back face of Neglected Heirloom.

export default defineCard({
  name: "Ashmouth Blade",
  art: "https://cards.scryfall.io/art_crop/back/7/8/7813cd70-bb60-4953-a35d-9876f5230c42.jpg",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +3/+3 and has first strike.\nEquip {3}",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      grantKeywords: ["first-strike"],
      text: "Equipped creature gets +3/+3 and has first strike.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
  faces: ["Neglected Heirloom", "Ashmouth Blade"],
  transform: true,
});
