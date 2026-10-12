import { defineCard } from "../define.js";

export default defineCard({
  name: "Ashiok's Skulker",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Nightmare"],
  power: 3,
  toughness: 5,
  text: "{3}{U}: This creature can't be blocked this turn.",
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "unblockable",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{3}{U}: This creature can't be blocked this turn.",
    },
  ],
});
