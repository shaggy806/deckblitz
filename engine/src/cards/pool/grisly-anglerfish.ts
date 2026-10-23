import { defineCard } from "../define.js";

export default defineCard({
  name: "Grisly Anglerfish",
  art: "https://cards.scryfall.io/art_crop/back/1/6/16c0bb08-36b3-41e2-a5a9-2fcd6bb49beb.jpg",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Fish"],
  power: 4,
  toughness: 5,
  text: "{6}: Creatures your opponents control attack this turn if able.",
  activated: [
    {
      cost: { mana: "{6}", tap: false },
      targets: [],
      effect: {
        kind: "restrict",
        filter: { type: "creature", controlledBy: "opponent" },
        restrictions: ["must-attack"],
      },
      resolve: null,
      text: "{6}: Creatures your opponents control attack this turn if able.",
    },
  ],
  faces: ["Grizzled Angler", "Grisly Anglerfish"],
  transform: true,
});
