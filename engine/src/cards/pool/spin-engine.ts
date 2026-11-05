import { defineCard } from "../define.js";

// EDHREC rank 31580.

export default defineCard({
  name: "Spin Engine",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 1,
  text: "{R}: Target creature can't block this creature this turn.",
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
