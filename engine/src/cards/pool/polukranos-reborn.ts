import { defineCard } from "../define.js";

// EDHREC rank 14132.

export default defineCard({
  name: "Polukranos Reborn",
  manaCost: "{G}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 4,
  toughness: 5,
  keywords: ["reach"],
  text: "Reach\n{6}{W/P}: Transform Polukranos Reborn. Activate only as a sorcery. ({W/P} can be paid with either {W} or 2 life.)",
  activated: [
    {
      cost: { mana: "{6}{W/P}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{6}{W/P}: Transform Polukranos Reborn. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  faces: ["Polukranos Reborn", "Polukranos, Engine of Ruin"],
  transform: true,
});
