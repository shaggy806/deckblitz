import { defineCard } from "../define.js";

/** The land back face of Grasping Shadows. */
export default defineCard({
  name: "Shadows' Lair",
  art: "https://cards.scryfall.io/art_crop/back/8/1/81b8b9c9-725d-476d-a3cf-55e3dc3e433d.jpg",
  colors: [],
  types: ["land"],
  subtypes: ["Cave"],
  text: "(Transforms from Grasping Shadows.)\n{T}: Add {B}.\n{B}, {T}, Remove a dread counter from this land: You draw a card and you lose 1 life.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}: Add {B}.",
    },
    {
      cost: { mana: "{B}", tap: true, removeCounter: { kind: "dread", count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "{B}, {T}, Remove a dread counter from this land: You draw a card and you lose 1 life.",
    },
  ],
  faces: ["Grasping Shadows", "Shadows' Lair"],
  transform: true,
});
