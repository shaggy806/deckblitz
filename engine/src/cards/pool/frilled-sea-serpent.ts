import { defineCard } from "../define.js";

export default defineCard({
  name: "Frilled Sea Serpent",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 4,
  toughness: 6,
  text: "{5}{U}{U}: This creature can't be blocked this turn.",
  activated: [
    {
      cost: { mana: "{5}{U}{U}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "unblockable",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{5}{U}{U}: This creature can't be blocked this turn.",
    },
  ],
});
