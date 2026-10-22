import { defineCard } from "../define.js";

// The back face of Vance's Blasting Cannons.
export default defineCard({
  name: "Spitfire Bastion",
  art: "https://cards.scryfall.io/art_crop/back/9/e/9e8c0009-787f-480b-84b6-bf297f1fb466.jpg",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: "(Transforms from Vance's Blasting Cannons.)\n{T}: Add {R}.\n{2}{R}, {T}: Spitfire Bastion deals 3 damage to any target.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "{T}: Add {R}.",
    },
    {
      cost: { mana: "{2}{R}", tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "{2}{R}, {T}: Spitfire Bastion deals 3 damage to any target.",
    },
  ],
  faces: ["Vance's Blasting Cannons", "Spitfire Bastion"],
  transform: true,
});
