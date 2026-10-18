import { defineCard } from "../define.js";

// EDHREC rank 21743.

export default defineCard({
  name: "Blightreaper Thallid",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 2,
  toughness: 2,
  text: "{3}{G/P}: Transform this creature. Activate only as a sorcery. ({G/P} can be paid with either {G} or 2 life.)",
  activated: [
    {
      cost: { mana: "{3}{G/P}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{3}{G/P}: Transform this creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  faces: ["Blightreaper Thallid", "Blightsower Thallid"],
  transform: true,
});
