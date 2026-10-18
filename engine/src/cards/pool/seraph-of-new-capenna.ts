import { defineCard } from "../define.js";

// EDHREC rank 26109. March of the Machine. Front face of Seraph of New
// Capenna // Seraph of New Phyrexia (Bonded Herdbeast's shape).

export default defineCard({
  name: "Seraph of New Capenna",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\n{4}{B/P}: Transform this creature. Activate only as a sorcery. ({B/P} can be paid with either {B} or 2 life.)",
  activated: [
    {
      cost: { mana: "{4}{B/P}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{4}{B/P}: Transform this creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  faces: ["Seraph of New Capenna", "Seraph of New Phyrexia"],
  transform: true,
});
