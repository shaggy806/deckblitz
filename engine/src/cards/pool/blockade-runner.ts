import { defineCard } from "../define.js";

export default defineCard({
  name: "Blockade Runner",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk"],
  power: 2,
  toughness: 2,
  text: "{U}: This creature can't be blocked this turn.",
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "unblockable",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{U}: This creature can't be blocked this turn.",
    },
  ],
});
