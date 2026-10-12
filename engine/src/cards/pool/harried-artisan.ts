import { defineCard } from "../define.js";

export default defineCard({
  name: "Harried Artisan",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 3,
  keywords: ["haste"],
  text: "Haste\n{3}{W/P}: Transform this creature. Activate only as a sorcery. ({W/P} can be paid with either {W} or 2 life.)",
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
  faces: ["Harried Artisan", "Phyrexian Skyflayer"],
  transform: true,
});
