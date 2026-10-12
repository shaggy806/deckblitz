import { defineCard } from "../define.js";

export default defineCard({
  name: "Incited Rabble",
  art: "https://cards.scryfall.io/art_crop/back/6/c/6c91ca3b-9d56-48dd-be0e-d3839c7d3d6c.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 3,
  text: "This creature attacks each combat if able.\n{2}: This creature gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{2}: This creature gets +1/+0 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
  faces: ["Town Gossipmonger", "Incited Rabble"],
  transform: true,
});
