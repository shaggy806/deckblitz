import { defineCard } from "../define.js";

export default defineCard({
  name: "Carrion Wall",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 3,
  toughness: 2,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\n{1}{B}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{B}: Regenerate this creature.",
    },
  ],
});
