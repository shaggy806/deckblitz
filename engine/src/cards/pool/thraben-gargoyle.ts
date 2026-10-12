import { defineCard } from "../define.js";

export default defineCard({
  name: "Thraben Gargoyle",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Gargoyle"],
  power: 2,
  toughness: 2,
  keywords: ["defender"],
  text: "Defender\n{6}: Transform this creature.",
  activated: [
    {
      cost: { mana: "{6}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{6}: Transform this creature.",
    },
  ],
  faces: ["Thraben Gargoyle", "Stonewing Antagonizer"],
  transform: true,
});
