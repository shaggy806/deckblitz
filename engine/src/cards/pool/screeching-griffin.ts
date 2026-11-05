import { defineCard } from "../define.js";

// EDHREC rank 32177.

export default defineCard({
  name: "Screeching Griffin",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\n{R}: Target creature can't block this creature this turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: [], cantBlockAttacker: "source" },
      resolve: null,
      text: "{R}: Target creature can't block this creature this turn.",
    },
  ],
});
