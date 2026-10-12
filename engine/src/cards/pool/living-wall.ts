import { defineCard } from "../define.js";

export default defineCard({
  name: "Living Wall",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 6,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\n{1}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}: Regenerate this creature.",
    },
  ],
});
