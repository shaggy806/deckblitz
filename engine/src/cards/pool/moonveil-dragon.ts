import { defineCard } from "../define.js";

// EDHREC rank 16133.

export default defineCard({
  name: "Moonveil Dragon",
  manaCost: "{3}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\n{R}: Each creature you control gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{R}: Each creature you control gets +1/+0 until end of turn.",
    },
  ],
});
