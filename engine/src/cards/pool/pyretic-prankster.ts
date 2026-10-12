import { defineCard } from "../define.js";

export default defineCard({
  name: "Pyretic Prankster",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 2,
  toughness: 1,
  text: "{3}{B/P}: Transform this creature. Activate only as a sorcery. ({B/P} can be paid with either {B} or 2 life.)",
  activated: [
    {
      cost: { mana: "{3}{B/P}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{3}{B/P}: Transform this creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  faces: ["Pyretic Prankster", "Glistening Goremonger"],
  transform: true,
});
