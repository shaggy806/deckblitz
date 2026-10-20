import { defineCard } from "../define.js";

// EDHREC rank 16680. The back face is Revealing Eye.

export default defineCard({
  name: "Concealing Curtains",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: "Defender\n{2}{B}: Transform this creature. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{2}{B}: Transform this creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  faces: ["Concealing Curtains", "Revealing Eye"],
  transform: true,
});
