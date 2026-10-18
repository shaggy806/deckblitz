import { defineCard } from "../define.js";

// EDHREC rank 25573.

export default defineCard({
  name: "Skyclave Aerialist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{4}{G/P}: Transform this creature. Activate only as a sorcery. ({G/P} can be paid with either {G} or 2 life.)",
  activated: [
    {
      cost: { mana: "{4}{G/P}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{4}{G/P}: Transform this creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  faces: ["Skyclave Aerialist", "Skyclave Invader"],
  transform: true,
});
