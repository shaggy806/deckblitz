import { defineCard } from "../define.js";

// EDHREC rank 20370. March of the Machine.

export default defineCard({
  name: "Aetherblade Agent",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  text: "Deathtouch\n{4}{U/P}: Transform this creature. Activate only as a sorcery. ({U/P} can be paid with either {U} or 2 life.)",
  activated: [
    {
      cost: { mana: "{4}{U/P}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{4}{U/P}: Transform this creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  faces: ["Aetherblade Agent", "Gitaxian Mindstinger"],
  transform: true,
});
