import { defineCard } from "../define.js";

// EDHREC rank 24458. Front face of Ravenous Demon // Archdemon of Greed.

export default defineCard({
  name: "Ravenous Demon",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 4,
  toughness: 4,
  text: "Sacrifice a Human: Transform this creature. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Human" } } },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "Sacrifice a Human: Transform this creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  faces: ["Ravenous Demon", "Archdemon of Greed"],
  transform: true,
});
