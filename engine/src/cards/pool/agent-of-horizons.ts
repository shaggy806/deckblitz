import { defineCard } from "../define.js";

export default defineCard({
  name: "Agent of Horizons",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 2,
  text: "{2}{U}: This creature can't be blocked this turn.",
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "unblockable",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{2}{U}: This creature can't be blocked this turn.",
    },
  ],
});
