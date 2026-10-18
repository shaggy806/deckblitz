import { defineCard } from "../define.js";

// EDHREC rank 27871.

export default defineCard({
  name: "Order of the Mirror",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 1,
  text: "{3}{W/P}: Transform this creature. Activate only as a sorcery. ({W/P} can be paid with either {W} or 2 life.)",
  activated: [
    {
      cost: { mana: "{3}{W/P}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{3}{W/P}: Transform this creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  faces: ["Order of the Mirror", "Order of the Alabaster Host"],
  transform: true,
});
