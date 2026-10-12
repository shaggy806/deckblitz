import { defineCard } from "../define.js";

export default defineCard({
  name: "Wall of Brambles",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Wall"],
  power: 2,
  toughness: 3,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\n{G}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{G}: Regenerate this creature.",
    },
  ],
});
