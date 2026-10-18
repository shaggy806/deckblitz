import { defineCard } from "../define.js";

// EDHREC rank 26427.

export default defineCard({
  name: "Captive Weird",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Weird"],
  power: 1,
  toughness: 3,
  keywords: ["defender"],
  text: "Defender\n{3}{R/P}: Transform this creature. Activate only as a sorcery. ({R/P} can be paid with either {R} or 2 life.)",
  activated: [
    {
      cost: { mana: "{3}{R/P}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{3}{R/P}: Transform this creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  faces: ["Captive Weird", "Compleated Conjurer"],
  transform: true,
});
