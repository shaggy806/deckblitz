import { defineCard } from "../define.js";

export default defineCard({
  name: "Wall of Bone",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Wall"],
  power: 1,
  toughness: 4,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\n{B}: Regenerate this creature. (The next time this creature would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate this creature.",
    },
  ],
});
